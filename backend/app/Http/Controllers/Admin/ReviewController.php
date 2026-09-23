<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $branchName = $request->user()->branch->name;

        $reviews = Review::with(['user', 'appointment.therapist'])
            ->whereHas('appointment', fn ($q) => $q->where('location', $branchName))
            ->orderByDesc('id')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'user_id' => $r->user_id,
                'customer_name' => $r->user?->name ?? 'Customer',
                'appointment_id' => $r->appointment_id,
                'rating' => $r->rating,
                'comment' => $r->comment,
                'created_at' => $r->created_at,
                'therapist_name' => $r->appointment?->therapist_display,
            ]);

        $total = Review::whereHas('appointment', fn ($q) => $q->where('location', $branchName))->count();
        $avg = $total > 0 ? round(Review::whereHas('appointment', fn ($q) => $q->where('location', $branchName))->avg('rating'), 1) : 0;
        $fiveStar = Review::whereHas('appointment', fn ($q) => $q->where('location', $branchName))->where('rating', 5)->count();

        return response()->json([
            'reviews' => $reviews,
            'stats' => [
                'total' => $total,
                'avg_rating' => $avg,
                'five_star' => $fiveStar,
            ],
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $branchName = $request->user()->branch->name;
        $review = Review::whereHas('appointment', fn ($q) => $q->where('location', $branchName))->findOrFail($id);
        $review->delete();

        return response()->json(['message' => 'Ulasan dihapus.']);
    }
}