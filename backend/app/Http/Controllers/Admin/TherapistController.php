<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Therapist;
use App\Models\TherapistLeave;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TherapistController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(['therapists' => Therapist::with('leaves')->where('branch_id', $request->user()->branch_id)->orderByDesc('id')->get()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('therapists', 'name')],
            'experience_years' => 'nullable|integer|min:0',
            'status' => 'required|in:Active,Inactive',
        ]);

        $validated['branch_id'] = $request->user()->branch_id;
        $therapist = Therapist::create($validated);
        return response()->json(['message' => 'Terapis ditambahkan.', 'therapist' => $therapist], 201);
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('therapists', 'name')->ignore($id)],
            'experience_years' => 'nullable|integer|min:0',
            'status' => 'required|in:Active,Inactive',
        ]);

        $therapist = Therapist::findOrFail($id);
        $therapist->update($validated);

        return response()->json(['message' => 'Terapis diperbarui.', 'therapist' => $therapist]);
    }

    public function storeLeave(Request $request, int $id)
    {
        $therapist = $this->scoped($id);

        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $leave = TherapistLeave::create([
            'therapist_id' => $therapist->id,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
        ]);

        if ($therapist->status === 'Active' && $therapist->isOnLeaveOn(today())) {
            $therapist->update(['status' => 'Inactive']);
        }

        return response()->json(['message' => 'Jadwal cuti ditambahkan.', 'leave' => $leave], 201);
    }

    public function destroyLeave(Request $request, int $id, int $leaveId)
    {
        $therapist = $this->scoped($id);

        $leave = TherapistLeave::where('therapist_id', $therapist->id)->findOrFail($leaveId);
        $leave->delete();

        return response()->json(['message' => 'Jadwal cuti dihapus.']);
    }

    public function destroy(int $id)
    {
        $therapist = Therapist::findOrFail($id);
        $therapist->delete();

        return response()->json(['message' => 'Terapis dihapus.']);
    }

    private function scoped(int $id): Therapist
    {
        return Therapist::where('branch_id', request()->user()->branch_id)->findOrFail($id);
    }
}