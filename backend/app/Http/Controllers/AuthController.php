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

        // Cari Karyawan berdasarkan Username
        $karyawan = DataKaryawan::where('Username', $request->Username)->first();

        // Cek jika Karyawan tidak ditemukan atau Password salah
        if (!$karyawan || !Hash::check($request->Password, $karyawan->Password)) {
            return response()->json([
                'message' => 'Username atau Password salah!'
            ], 401);
        }

        // Buat Token dengan Sanctum
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
        // Menghapus semua token dari user yang sedang login
        $request->user()->tokens()->delete();
        
        // Alternatif jika ingin menghapus token yang dipakai saat ini saja:
        // $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }
}
