<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PromoController extends Controller
{
    private function withImageUrl(Promo $promo, Request $request): Promo
    {
        if ($promo->image) {
            $path = $promo->image;
            if (!str_starts_with($path, 'http://') && !str_starts_with($path, 'https://')) {
                $path = $request->getSchemeAndHttpHost().'/'.ltrim($path, '/');
            }
            $promo->setAttribute('image', $path);
        }
        return $promo;
    }

    private function listWithImageUrl($promos, Request $request)
    {
        return $promos->map(fn (Promo $p) => $this->withImageUrl($p, $request));
    }

    private function validationRules(): array
    {
        return [
            'tag' => 'required|string|max:50',
            'title' => 'required|string|max:150',
            'highlight_text' => 'nullable|string|max:150',
            'description' => 'nullable|string',
            'discount_badge' => 'nullable|string|max:50',
            'valid_until' => 'nullable|date',
            'cta_text' => 'nullable|string|max:80',
            'promo_code' => 'nullable|string|max:30',
            'bg_gradient' => 'nullable|string|max:120',
            'accent_color' => 'nullable|string|max:20',
            'image' => 'nullable|image|mimes:jpeg,png,webp|max:4096',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ];
    }

    public function index(Request $request)
    {
        return response()->json(['promos' => $this->listWithImageUrl(Promo::orderBy('sort_order')->get(), $request)]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->validationRules());
        unset($validated['image']);

        $promo = Promo::create($validated);

        if ($request->hasFile('image')) {
            $promo->image = '/storage/'.$request->file('image')->store('promos', 'public');
            $promo->save();
        }

        return response()->json(['message' => 'Promo ditambahkan.', 'promo' => $this->withImageUrl($promo, $request)], 201);
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate($this->validationRules());
        unset($validated['image']);
        $promo = Promo::findOrFail($id);

        if ($request->hasFile('image')) {
            if ($promo->image) {
                Storage::disk('public')->delete(Str::after($promo->image, '/storage/'));
            }
            $promo->image = '/storage/'.$request->file('image')->store('promos', 'public');
        }

        $promo->fill($validated);
        $promo->save();

        return response()->json(['message' => 'Promo diperbarui.', 'promo' => $this->withImageUrl($promo, $request)]);
    }

    public function destroy(int $id)
    {
        $promo = Promo::findOrFail($id);

        if ($promo->image) {
            Storage::disk('public')->delete(Str::after($promo->image, '/storage/'));
        }

        $promo->delete();

        return response()->json(['message' => 'Promo dihapus.']);
    }
}