<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PengaturanAbsensi;
use Illuminate\Support\Facades\Validator;

class PengaturanAbsensiController extends Controller
{
    /**
     * Menyimpan atau memperbarui pengaturan absensi khusus karyawan pada tanggal tertentu.
     */
    public function storeOrUpdate(Request $request)
    {
        // Pastikan hanya HRD/Owner/Super Admin
        if (!in_array($request->user()->Divisi, ['HRD', 'Owner', 'Super Admin'])) {
            return response()->json([
                'message' => 'Akses ditolak! Fitur ini hanya untuk divisi HRD, Owner, atau Super Admin.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'karyawan_id' => 'required|exists:data_karyawan,id',
            'tanggal' => 'required',
            'ket_shift' => 'required',
            'lokasi_checkin' => 'required',
            'lokasi_checkout' => 'required',
        ], [
            'tanggal.required' => 'Tanggal Wajib Diisi',
            'ket_shift.required' => 'Keterangan Shift karyawan Wajib Diisi',
            'lokasi_checkin.required' => 'Lokasi absensi Wajib Diisi',
            'lokasi_checkout.required' => 'Lokasi absensi Wajib Diisi',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $config = PengaturanAbsensi::updateOrCreate(
            [
                'karyawan_id' => $request->karyawan_id,
                'tanggal' => $request->tanggal,
            ],
            [
                'ket_shift' => $request->ket_shift,
                'lokasi_checkin' => $request->lokasi_checkin,
                'lokasi_checkout' => $request->lokasi_checkout,
                'keterangan' => $request->keterangan,
            ]
        );

        return response()->json([
            'message' => 'Berhasil, Pengaturan absensi karyawan berhasil diubah',
            'data' => $config
        ], 200);
    }
}
