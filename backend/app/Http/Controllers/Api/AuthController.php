<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'branch_id' => 'required|integer|exists:branches,id',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Email atau password salah.'], 401);
        }

        if ($user->role !== 'Admin') {
            return response()->json(['message' => 'Akun ini tidak memiliki akses admin.'], 403);
        }

        if ((int) $user->branch_id !== (int) $validated['branch_id']) {
            return response()->json(['message' => 'Akun admin ini tidak terdaftar di cabang tersebut.'], 403);
        }

        $token = $user->createToken('admin-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'branch' => $user->branch,
            ],
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'branch' => $user->branch,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()?->tokens()->delete();
        return response()->json(['message' => 'Logged out']);
    }
}