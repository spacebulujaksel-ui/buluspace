<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promo;
use Illuminate\Http\Request;

class PromoController extends Controller
{
    public function index(Request $request)
    {
        return Promo::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(function (Promo $p) use ($request) {
                if ($p->image) {
                    $path = $p->image;
                    if (!str_starts_with($path, 'http://') && !str_starts_with($path, 'https://')) {
                        $path = $request->getSchemeAndHttpHost().'/'.ltrim($path, '/');
                    }
                    $p->setAttribute('image', $path);
                }
                return $p;
            });
    }
}