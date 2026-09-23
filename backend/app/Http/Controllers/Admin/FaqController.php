<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function index()
    {
        return response()->json(['faqs' => Faq::orderBy('id')->get()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:500',
            'answer' => 'required|string',
            'is_active' => 'required|boolean',
        ]);

        $faq = Faq::create($validated);

        return response()->json(['faq' => $faq], 201);
    }

    public function update(Request $request, int $id)
    {
        $faq = Faq::findOrFail($id);

        $validated = $request->validate([
            'question' => 'required|string|max:500',
            'answer' => 'required|string',
            'is_active' => 'required|boolean',
        ]);

        $faq->update($validated);

        return response()->json(['faq' => $faq]);
    }

    public function destroy(int $id)
    {
        Faq::findOrFail($id)->delete();

        return response()->json(['message' => 'FAQ dihapus.']);
    }
}