<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\AppointmentDetail;
use App\Models\Service;
use App\Services\BookingDuration;
use App\Services\BookingMailer;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class BookingController extends Controller
{
    private function branchName(Request $request): string
    {
        return $request->user()->branch->name;
    }

    public function index(Request $request)
    {
        $query = Appointment::with(['therapist', 'details.service'])
            ->where('location', $this->branchName($request));

        if ($request->has('status') && $request->input('status') !== 'All') {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('search') && $request->input('search') !== '') {
            $q = $request->input('search');
            $query->where(function ($w) use ($q) {
                $w->where('customer_name', 'like', "%{$q}%")
                    ->orWhere('booking_code', 'like', "%{$q}%");
            });
        }

        $bookings = $query->orderByDesc('id')->get();

        return response()->json(['bookings' => $bookings]);
    }

    public function show(Request $request, int $id)
    {
        $appointment = Appointment::with(['therapist', 'details.service', 'user'])
            ->where('location', $this->branchName($request))
            ->findOrFail($id);
        return response()->json(['booking' => $appointment]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:Confirmed,Completed,Cancelled,Rejected',
            'cancel_reason' => 'nullable|string|max:500',
        ]);

        $appointment = Appointment::where('location', $this->branchName($request))->findOrFail($id);

        $statusChanged = $appointment->status !== $validated['status'];

        if (in_array($validated['status'], ['Cancelled', 'Rejected']) && !empty($validated['cancel_reason'])) {
            $appointment->cancel_reason = $validated['cancel_reason'];
        }

        $appointment->status = $validated['status'];
        $appointment->save();
        $appointment->load(['therapist', 'details.service']);

        if ($statusChanged && in_array($validated['status'], ['Cancelled', 'Rejected'])) {
            BookingMailer::toCustomer($appointment, 'booking_cancelled_by_studio');
        }

        // ponytail: email aftercare (tata cara treatment) dinonaktifkan sementara — uncomment blok di bawah untuk mengaktifkan lagi.
        // if ($appointment->status === 'Completed') {
        //     BookingMailer::toCustomer($appointment, 'aftercare');
        // }

        return response()->json(['message' => 'Status booking diperbarui.', 'booking' => $appointment]);
    }

    public function updateServices(Request $request, int $id)
    {
        $validated = $request->validate([
            'service_ids' => 'required|array|min:1',
            'service_ids.*' => 'exists:services,id',
        ]);

        $appointment = Appointment::with('details.service')
            ->where('location', $this->branchName($request))
            ->findOrFail($id);

        if ($appointment->status !== 'Confirmed') {
            return response()->json(['message' => 'Hanya booking berstatus Confirmed yang bisa diedit layanannya.'], 422);
        }

        $services = Service::whereIn('id', $validated['service_ids'])
            ->where('status', 'Active')
            ->get();

        if ($services->count() !== count($validated['service_ids'])) {
            return response()->json(['message' => 'Terdapat layanan yang tidak valid.'], 422);
        }

        if ($appointment->customer_gender === 'Pria' && $services->contains(fn (Service $s) => $s->category === 'intimate')) {
            return response()->json(['message' => 'Layanan intimate hanya untuk wanita.'], 422);
        }

        $totalMinutes = BookingDuration::totalMinutes($services);

        $slotStart = BookingDuration::minutesOf($appointment->start_time);
        $slotEnd = BookingDuration::minutesOf($appointment->end_time);
        $slotMinutes = $slotEnd - $slotStart;

        // Tidak boleh lebih dari slot; boleh kurang (end_time ikut digeser).
        if ($totalMinutes > $slotMinutes) {
            return response()->json([
                'message' => "Total durasi layanan ({$totalMinutes} menit) melebihi slot booking saat ini ({$slotMinutes} menit).",
            ], 422);
        }

        $maleSurcharge = $appointment->customer_gender === 'Pria'
            ? 7000 * count($validated['service_ids'])
            : 0;
        $totalPrice = $services->sum(fn (Service $s) => (float) $s->price) + $maleSurcharge;

        AppointmentDetail::where('appointment_id', $appointment->id)->delete();

        foreach ($services as $service) {
            AppointmentDetail::create([
                'appointment_id' => $appointment->id,
                'service_id' => $service->id,
                'quantity' => 1,
                'price' => $service->price,
            ]);
        }

        $appointment->end_time = substr(BookingDuration::timeOf($slotStart + $totalMinutes), 0, 5);
        $appointment->total_price = $totalPrice;
        $appointment->save();
        $appointment->load(['therapist', 'details.service']);

        return response()->json(['message' => 'Layanan booking diperbarui.', 'booking' => $appointment]);
    }
}