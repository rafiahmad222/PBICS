<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Absensi;
use App\Models\Setting;
use App\Models\PengaturanAbsensi;
use App\Models\HariLibur;
use App\Models\DataKaryawan;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AbsensiController extends Controller
{
    /**
     * Tampilkan rekap absensi seluruh karyawan terpaginasi.
     */
    public function index(Request $request)
    {
        $query = Absensi::with('karyawan');

        if ($request->has('search') && $request->search != '') {
            $query->whereHas('karyawan', function ($q) use ($request) {
                $q->where('NamaLengkap_karyawan', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('tanggal') && $request->tanggal != '') {
            $query->where('tanggal', $request->tanggal);
        }

        $absensi = $query->orderBy('tanggal', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->through(function ($item) {
                return [
                    'id' => $item->id,
                    'Nama_Karyawan' => $item->karyawan->NamaLengkap_karyawan ?? 'N/A',
                    'Tanggal' => $item->tanggal,
                    'Ket_Shift' => $item->ket_shift,
                    'Jam_Masuk' => $item->jam_masuk,
                    'Jam_Keluar' => $item->jam_keluar,
                    'Jabatan' => $item->karyawan ? strtoupper($item->karyawan->Jabatan . ' - ' . $item->karyawan->Divisi) : 'N/A',
                    'Status' => $item->status_absen,
                ];
            });

        return response()->json([
            'message' => 'Rekap absensi berhasil diambil.',
            'data' => $absensi
        ], 200);
    }

    /**
     * Melakukan Absensi Masuk (Check-in) atau Keluar (Check-out).
     */
    public function store(Request $request)
    {
        $request->validate([
            'gambar' => 'required|string',
            'lokasi' => 'required|string', // Format: "latitude,longitude"
        ]);

        $karyawan = $request->user();
        $today = Carbon::today()->toDateString();
        $yesterday = Carbon::yesterday()->toDateString();
        $now = Carbon::now();

        // 1. Tentukan status Mode Ramadhan
        $modeRamadhan = Setting::where('key', 'mode_ramadhan')->first()?->value === '1';

        // 2. Dapatkan kategori shift berdasarkan divisi
        $category = Absensi::getShiftCategoryByDivisi($karyawan->Divisi);

        // 3. Cek apakah ada pengaturan khusus absensi (PengaturanAbsensi) untuk hari ini
        $config = PengaturanAbsensi::where('karyawan_id', $karyawan->id)
            ->where('tanggal', $today)
            ->first();

        // 4. Tentukan apakah ini Check-in atau Check-out
        // Terlebih dahulu check apakah ada shift malam dari kemarin yang belum checkout
        $activeAbsensi = Absensi::where('karyawan_id', $karyawan->id)
            ->where('tanggal', $yesterday)
            ->where('shift_code', 'like', '%malam%')
            ->whereNull('jam_keluar')
            ->first();

        if (!$activeAbsensi) {
            // Cek absensi hari ini
            $activeAbsensi = Absensi::where('karyawan_id', $karyawan->id)
                ->where('tanggal', $today)
                ->first();
        }

        // Tentukan target lokasi ('Kantor' atau 'Luar Kantor')
        $lokasiTarget = 'Kantor';
        if ($activeAbsensi) {
            // Check-out
            if ($config) {
                $lokasiTarget = $config->lokasi_checkout;
            }
        } else {
            // Check-in
            if ($config) {
                $lokasiTarget = $config->lokasi_checkin;
            }
        }

        // 5. Validasi Radius Kantor (jika wajib di Kantor)
        if (strcasecmp($lokasiTarget, 'Kantor') === 0) {
            $coords = explode(',', $request->lokasi);
            if (count($coords) !== 2) {
                return response()->json([
                    'message' => 'Gagal, Format lokasi tidak valid!'
                ], 422);
            }

            $userLat = (double) trim($coords[0]);
            $userLon = (double) trim($coords[1]);

            // Dapatkan koordinat kantor cabang
            // Jember: -8.184486, 113.668075
            // Lumajang: -8.133083, 113.224090
            $officeLat = -8.184486;
            $officeLon = 113.668075;

            if (strcasecmp($karyawan->Cabang, 'Lumajang') === 0) {
                $officeLat = -8.133083;
                $officeLon = 113.224090;
            }

            $distance = Absensi::calculateDistance($userLat, $userLon, $officeLat, $officeLon);

            // Radius maksimal 100 meter
            if ($distance > 100) {
                return response()->json([
                    'message' => 'Gagal, Anda harus melakukan absensi di area kantor!'
                ], 422);
            }
        }

        // 6. Eksekusi Check-in / Check-out
        if (!$activeAbsensi) {
            // ==================== CHECK-IN ====================
            $currentTimeStr = $now->toTimeString();

            // Tentukan shift
            $shift = null;
            if ($config) {
                $shift = Absensi::findShift($config->ket_shift, $category, $modeRamadhan);
            } else {
                $shift = Absensi::matchClosestShift($currentTimeStr, $category, $modeRamadhan);
            }

            if (!$shift) {
                return response()->json([
                    'message' => 'Gagal mendeteksi shift kerja untuk saat ini!'
                ], 422);
            }

            $jadwalMasuk = $shift['check_in'];
            $jadwalKeluar = $shift['check_out'];

            // Cek keterlambatan (15 menit toleransi)
            $scheduledTime = Carbon::parse($jadwalMasuk);
            $diffInMinutes = $scheduledTime->diffInMinutes($now, false);

            $isLate = $diffInMinutes > 15;

            if ($isLate) {
                $validator = Validator::make($request->all(), [
                    'alasan_keterangan' => 'required|string|min:10|max:300',
                ], [
                    'alasan_keterangan.required' => 'Alasan wajib diisi minimal 10 karakter',
                    'alasan_keterangan.min' => 'Alasan wajib diisi minimal 10 karakter',
                ]);

                if ($validator->fails()) {
                    return response()->json([
                        'message' => $validator->errors()->first(),
                        'errors' => $validator->errors()
                    ], 422);
                }

                $statusAbsen = 'Terlambat';
                $statusPengajuan = 'PENDING';
                $alasan = $request->alasan_keterangan;
                $successMessage = 'Berhasil, Pengajuan berhasil dikirim untuk review';
            } else {
                $statusAbsen = 'Tepat Waktu';
                $statusPengajuan = null;
                $alasan = null;
                $successMessage = 'Check-in berhasil! Selamat bekerja';
            }

            $absensi = Absensi::create([
                'karyawan_id' => $karyawan->id,
                'tanggal' => $today,
                'ket_shift' => $shift['label'],
                'shift_code' => $shift['code'],
                'jam_masuk' => $currentTimeStr,
                'jadwal_masuk' => $jadwalMasuk,
                'jadwal_keluar' => $jadwalKeluar,
                'gambar_masuk' => $request->gambar,
                'lokasi_masuk' => $request->lokasi,
                'status_absen' => $statusAbsen,
                'status_pengajuan' => $statusPengajuan,
                'alasan_keterangan' => $alasan,
            ]);

            return response()->json([
                'message' => $successMessage,
                'data' => $absensi
            ], 201);

        } else {
            // ==================== CHECK-OUT ====================
            if ($activeAbsensi->jam_keluar !== null) {
                return response()->json([
                    'message' => 'Gagal, Anda sudah melakukan absensi keluar hari ini.'
                ], 422);
            }

            $activeAbsensi->jam_keluar = $now->toTimeString();
            $activeAbsensi->gambar_keluar = $request->gambar;
            $activeAbsensi->lokasi_keluar = $request->lokasi;
            $activeAbsensi->save();

            return response()->json([
                'message' => 'Check-out berhasil! Sampai jumpa',
                'data' => $activeAbsensi
            ], 200);
        }
    }

    /**
     * Ambil data pengajuan lembur/terlambat untuk HRD.
     */
    public function getPengajuanLembur(Request $request)
    {
        if (!in_array($request->user()->Divisi, ['HRD', 'Owner', 'Super Admin'])) {
            return response()->json([
                'message' => 'Akses ditolak!'
            ], 403);
        }

        $query = Absensi::with('karyawan')
            ->where(function ($q) {
                $q->where('status_absen', 'Terlambat')
                  ->orWhere('status_absen', 'Lembur')
                  ->orWhereNotNull('status_pengajuan');
            });

        if ($request->has('status') && $request->status != '') {
            $query->where('status_pengajuan', $request->status);
        }

        $pengajuan = $query->paginate(10)->through(function ($item) {
            return [
                'id' => $item->id,
                'Nama_Karyawan' => $item->karyawan->NamaLengkap_karyawan ?? 'N/A',
                'Tanggal' => $item->tanggal,
                'Status_Absen' => $item->status_absen,
                'Ket_Shift' => $item->ket_shift,
                'Status_pengajuan' => $item->status_pengajuan ?? 'N/A',
            ];
        });

        return response()->json([
            'message' => 'Data pengajuan lembur/terlambat berhasil diambil.',
            'data' => $pengajuan
        ], 200);
    }

    /**
     * Tampilkan detail data pengajuan terlambat/lembur.
     */
    public function showPengajuanLembur(Request $request, $id)
    {
        if (!in_array($request->user()->Divisi, ['HRD', 'Owner', 'Super Admin'])) {
            return response()->json([
                'message' => 'Akses ditolak!'
            ], 403);
        }

        $absensi = Absensi::with('karyawan')->find($id);

        if (!$absensi) {
            return response()->json([
                'message' => 'Data absensi tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'message' => 'Detail pengajuan lembur/terlambat berhasil diambil.',
            'data' => [
                'id' => $absensi->id,
                'Nama_Karyawan' => $absensi->karyawan->NamaLengkap_karyawan ?? 'N/A',
                'Lokasi' => $absensi->lokasi_masuk,
                'Tanggal' => $absensi->tanggal,
                'Status_Absen' => $absensi->status_absen,
                'alasan_keterangan' => $absensi->alasan_keterangan,
                'Ket_Shift' => $absensi->ket_shift,
                'Jadwal' => $absensi->jadwal_masuk,
                'Jam_Aktual' => $absensi->jam_masuk,
                'Status_pengajuan' => $absensi->status_pengajuan,
            ]
        ], 200);
    }

    /**
     * Setujui atau Tolak pengajuan lembur/terlambat (HRD/Owner/Admin).
     */
    public function reviewPengajuanLembur(Request $request, $id)
    {
        if (!in_array($request->user()->Divisi, ['HRD', 'Owner', 'Super Admin'])) {
            return response()->json([
                'message' => 'Akses ditolak!'
            ], 403);
        }

        $request->validate([
            'status_pengajuan' => 'required|in:DISETUJUI,DITOLAK'
        ]);

        $absensi = Absensi::find($id);

        if (!$absensi) {
            return response()->json([
                'message' => 'Data absensi tidak ditemukan.'
            ], 404);
        }

        $status = $request->status_pengajuan;

        if ($status === 'DISETUJUI') {
            $absensi->status_absen = 'Lembur';
            $absensi->status_pengajuan = 'DISETUJUI';
            $absensi->save();

            return response()->json([
                'message' => 'Berhasil, Pengajuan Lembur telah disetujui'
            ], 200);
        } else {
            $absensi->status_pengajuan = 'DITOLAK';
            $absensi->save();

            return response()->json([
                'message' => 'Gagal, pengajuan lembur berhasil di tolak'
            ], 200);
        }
    }
}
