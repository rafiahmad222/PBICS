<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PengajuanCuti;
use App\Models\Absensi;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class PengajuanCutiController extends Controller
{
    /**
     * Tampilkan data seluruh pengajuan cuti (HRD/Admin/Owner).
     */
    public function index(Request $request)
    {
        if (!in_array($request->user()->Divisi, ['HRD', 'Owner', 'Super Admin'])) {
            return response()->json([
                'message' => 'Akses ditolak!'
            ], 403);
        }

        $query = PengajuanCuti::with('karyawan');

        if ($request->has('status') && $request->status != '') {
            $query->where('status_pengajuan', $request->status);
        }

        $cuti = $query->paginate(10)->through(function ($item) {
            return [
                'id' => $item->id,
                'Nama_Karyawan' => $item->karyawan->NamaLengkap_karyawan ?? 'N/A',
                'Jenis_Cuti' => $item->jenis_cuti,
                'Tanggal_Mulai' => $item->tanggal_mulai,
                'Tanggal_Selesai' => $item->tanggal_selesai,
                'Status_pengajuan' => $item->status_pengajuan,
                'Alasan' => $item->alasan,
            ];
        });

        return response()->json([
            'message' => 'Data pengajuan cuti berhasil diambil',
            'data' => $cuti
        ], 200);
    }

    /**
     * Buat pengajuan cuti baru (Karyawan).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'jenis_cuti' => 'required',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date',
            'alasan' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Gagal, Harap lengkapi semua form!'
            ], 422);
        }

        // Khusus jenis cuti SAKIT wajib isi gambar bukti
        if (strcasecmp($request->jenis_cuti, 'SAKIT') === 0 && !$request->gambar_bukti_cuti) {
            return response()->json([
                'message' => 'Bukti wajib diisi!!!'
            ], 422);
        }

        $cuti = PengajuanCuti::create([
            'karyawan_id' => $request->user()->id,
            'jenis_cuti' => $request->jenis_cuti,
            'tanggal_mulai' => $request->tanggal_mulai,
            'tanggal_selesai' => $request->tanggal_selesai,
            'alasan' => $request->alasan,
            'gambar_bukti_cuti' => $request->gambar_bukti_cuti,
            'status_pengajuan' => 'PENDING',
        ]);

        return response()->json([
            'message' => 'Pengajuan cuti berhasil dikirim',
            'data' => $cuti
        ], 201);
    }

    /**
     * Tampilkan detail data pengajuan cuti.
     */
    public function show(Request $request, $id)
    {
        if (!in_array($request->user()->Divisi, ['HRD', 'Owner', 'Super Admin'])) {
            return response()->json([
                'message' => 'Akses ditolak!'
            ], 403);
        }

        $cuti = PengajuanCuti::with('karyawan')->find($id);

        if (!$cuti) {
            return response()->json([
                'message' => 'Pengajuan cuti tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'message' => 'Detail pengajuan cuti berhasil diambil',
            'data' => [
                'id' => $cuti->id,
                'Nama_Karyawan' => $cuti->karyawan->NamaLengkap_karyawan ?? 'N/A',
                'Jenis_Cuti' => $cuti->jenis_cuti,
                'Tanggal_Mulai' => $cuti->tanggal_mulai,
                'Tanggal_Selesai' => $cuti->tanggal_selesai,
                'Alasan' => $cuti->alasan,
                'Gambar_Bukti_Cuti' => $cuti->gambar_bukti_cuti,
                'Status_pengajuan' => $cuti->status_pengajuan,
            ]
        ], 200);
    }

    /**
     * Setujui atau Tolak pengajuan cuti (HRD/Admin/Owner).
     */
    public function review(Request $request, $id)
    {
        if (!in_array($request->user()->Divisi, ['HRD', 'Owner', 'Super Admin'])) {
            return response()->json([
                'message' => 'Akses ditolak!'
            ], 403);
        }

        $request->validate([
            'status_pengajuan' => 'required|in:DISETUJUI,DITOLAK'
        ]);

        $cuti = PengajuanCuti::find($id);

        if (!$cuti) {
            return response()->json([
                'message' => 'Pengajuan cuti tidak ditemukan.'
            ], 404);
        }

        $status = $request->status_pengajuan;
        $cuti->status_pengajuan = $status;
        $cuti->save();

        if ($status === 'DISETUJUI') {
            // Otomatis buat/update record absensi pada rentang tanggal tersebut
            $start = Carbon::parse($cuti->tanggal_mulai);
            $end = Carbon::parse($cuti->tanggal_selesai);

            for ($date = $start; $date->lte($end); $date->addDay()) {
                Absensi::updateOrCreate(
                    [
                        'karyawan_id' => $cuti->karyawan_id,
                        'tanggal' => $date->toDateString(),
                    ],
                    [
                        'ket_shift' => 'N/A',
                        'shift_code' => 'cuti_izin',
                        'jadwal_masuk' => '00:00:00',
                        'jadwal_keluar' => '00:00:00',
                        'status_absen' => ucfirst(strtolower($cuti->jenis_cuti)),
                        'status_pengajuan' => 'DISETUJUI',
                    ]
                );
            }

            return response()->json([
                'message' => 'Berhasil, Pengajuan cuti disetujui.'
            ], 200);
        } else {
            return response()->json([
                'message' => 'Pengajuan cuti ditolak.'
            ], 200);
        }
    }
}
