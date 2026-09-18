<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Therapist;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TherapistController extends Controller
{
    public function index()
    {
        return response()->json(['therapists' => Therapist::orderByDesc('id')->get()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('therapists', 'name')],
            'phone' => 'nullable|string|max:20',
            'specialty' => 'nullable|string|max:255',
            'experience_years' => 'nullable|integer|min:0',
            'status' => 'required|in:Active,Inactive',
        ]);

        $therapist = Therapist::create($validated);
        return response()->json(['message' => 'Terapis ditambahkan.', 'therapist' => $therapist], 201);
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('therapists', 'name')->ignore($id)],
            'phone' => 'nullable|string|max:20',
            'specialty' => 'nullable|string|max:255',
            'experience_years' => 'nullable|integer|min:0',
            'status' => 'required|in:Active,Inactive',
        ]);

        $therapist = Therapist::findOrFail($id);
        $therapist->update($validated);

        return response()->json(['message' => 'Terapis diperbarui.', 'therapist' => $therapist]);
    }

    public function destroy(int $id)
    {
        $therapist = Therapist::findOrFail($id);
        $therapist->delete();

        return response()->json(['message' => 'Terapis dihapus.']);
    }
}