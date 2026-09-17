<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WalkIn;
use Illuminate\Http\Request;

class WalkInController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'nullable|date',
            'customer_name' => 'required|string|max:100',
        ]);

        $walkIn = WalkIn::create([
            'branch_id' => $request->user()->branch_id,
            'date' => $validated['date'] ?? now()->toDateString(),
            'customer_name' => $validated['customer_name'],
        ]);

        return response()->json(['message' => 'Customer offline ditambahkan.', 'walk_in' => $walkIn], 201);
    }

    public function destroy(Request $request, int $id)
    {
        $walkIn = WalkIn::where('branch_id', $request->user()->branch_id)->findOrFail($id);
        $walkIn->delete();

        return response()->json(['message' => 'Customer offline dihapus.']);
    }
}