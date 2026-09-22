<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\BlockedSlot;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
        ]);

        $branch = $request->user()->branch;
        $date = $validated['date'];

        $bookings = Appointment::with(['therapist', 'details.service'])
            ->where('location', $branch->name)
            ->whereDate('appointment_date', $date)
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->orderBy('start_time')
            ->get();

        $blocked = BlockedSlot::where('branch_id', $branch->id)
            ->whereDate('date', $date)
            ->orderBy('start_time')
            ->get(['id', 'room_number', 'start_time', 'end_time', 'note']);

        return response()->json([
            'branch' => $branch,
            'rooms_count' => $branch->rooms_count,
            'bookings' => $bookings,
            'blocked' => $blocked,
        ]);
    }

    public function storeBlock(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'room_number' => 'required|integer|min:1',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'note' => 'nullable|string|max:255',
        ]);

        $branch = $request->user()->branch;
        $room = (int) $validated['room_number'];

        if ($room > $branch->rooms_count) {
            return response()->json(['message' => 'Nomor ruang tidak valid untuk cabang ini.'], 422);
        }

        $start = Carbon::parse($validated['date'].' '.$validated['start_time']);
        $end = Carbon::parse($validated['date'].' '.$validated['end_time']);

        $overlap = BlockedSlot::where('branch_id', $branch->id)
            ->where('room_number', $room)
            ->whereDate('date', $validated['date'])
            ->get()
            ->first(fn (BlockedSlot $b) => $start->lt(Carbon::parse($b->date.' '.$b->end_time))
                && $end->gt(Carbon::parse($b->date.' '.$b->start_time)));

        if ($overlap) {
            return response()->json(['message' => "Ruang {$room} pada rentang jam tersebut sudah ada yang diblokir."], 422);
        }

        $blocked = BlockedSlot::create([
            'branch_id' => $branch->id,
            'room_number' => $room,
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'note' => $validated['note'] ?? null,
        ]);

        return response()->json(['message' => "Ruang {$room} diblokir.", 'blocked' => $blocked], 201);
    }

    public function destroyBlock(Request $request, int $id)
    {
        BlockedSlot::where('branch_id', $request->user()->branch_id)->whereKey($id)->delete();

        return response()->json(['message' => 'Blokir jam dihapus.']);
    }
}