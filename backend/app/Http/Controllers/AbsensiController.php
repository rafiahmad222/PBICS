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
        } else {
            $query->where('tanggal', '<=', Carbon::today()->toDateString());
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

        $today = Carbon::today()->toDateString();
        $hariLibur = HariLibur::where('tanggal_mulai', '<=', $today)
            ->where('tanggal_selesai', '>=', $today)
            ->first();

        return response()->json([
            'message' => 'Rekap absensi berhasil diambil.',
            'hari_libur' => $hariLibur ? $hariLibur->nama_hari_libur : null,
            'data' => $absensi
        ], 200);
    }

    /**
     * Melakukan Absensi Masuk (Check-in) atau Keluar (Check-out).
     */
    public function store(Request $request)
    {
        $request->validate([
            'gambar' => 'required|image|mimes:jpeg,png,jpg,webp|max:10240',
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
            $officeLat = -8.165454875316666;
            $officeLon = 113.71174444623048;

            if (strcasecmp($karyawan->Cabang, 'Lumajang') === 0) {
                $officeLat = -8.155995703589348;
                $officeLon = 113.25270886383797;
            }

            $distance = Absensi::calculateDistance($userLat, $userLon, $officeLat, $officeLon);

            // Radius maksimal 100 meter
            if ($distance > 100) {
                // Log failed outside check-in attempt (Keamanan)
                \App\Models\ActivityLog::create([
                    'user_id' => $karyawan->id,
                    'action' => 'AKSES_DITOLAK',
                    'module' => 'Keamanan',
                    'details' => "Karyawan {$karyawan->NamaLengkap_karyawan} ({$karyawan->Divisi}) mencoba melakukan absensi di luar area kantor (Jarak terdeteksi: " . round($distance) . " meter).",
                    'created_at' => now(),
                ]);

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
                'gambar_masuk' => $request->file('gambar')->store('absensi', 'public'),
                'lokasi_masuk' => $request->lokasi,
                'status_absen' => $statusAbsen,
                'status_pengajuan' => $statusPengajuan,
                'alasan_keterangan' => $alasan,
            ]);

            // Log check-in activity
            \App\Models\ActivityLog::create([
                'user_id' => $karyawan->id,
                'action' => $isLate ? 'TERLAMBAT' : 'ABSEN_MASUK',
                'module' => 'Kehadiran',
                'details' => $isLate 
                    ? "Karyawan {$karyawan->NamaLengkap_karyawan} ({$karyawan->Divisi}) terlambat absen masuk selama {$diffInMinutes} menit. Alasan: \"{$alasan}\"."
                    : "Karyawan {$karyawan->NamaLengkap_karyawan} ({$karyawan->Divisi}) melakukan absen masuk tepat waktu.",
                'created_at' => now(),
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

            // Validasi jika jam checkout belum sampai jadwal_keluar
            if (str_contains(strtolower($activeAbsensi->shift_code), 'malam')) {
                $jadwalKeluar = Carbon::parse($activeAbsensi->tanggal . ' ' . $activeAbsensi->jadwal_keluar)->addDay();
            } else {
                $jadwalKeluar = Carbon::parse($activeAbsensi->tanggal . ' ' . $activeAbsensi->jadwal_keluar);
            }

            if ($now->lt($jadwalKeluar)) {
                $formattedJadwal = Carbon::parse($activeAbsensi->jadwal_keluar)->format('H:i');
                return response()->json([
                    'message' => "Gagal, Belum saatnya melakukan absensi keluar! Waktu kepulangan Anda adalah pukul {$formattedJadwal}."
                ], 422);
            }

            $activeAbsensi->jam_keluar = $now->toTimeString();
            $activeAbsensi->gambar_keluar = $request->file('gambar')->store('absensi', 'public');
            $activeAbsensi->lokasi_keluar = $request->lokasi;
            $activeAbsensi->save();

            // Log check-out activity
            \App\Models\ActivityLog::create([
                'user_id' => $karyawan->id,
                'action' => 'ABSEN_KELUAR',
                'module' => 'Kehadiran',
                'details' => "Karyawan {$karyawan->NamaLengkap_karyawan} ({$karyawan->Divisi}) melakukan absen keluar.",
                'created_at' => now(),
            ]);

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

    /**
     * Get lateness trend data for current and previous months.
     */
    public function getLatenessTrend(Request $request)
    {
        if (!in_array($request->user()->Divisi, ['HRD', 'Owner', 'Super Admin'])) {
            return response()->json([
                'message' => 'Akses ditolak!'
            ], 403);
        }

        $thisMonth = Carbon::now()->month;
        $thisYear = Carbon::now()->year;

        $lastMonth = Carbon::now()->subMonth()->month;
        $lastMonthYear = Carbon::now()->subMonth()->year;

        $thisMonthData = Absensi::whereMonth('tanggal', $thisMonth)
            ->whereYear('tanggal', $thisYear)
            ->selectRaw('tanggal, 
                sum(case when status_absen = "Terlambat" then 1 else 0 end) as terlambat_count,
                count(*) as total_count')
            ->groupBy('tanggal')
            ->orderBy('tanggal', 'asc')
            ->get();

        $lastMonthData = Absensi::whereMonth('tanggal', $lastMonth)
            ->whereYear('tanggal', $lastMonthYear)
            ->selectRaw('tanggal, 
                sum(case when status_absen = "Terlambat" then 1 else 0 end) as terlambat_count,
                count(*) as total_count')
            ->groupBy('tanggal')
            ->orderBy('tanggal', 'asc')
            ->get();

        return response()->json([
            'message' => 'Data tren keterlambatan berhasil diambil',
            'this_month' => $thisMonthData,
            'last_month' => $lastMonthData
        ], 200);
    }

    /**
     * Get monthly recap for all employees
     */
    public function getRekapBulanan(Request $request)
    {
        $bulan = $request->input('bulan', Carbon::now()->format('m'));
        $tahun = $request->input('tahun', Carbon::now()->format('Y'));

        $karyawans = DataKaryawan::orderBy('Divisi', 'asc')
            ->orderBy('Jabatan', 'asc')
            ->orderBy('NamaLengkap_karyawan', 'asc')
            ->get();

        $absensis = Absensi::whereMonth('tanggal', $bulan)
            ->whereYear('tanggal', $tahun)
            ->get();

        $daysInMonth = Carbon::createFromDate($tahun, $bulan)->daysInMonth;
        $result = [];

        foreach ($karyawans as $karyawan) {
            $karyawanAbsen = $absensis->where('karyawan_id', $karyawan->id);
            
            $attendance = [];
            $total_masuk = 0;
            $total_cuti = 0;
            $total_lembur = 0;

            for ($i = 1; $i <= $daysInMonth; $i++) {
                $dateStr = sprintf('%04d-%02d-%02d', $tahun, $bulan, $i);
                $absenHariIni = $karyawanAbsen->where('tanggal', $dateStr)->first();

                if ($absenHariIni) {
                    $status = $absenHariIni->status_absen;
                    // Map frontend names
                    if ($status === 'Tepat Waktu' || $status === 'Hadir') {
                        $status = 'Masuk';
                    }
                    
                    $attendance[(string)$i] = $status;

                    if ($status === 'Masuk' || $status === 'Terlambat' || $status === 'Hadir') {
                        $total_masuk++;
                    } elseif (stripos($status, 'Cuti') !== false) {
                        $total_cuti++;
                    } elseif ($status === 'Lembur') {
                        $total_lembur++;
                        $total_masuk++; // Usually counts as present too
                    }
                } else {
                    // Check if date is past. If past and no record, maybe it's not Alpa if it's Sunday.
                    // For simplicity, just output blank if no record.
                    $attendance[(string)$i] = '';
                }
            }

            $result[] = [
                'id' => $karyawan->kode_karyawan,
                'nama' => $karyawan->NamaLengkap_karyawan,
                'role' => strtoupper($karyawan->Jabatan . ' - ' . $karyawan->Divisi),
                'attendance' => $attendance,
                'summary' => [
                    'total_masuk' => $total_masuk,
                    'total_cuti' => $total_cuti,
                    'total_lembur' => $total_lembur
                ]
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Rekap bulanan berhasil diambil',
            'data' => [
                'daysInMonth' => $daysInMonth,
                'bulan' => $bulan,
                'tahun' => $tahun,
                'rekap' => $result
            ]
        ], 200);
    }
}

