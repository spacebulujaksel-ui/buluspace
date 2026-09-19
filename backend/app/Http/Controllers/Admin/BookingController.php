<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Services\BookingMailer;
use Illuminate\Http\Request;

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

        if (in_array($validated['status'], ['Cancelled', 'Rejected']) && !empty($validated['cancel_reason'])) {
            $appointment->cancel_reason = $validated['cancel_reason'];
        }

        $appointment->status = $validated['status'];
        $appointment->save();
        $appointment->load(['therapist', 'details.service']);

        if ($appointment->status === 'Completed') {
            BookingMailer::toCustomer($appointment, 'aftercare');
        }

        return response()->json(['message' => 'Status booking diperbarui.', 'booking' => $appointment]);
    }
}