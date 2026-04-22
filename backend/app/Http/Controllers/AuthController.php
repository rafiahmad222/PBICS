<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\DataKaryawan;

class AuthController extends Controller
{
    /**
     * Login API untuk Karyawan
     */
    public function login(Request $request)
    {
        $request->validate([
            'Username' => 'required|string',
            'Password' => 'required|string',
        ]);

        $karyawan = DataKaryawan::where('Username', $request->Username)->first();

        if (!$karyawan || !Hash::check($request->Password, $karyawan->Password)) {
            return response()->json([
                'message' => 'Username atau Password salah!'
            ], 401);
        }

        // Token Sanctum
        $token = $karyawan->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'data' => [
                'id' => $karyawan->id,
                'nama_lengkap' => $karyawan->NamaLengkap_karyawan,
                'jabatan' => $karyawan->Jabatan,
                'divisi' => $karyawan->Divisi,
                'cabang' => $karyawan->Cabang,
            ]
        ], 200);
    }

    /**
     * Get data user yang sedang login
     */
    public function me(Request $request)
    {
        return response()->json([
            'message' => 'Data user',
            'data' => $request->user()
        ]);
    }

    /**
     * Logout API (Hapus Token)
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }
}
