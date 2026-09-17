<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        return response()->json(['services' => Service::orderBy('category')->orderBy('name')->get()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_minutes' => 'required|integer|min:1',
            'category' => 'required|string|max:30',
            'wax_type' => 'nullable|string|max:80',
            'status' => 'required|in:Active,Inactive',
        ]);

        $service = Service::create($validated);
        return response()->json(['message' => 'Layanan ditambahkan.', 'service' => $service], 201);
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_minutes' => 'required|integer|min:1',
            'category' => 'required|string|max:30',
            'wax_type' => 'nullable|string|max:80',
            'status' => 'required|in:Active,Inactive',
        ]);

        $service = Service::findOrFail($id);
        $service->update($validated);

        return response()->json(['message' => 'Layanan diperbarui.', 'service' => $service]);
    }

    public function destroy(int $id)
    {
        $service = Service::findOrFail($id);
        $service->delete();

        return response()->json(['message' => 'Layanan dihapus.']);
    }
}