<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Branch;
use App\Models\Review;
use App\Models\Service;
use App\Models\Therapist;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function services()
    {
        return Service::where('status', 'Active')->orderBy('category')->orderBy('name')->get();
    }

    public function therapists()
    {
        return Therapist::where('status', 'Active')->get();
    }

    public function reviews()
    {
        return Review::with(['appointment.therapist', 'user'])
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'client_name' => $r->user?->name ?? 'Customer',
                'therapist_name' => $r->appointment?->therapist?->name,
                'rating' => $r->rating,
                'comment' => $r->comment,
                'created_at' => $r->created_at,
            ]);
    }

    public function branches()
    {
        return Branch::orderBy('sort_order')->get(['id', 'name', 'address', 'rooms_count']);
    }

    public function scheduleBoard(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
        ]);

        $board = Appointment::with(['therapist:id,name', 'details.service:id,name'])
            ->whereDate('appointment_date', $validated['date'])
            ->whereIn('status', ['Confirmed', 'Completed'])
            ->orderBy('start_time')
            ->get()
            ->map(fn (Appointment $apt) => [
                'id' => $apt->id,
                'branch' => $apt->location,
                'start_time' => $apt->start_time,
                'end_time' => $apt->end_time,
                'status' => $apt->status,
                'therapist' => $apt->therapist?->name,
                'services' => $apt->details->map(fn ($d) => $d->service?->name ?? 'Layanan #'.$d->service_id)->values(),
            ]);

        return response()->json(['board' => $board]);
    }

    public function availability(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'location' => 'nullable|string|max:150',
        ]);

        $query = Appointment::whereDate('appointment_date', $validated['date'])
            ->whereIn('status', ['Pending', 'Confirmed']);

        if (!empty($validated['location'])) {
            $query->where('location', $validated['location']);
        }

        $booked = $query->get(['therapist_id', 'start_time', 'end_time', 'room_number']);

        $rooms = Branch::orderBy('sort_order')->pluck('rooms_count', 'name');

        $blocked = [];
        $branch = $validated['location'] ? Branch::where('name', $validated['location'])->first() : null;
        if ($branch) {
            $blocked = \App\Models\BlockedSlot::where('branch_id', $branch->id)
                ->whereDate('date', $validated['date'])
                ->orderBy('start_time')
                ->get(['room_number', 'start_time', 'end_time']);
        }

        return response()->json(['booked' => $booked, 'rooms' => $rooms, 'blocked' => $blocked]);
    }
}