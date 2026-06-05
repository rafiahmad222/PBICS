<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HariLibur;
use Illuminate\Support\Facades\Validator;

class HariLiburController extends Controller
{
    /**
     * Tampilkan semua hari libur.
     */
    public function index()
    {
        $hariLibur = HariLibur::orderBy('tanggal_mulai', 'asc')->get();

        return response()->json([
            'message' => 'Data hari libur berhasil diambil.',
            'data' => $hariLibur
        ], 200);
    }

    /**
     * Tambah hari libur baru.
     */
    public function store(Request $request)
    {
        // Pastikan hanya HRD/Owner/Super Admin
        if (!in_array($request->user()->Divisi, ['HRD', 'Owner', 'Super Admin'])) {
            return response()->json([
                'message' => 'Akses ditolak! Fitur ini hanya untuk divisi HRD, Owner, atau Super Admin.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'nama_hari_libur' => 'required',
            'jenis_hari_libur' => 'required',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Harap lengkapi semua form wajib!'
            ], 422);
        }

        $hariLibur = HariLibur::create([
            'nama_hari_libur' => $request->nama_hari_libur,
            'jenis_hari_libur' => $request->jenis_hari_libur,
            'tanggal_mulai' => $request->tanggal_mulai,
            'tanggal_selesai' => $request->tanggal_selesai,
            'keterangan' => $request->keterangan,
        ]);

        return response()->json([
            'message' => 'Berhasil, Data Hari Libur berhasil ditambahkan',
            'data' => $hariLibur
        ], 201);
    }

    /**
     * Hapus hari libur.
     */
    public function destroy(Request $request, $id)
    {
        // Pastikan hanya HRD/Owner/Super Admin
        if (!in_array($request->user()->Divisi, ['HRD', 'Owner', 'Super Admin'])) {
            return response()->json([
                'message' => 'Akses ditolak! Fitur ini hanya untuk divisi HRD, Owner, atau Super Admin.'
            ], 403);
        }

        $hariLibur = HariLibur::find($id);

        if (!$hariLibur) {
            return response()->json([
                'message' => 'Data hari libur tidak ditemukan.'
            ], 404);
        }

        $hariLibur->delete();

        return response()->json([
            'message' => 'Data hari libur berhasil dihapus.'
        ], 200);
    }
}
