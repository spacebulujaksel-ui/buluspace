<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\AppointmentDetail;
use App\Models\BlockedSlot;
use App\Models\Branch;
use App\Models\Service;
use App\Models\Therapist;
use App\Services\BookingMailer;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class BookingController extends Controller
{
    private const MALE_SURCHARGE_PER_TREATMENT = 7000;

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:100',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'required|email|max:150',
            'customer_gender' => 'required|in:Pria,Wanita',
            'therapist_id' => 'nullable|exists:therapists,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'service_ids' => 'required|array|min:1',
            'service_ids.*' => 'exists:services,id',
            'location' => 'nullable|string|max:150',
            'notes' => 'nullable|string',
        ]);

        $services = Service::whereIn('id', $validated['service_ids'])->where('status', 'Active')->get();
        if ($services->count() !== count($validated['service_ids'])) {
            return response()->json(['message' => 'Terdapat layanan yang tidak valid.'], 422);
        }

        $combinationError = $this->combinationErrorMessage($services->values());
        if ($combinationError) {
            return response()->json(['message' => $combinationError], 422);
        }

        if ($validated['customer_gender'] === 'Pria' && $services->contains(fn (Service $s) => $s->category === 'intimate')) {
            return response()->json(['message' => 'Layanan intimate hanya untuk wanita.'], 422);
        }

        $cutoffService = $services->filter(fn (Service $s) => !empty($s->last_order_time))
            ->sortBy('last_order_time')
            ->first();

        if ($cutoffService) {
            $cutoffHm = substr($cutoffService->last_order_time, 0, 5);
            $startHm = substr($validated['start_time'], 0, 5);

            if ($startHm > $cutoffHm) {
                return response()->json([
                    'message' => $cutoffService->name.' hanya bisa dipesan sampai pukul '.$cutoffHm.'.',
                ], 422);
            }
        }

        $maleSurcharge = $validated['customer_gender'] === 'Pria'
            ? self::MALE_SURCHARGE_PER_TREATMENT * count($validated['service_ids'])
            : 0;

        $totalMinutes = $services->sum('duration_minutes');
        $totalPrice = $services->sum(fn ($s) => (float) $s->price) + $maleSurcharge;

        $start = Carbon::parse($validated['appointment_date'].' '.$validated['start_time']);
        $end = $start->copy()->addMinutes($totalMinutes);

        if ($start->isToday() && $start->lt(now()->copy()->addMinutes(30))) {
            return response()->json([
                'message' => 'Booking untuk hari ini minimal H-30 menit sebelum waktu treatment.',
            ], 422);
        }

        // Guardian: branch capacity = rooms_count minus distinct rooms blocked in this window.
        $branch = $validated['location']
            ? Branch::where('name', $validated['location'])->first()
            : null;

        if ($branch) {
            $overlaps = fn (Appointment $apt) => $start->lt(Carbon::parse($apt->appointment_date->format('Y-m-d').' '.$apt->end_time))
                && $end->gt(Carbon::parse($apt->appointment_date->format('Y-m-d').' '.$apt->start_time));

            $dayBookings = Appointment::where('location', $branch->name)
                ->whereDate('appointment_date', $validated['appointment_date'])
                ->whereIn('status', ['Pending', 'Confirmed'])
                ->get();

            $blockedRoomsCount = BlockedSlot::where('branch_id', $branch->id)
                ->whereDate('date', $validated['appointment_date'])
                ->get()
                ->filter(fn (BlockedSlot $b) => $start->lt(Carbon::parse($b->date.' '.$b->end_time))
                    && $end->gt(Carbon::parse($b->date.' '.$b->start_time)))
                ->pluck('room_number')
                ->unique()
                ->count();

            $available = $branch->rooms_count - $blockedRoomsCount;

            if ($available <= 0) {
                return response()->json([
                    'message' => 'Semua ruang di cabang '.$branch->name.' sedang ditutup pada jam tersebut. Silakan pilih jam lain.',
                    'full' => true,
                ], 422);
            }

            if ($dayBookings->filter($overlaps)->count() >= $available) {
                return response()->json([
                    'message' => 'Seluruh ruang di cabang '.$branch->name.' sudah penuh pada jam tersebut. Silakan pilih jam lain.',
                    'full' => true,
                ], 422);
            }
        }

        // Resolve therapist: specific pick or auto-assign first free active one.
        if (!empty($validated['therapist_id'])) {
            $therapist = Therapist::findOrFail($validated['therapist_id']);

            if ($therapist->status !== 'Active') {
                return response()->json(['message' => 'Terapis sedang tidak aktif. Silakan pilih terapis lain.'], 422);
            }

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
        } else {
            $candidates = Therapist::where('status', 'Active')
                ->when($branch, fn ($q) => $q->where('branch_id', $branch->id))
                ->get()
                ->filter(function (Therapist $t) use ($start, $end) {
                    $busy = Appointment::where('therapist_id', $t->id)
                        ->whereDate('appointment_date', $start->toDateString())
                        ->whereIn('status', ['Pending', 'Confirmed'])
                        ->get()
                        ->first(function (Appointment $apt) use ($start, $end) {
                            $aptStart = Carbon::parse($apt->appointment_date->format('Y-m-d').' '.$apt->start_time);
                            $aptEnd = Carbon::parse($apt->appointment_date->format('Y-m-d').' '.$apt->end_time);
                            return $start->lt($aptEnd) && $end->gt($aptStart);
                        });

                    return $busy === null;
                })
                ->values();

            $therapist = $candidates->isNotEmpty() ? $candidates->random() : null;

            if (!$therapist) {
                $scope = $branch ? ' di cabang '.$branch->name : '';

                return response()->json([
                    'message' => 'Tidak ada terapis tersedia'.$scope.' pada jam tersebut. Silakan pilih jam lain.',
                    'full' => true,
                ], 422);
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
            'status' => 'Confirmed',
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'customer_email' => $validated['customer_email'],
            'customer_gender' => $validated['customer_gender'],
            'location' => $validated['location'] ?? null,
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

        $booking->load(['therapist', 'details.service']);
        BookingMailer::toCustomer($booking, 'booking_confirmation');
        BookingMailer::toAdmin($booking);

        return response()->json([
            'message' => 'Booking berhasil dibuat.',
            'booking' => $booking,
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
                'message' => 'Booking tidak dapat dibatalkan karena status sudah tidak aktif.',
                'cutoff_passed' => true,
            ], 422);
        }

        $appointment->status = 'Cancelled';
        $appointment->cancel_reason = $validated['reason'] ?? null;
        $appointment->save();

        return response()->json(['message' => 'Booking berhasil dibatalkan.', 'booking' => $appointment]);
    }

    private function combinationErrorMessage(Collection $services): ?string
    {
        if ($services->count() < 2) {
            return null;
        }

        $full = collect(['Full Legs', 'Full Arms', 'Full Front', 'Full Back']);
        $names = $services->pluck('name');

        if ($names->contains('Brazilian')) {
            $bad = $services->first(fn (Service $s) => $s->category === 'package' || $full->contains($s->name));

            return $bad ? "Brazilian tidak bisa digabung dengan {$bad->name}." : null;
        }

        if ($names->contains('Feel Smooth')) {
            $bad = $services->first(fn (Service $s) => $s->name !== 'Feel Smooth'
                && ((int) $s->duration_minutes < 10 || (int) $s->duration_minutes > 15));

            return $bad ? 'Feel Smooth hanya bisa digabung dengan treatment 10–15 menit.' : null;
        }

        $fullIn = $names->intersect($full);
        if ($fullIn->isNotEmpty()) {
            return "{$fullIn->first()} hanya bisa dipilih sendiri.";
        }

        $pkg = $services->first(fn (Service $s) => $s->category === 'package');

        return $pkg ? "{$pkg->name} hanya bisa dipilih sendiri." : null;
    }

    private function generateCode(): string
    {
        do {
            $code = 'BS-'.str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        } while (Appointment::where('booking_code', $code)->exists());

        return $code;
    }
}