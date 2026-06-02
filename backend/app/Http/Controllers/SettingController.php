<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;

class SettingController extends Controller
{
    /**
     * Mengaktifkan atau menonaktifkan Mode Ramadhan.
     */
    public function updateModeRamadhan(Request $request)
    {
        // Pastikan hanya HRD/Owner/Super Admin
        if (!in_array($request->user()->Divisi, ['HRD', 'Owner', 'Super Admin'])) {
            return response()->json([
                'message' => 'Akses ditolak! Fitur ini hanya untuk divisi HRD, Owner, atau Super Admin.'
            ], 403);
        }

        $request->validate([
            'is_active' => 'required|boolean',
        ]);

        Setting::updateOrCreate(
            ['key' => 'mode_ramadhan'],
            ['value' => $request->is_active ? '1' : '0']
        );

        return response()->json([
            'message' => 'Mode Ramadhan berhasil diperbarui.',
            'mode_ramadhan' => $request->is_active
        ], 200);
    }
}
