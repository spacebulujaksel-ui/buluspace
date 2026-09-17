<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\AppointmentDetail;
use App\Models\BlockedSlot;
use App\Models\Branch;
use App\Models\Service;
use App\Models\Therapist;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:100',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'required|email|max:150',
            'therapist_id' => 'required|exists:therapists,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'service_ids' => 'required|array|min:1',
            'service_ids.*' => 'exists:services,id',
            'location' => 'nullable|string|max:150',
            'room_type' => 'nullable|string|max:30',
            'notes' => 'nullable|string',
        ]);

        $therapist = Therapist::findOrFail($validated['therapist_id']);
        if ($therapist->status !== 'Active') {
            return response()->json(['message' => 'Terapis sedang tidak aktif. Silakan pilih terapis lain.'], 422);
        }

        $services = Service::whereIn('id', $validated['service_ids'])->where('status', 'Active')->get();
        if ($services->count() !== count($validated['service_ids'])) {
            return response()->json(['message' => 'Terdapat layanan yang tidak valid.'], 422);
        }

        $totalMinutes = $services->sum('duration_minutes');
        $totalPrice = $services->sum(fn ($s) => (float) $s->price);

        $start = Carbon::parse($validated['appointment_date'].' '.$validated['start_time']);
        $end = $start->copy()->addMinutes($totalMinutes);

        // Conflict check: therapist has overlapping non-cancelled appointment
        $conflict = Appointment::where('therapist_id', $therapist->id)
            ->whereDate('appointment_date', $validated['appointment_date'])
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->get()
            ->first(function (Appointment $apt) use ($start, $end) {
                $aptStart = Carbon::parse($apt->appointment_date->format('Y-m-d').' '.$apt->start_time);
                $aptEnd = Carbon::parse($apt->appointment_date->format('Y-m-d').' '.$apt->end_time);
                return $start->lt($aptEnd) && $end->gt($aptStart);
            });

        if ($conflict) {
            return response()->json([
                'message' => 'Slot jam tersebut baru saja terambil untuk terapis ini. Silakan pilih jam lain.',
                'conflict' => true,
            ], 409);
        }

        // Room capacity check per branch (location)
        $branch = $validated['location']
            ? Branch::where('name', $validated['location'])->first()
            : null;

        $roomNumber = null;

        if ($branch) {
            $dayBookings = Appointment::where('location', $branch->name)
                ->whereDate('appointment_date', $validated['appointment_date'])
                ->whereIn('status', ['Pending', 'Confirmed'])
                ->get();

            $overlapsWindow = fn (Appointment $apt) => $start->lt(Carbon::parse($apt->appointment_date->format('Y-m-d').' '.$apt->end_time))
                && $end->gt(Carbon::parse($apt->appointment_date->format('Y-m-d').' '.$apt->start_time));

            if ($dayBookings->filter($overlapsWindow)->count() >= $branch->rooms_count) {
                return response()->json([
                    'message' => 'Semua kamar di cabang '.$branch->name.' sudah penuh pada jam tersebut. Silakan pilih jam lain.',
                    'full' => true,
                ], 422);
            }

            // Blocked slots for the date (per room)
            $blocks = BlockedSlot::where('branch_id', $branch->id)
                ->whereDate('date', $validated['appointment_date'])
                ->get();

            $isBlocked = fn (int $room) => $blocks->contains(fn (BlockedSlot $b) => $b->room_number === $room
                && $start->lt(Carbon::parse($b->date.' '.$b->end_time))
                && $end->gt(Carbon::parse($b->date.' '.$b->start_time)));

            // Auto-assign first free room (skip booked & blocked)
            $allBlocked = true;
            for ($room = 1; $room <= $branch->rooms_count; $room++) {
                $taken = $dayBookings->first(fn (Appointment $apt) => $apt->room_number === $room && $overlapsWindow($apt));
                if ($isBlocked($room)) {
                    continue;
                }
                $allBlocked = false;
                if (!$taken) {
                    $roomNumber = $room;
                    break;
                }
            }

            if (!$roomNumber) {
                $message = $allBlocked
                    ? 'Jam tersebut sedang ditutup di cabang '.$branch->name.'. Silakan pilih jam lain.'
                    : 'Tidak ada ruang kosong pada jam tersebut di cabang '.$branch->name.'.';
                return response()->json(['message' => $message, 'full' => true], 422);
            }
        }

        $user = $request->user();

        $booking = Appointment::create([
            'booking_code' => $this->generateCode(),
            'user_id' => $user?->id,
            'therapist_id' => $therapist->id,
            'appointment_date' => $validated['appointment_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $end->format('H:i'),
            'status' => 'Pending',
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'customer_email' => $validated['customer_email'],
            'location' => $validated['location'] ?? null,
            'room_type' => $validated['room_type'] ?? null,
            'room_number' => $roomNumber,
            'notes' => $validated['notes'] ?? null,
            'total_price' => $totalPrice,
        ]);

        foreach ($services as $service) {
            AppointmentDetail::create([
                'appointment_id' => $booking->id,
                'service_id' => $service->id,
                'quantity' => 1,
                'price' => $service->price,
            ]);
        }

        return response()->json([
            'message' => 'Booking berhasil dibuat.',
            'booking' => $booking->load(['therapist', 'services', 'details.service']),
        ], 201);
    }

    public function show(Request $request, string $code)
    {
        $appointment = Appointment::where('booking_code', $code)
            ->with(['therapist', 'services', 'details.service'])
            ->first();

        if (!$appointment) {
            return response()->json(['message' => 'Kode booking tidak ditemukan.'], 404);
        }

        // Allow if code only (guest tracking), phone optional verification
        return response()->json(['booking' => $appointment]);
    }

    public function cancel(Request $request, string $code)
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
            'customer_phone' => 'nullable|string|max:20',
        ]);

        $appointment = Appointment::where('booking_code', $code)->first();

        if (!$appointment) {
            return response()->json(['message' => 'Kode booking tidak ditemukan.'], 404);
        }

        // Verify phone if provided (prevents others cancelling)
        if (!empty($validated['customer_phone']) &&
            $appointment->customer_phone !== $validated['customer_phone']) {
            return response()->json(['message' => 'Verifikasi gagal: nomor WhatsApp tidak cocok dengan booking.'], 403);
        }

        if (!in_array($appointment->status, ['Pending', 'Confirmed'])) {
            $st = strtolower($appointment->status);
            return response()->json(["message" => "Booking tidak dapat dibatalkan karena berstatus {$st}."], 422);
        }

        if (!$appointment->canCancel()) {
            return response()->json([
                'message' => 'Sudah melewati batas H-1 pembatalan. Silakan hubungi admin via WhatsApp untuk pembatalan.',
                'cutoff_passed' => true,
            ], 422);
        }

        $appointment->status = 'Cancelled';
        $appointment->cancel_reason = $validated['reason'] ?? null;
        $appointment->save();

        return response()->json(['message' => 'Booking berhasil dibatalkan.', 'booking' => $appointment]);
    }

    private function generateCode(): string
    {
        do {
            $code = 'BS-'.str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        } while (Appointment::where('booking_code', $code)->exists());

        return $code;
    }
}