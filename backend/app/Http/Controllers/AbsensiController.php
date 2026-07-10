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
                    'Status' => $item->status_masuk,
                    'Status_Masuk' => $item->status_masuk,
                    'Status_Keluar' => $item->status_keluar ?? 'Belum Keluar',
                    'gambar_masuk' => $item->gambar_masuk ?? null,
                    'gambar_keluar' => $item->gambar_keluar ?? null,
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

        // 4. Tentukan apakah ini Check-in or Check-out
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
                    'karyawan_id' => $karyawan->id,
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

                $statusMasuk = 'Terlambat';
                $alasan = $request->alasan_keterangan;
                $successMessage = 'Berhasil, Pengajuan berhasil dikirim untuk review';
            } else {
                $statusMasuk = 'Tepat Waktu';
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
                'status_masuk' => $statusMasuk,
                'status_keluar' => null,
            ]);

            if ($isLate) {
                \App\Models\PengajuanAbsensi::create([
                    'absensi_id' => $absensi->id,
                    'karyawan_id' => $karyawan->id,
                    'tipe_pengajuan' => 'terlambat',
                    'durasi' => $diffInMinutes,
                    'alasan_keterangan' => $alasan,
                    'status_pengajuan' => 'PENDING',
                ]);
            }

            // Log check-in activity
            \App\Models\ActivityLog::create([
                'karyawan_id' => $karyawan->id,
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

            $diffInMinutesOut = $jadwalKeluar->diffInMinutes($now, false);
            $isOvertime = $diffInMinutesOut > 15;

            $activeAbsensi->jam_keluar = $now->toTimeString();
            $activeAbsensi->gambar_keluar = $request->file('gambar')->store('absensi', 'public');
            $activeAbsensi->lokasi_keluar = $request->lokasi;
            $activeAbsensi->status_keluar = $isOvertime ? 'Lembur' : 'Tepat Waktu';
            $activeAbsensi->save();

            if ($isOvertime) {
                \App\Models\PengajuanAbsensi::create([
                    'absensi_id' => $activeAbsensi->id,
                    'karyawan_id' => $karyawan->id,
                    'tipe_pengajuan' => 'lembur',
                    'durasi' => $diffInMinutesOut,
                    'alasan_keterangan' => $request->alasan_keterangan ?? 'Lembur setelah jam kerja',
                    'status_pengajuan' => 'PENDING',
                ]);
            }

            // Log check-out activity
            \App\Models\ActivityLog::create([
                'karyawan_id' => $karyawan->id,
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

        $query = \App\Models\PengajuanAbsensi::with(['karyawan', 'absensi']);

        if ($request->has('status') && $request->status != '') {
            $query->where('status_pengajuan', $request->status);
        }

        $pengajuan = $query->paginate(10)->through(function ($item) {
            return [
                'id' => $item->absensi_id, // Gunakan absensi_id untuk backward compatibility dengan test
                'pengajuan_id' => $item->id,
                'Nama_Karyawan' => $item->karyawan->NamaLengkap_karyawan ?? 'N/A',
                'Tanggal' => $item->absensi->tanggal ?? 'N/A',
                'Status_Absen' => $item->tipe_pengajuan === 'terlambat' ? 'Terlambat' : 'Lembur',
                'Ket_Shift' => $item->absensi->ket_shift ?? 'N/A',
                'Status_pengajuan' => $item->status_pengajuan ?? 'N/A',
                'durasi' => $item->durasi,
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

        $pengajuan = \App\Models\PengajuanAbsensi::with(['karyawan', 'absensi'])
            ->where('id', $id)
            ->orWhere('absensi_id', $id)
            ->first();

        if (!$pengajuan) {
            return response()->json([
                'message' => 'Data absensi tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'message' => 'Detail pengajuan lembur/terlambat berhasil diambil.',
            'data' => [
                'id' => $pengajuan->absensi_id,
                'pengajuan_id' => $pengajuan->id,
                'Nama_Karyawan' => $pengajuan->karyawan->NamaLengkap_karyawan ?? 'N/A',
                'Lokasi' => $pengajuan->absensi->lokasi_masuk ?? null,
                'Tanggal' => $pengajuan->absensi->tanggal ?? null,
                'Status_Absen' => $pengajuan->tipe_pengajuan === 'terlambat' ? 'Terlambat' : 'Lembur',
                'alasan_keterangan' => $pengajuan->alasan_keterangan,
                'Ket_Shift' => $pengajuan->absensi->ket_shift ?? 'N/A',
                'Jadwal' => $pengajuan->absensi->jadwal_masuk ?? null,
                'Jam_Aktual' => $pengajuan->absensi->jam_masuk ?? null,
                'Status_pengajuan' => $pengajuan->status_pengajuan,
                'durasi' => $pengajuan->durasi,
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

        $pengajuan = \App\Models\PengajuanAbsensi::with('absensi')
            ->where('id', $id)
            ->orWhere('absensi_id', $id)
            ->first();

        if (!$pengajuan) {
            return response()->json([
                'message' => 'Data absensi tidak ditemukan.'
            ], 404);
        }

        $status = $request->status_pengajuan;
        $pengajuan->status_pengajuan = $status;
        $pengajuan->save();

        if ($pengajuan->absensi) {
            if ($status === 'DISETUJUI') {
                if ($pengajuan->tipe_pengajuan === 'lembur') {
                    $pengajuan->absensi->status_keluar = 'Lembur';
                }
            }
            $pengajuan->absensi->save();
        }

        if ($status === 'DISETUJUI') {
            return response()->json([
                'message' => 'Berhasil, Pengajuan Lembur telah disetujui'
            ], 200);
        } else {
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
                sum(case when status_masuk = "Terlambat" then 1 else 0 end) as terlambat_count,
                count(*) as total_count')
            ->groupBy('tanggal')
            ->orderBy('tanggal', 'asc')
            ->get();

        $lastMonthData = Absensi::whereMonth('tanggal', $lastMonth)
            ->whereYear('tanggal', $lastMonthYear)
            ->selectRaw('tanggal, 
                sum(case when status_masuk = "Terlambat" then 1 else 0 end) as terlambat_count,
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
                    $status = $absenHariIni->status_masuk;
                    if ($status === 'Tepat Waktu' || $status === 'Hadir') {
                        $status = 'Masuk';
                    }
                    
                    $attendance[(string)$i] = $status;

                    if ($status === 'Masuk' || $status === 'Terlambat' || $status === 'Hadir') {
                        $total_masuk++;
                    } elseif (stripos($status, 'Cuti') !== false) {
                        $total_cuti++;
                    }
                    
                    if ($absenHariIni->status_keluar === 'Lembur') {
                        $total_lembur++;
                        // If it's a holiday, we might not count it as present, but usually it does
                    }
                } else {
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

