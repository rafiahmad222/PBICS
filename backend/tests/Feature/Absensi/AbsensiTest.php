<?php

namespace Tests\Feature\Absensi;

use Tests\TestCase;
use App\Models\DataKaryawan;
use App\Models\Absensi;
use App\Models\Setting;
use App\Models\PengaturanAbsensi;
use App\Models\HariLibur;
use App\Models\PengajuanCuti;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class AbsensiTest extends TestCase
{
    use RefreshDatabase;

    private DataKaryawan $karyawanPelayanan;
    private DataKaryawan $hrd;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        // Buat Karyawan Pelayanan (Dokter)
        $this->karyawanPelayanan = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Dr. Budi Utomo',
            'Nomor_Identitas' => '1234567890123456',
            'Tempat_Lahir' => 'Jember',
            'Tanggal_Lahir' => '1985-05-12',
            'Divisi' => 'Dokter',
            'Jabatan' => 'Anggota Staff',
            'Cabang' => 'Jember',
            'Email' => 'drbudi@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'drbudi',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'STF-001',
            'Tanggal_bergabung' => '2026-05-08',
        ]);

        // Buat Karyawan HRD
        $this->hrd = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'HRD Riska',
            'Nomor_Identitas' => '9988776655443322',
            'Tempat_Lahir' => 'Jember',
            'Tanggal_Lahir' => '1990-08-25',
            'Divisi' => 'HRD',
            'Jabatan' => 'Lead',
            'Cabang' => 'Jember',
            'Email' => 'riska_hrd@gmail.com',
            'No_Telp' => '08111222333',
            'Username' => 'riska_hrd',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'LD-001',
            'Tanggal_bergabung' => '2026-05-08',
        ]);

        // Pastikan mode_ramadhan bernilai 0 default
        Setting::create(['key' => 'mode_ramadhan', 'value' => '0']);
    }

    /**
     * Test check-in tepat waktu di kantor.
     */
    public function test_karyawan_can_checkin_ontime(): void
    {
        Sanctum::actingAs($this->karyawanPelayanan, ['*']);

        // Mock waktu sekarang ke pukul 08:30 (Jadwal masuk shift pelayanan pagi: 08:45, toleransi s.d 09:00)
        Carbon::setTestNow(Carbon::today()->setTime(8, 30, 0));

        $response = $this->postJson('/api/absensi', [
            'gambar' => UploadedFile::fake()->create('absen.jpg', 100, 'image/jpeg'),
            'lokasi' => '-8.165454875316666,113.71174444623048', // Koordinat Cabang Jember (Jarak 0m)
        ]);

        $response->assertStatus(201)
                 ->assertJsonFragment([
                     'message' => 'Check-in berhasil! Selamat bekerja'
                 ]);

        $this->assertDatabaseHas('absensi', [
            'karyawan_id' => $this->karyawanPelayanan->id,
            'tanggal' => Carbon::today()->toDateString(),
            'status_absen' => 'Tepat Waktu'
        ]);

        $absensi = Absensi::first();
        Storage::disk('public')->assertExists($absensi->gambar_masuk);

        Carbon::setTestNow(); // Reset mock waktu
    }

    /**
     * Test check-in terlambat memerlukan alasan.
     */
    public function test_karyawan_checkin_late_requires_alasan(): void
    {
        Sanctum::actingAs($this->karyawanPelayanan, ['*']);

        // Mock waktu sekarang ke pukul 09:05 (Jadwal: 08:45, Terlambat 20 menit >= 15 menit)
        Carbon::setTestNow(Carbon::today()->setTime(9, 5, 0));

        // 1. Coba check-in tanpa alasan
        $response = $this->postJson('/api/absensi', [
            'gambar' => UploadedFile::fake()->create('absen.jpg', 100, 'image/jpeg'),
            'lokasi' => '-8.165454875316666,113.71174444623048',
        ]);

        $response->assertStatus(422)
                 ->assertJsonFragment([
                     'message' => 'Alasan wajib diisi minimal 10 karakter'
                 ]);

        // 2. Coba check-in dengan alasan < 10 karakter
        $response = $this->postJson('/api/absensi', [
            'gambar' => UploadedFile::fake()->create('absen.jpg', 100, 'image/jpeg'),
            'lokasi' => '-8.165454875316666,113.71174444623048',
            'alasan_keterangan' => 'Macet',
        ]);

        $response->assertStatus(422)
                 ->assertJsonFragment([
                     'message' => 'Alasan wajib diisi minimal 10 karakter'
                 ]);

        // 3. Coba check-in dengan alasan valid (>= 10 karakter)
        $response = $this->postJson('/api/absensi', [
            'gambar' => UploadedFile::fake()->create('absen.jpg', 100, 'image/jpeg'),
            'lokasi' => '-8.165454875316666,113.71174444623048',
            'alasan_keterangan' => 'Ban bocor di daerah Sumbersari Jember',
        ]);

        $response->assertStatus(201)
                 ->assertJsonFragment([
                     'message' => 'Berhasil, Pengajuan berhasil dikirim untuk review'
                 ]);

        $this->assertDatabaseHas('absensi', [
            'karyawan_id' => $this->karyawanPelayanan->id,
            'status_absen' => 'Terlambat',
            'status_pengajuan' => 'PENDING',
            'alasan_keterangan' => 'Ban bocor di daerah Sumbersari Jember'
        ]);

        $absensi = Absensi::first();
        Storage::disk('public')->assertExists($absensi->gambar_masuk);

        Carbon::setTestNow();
    }

    /**
     * Test karyawan tidak bisa absen di luar kantor.
     */
    public function test_karyawan_cannot_absen_outside_office(): void
    {
        Sanctum::actingAs($this->karyawanPelayanan, ['*']);
        Carbon::setTestNow(Carbon::today()->setTime(8, 30, 0));

        // Absen dari lokasi yang jauh (Jember ke Alun-alun Rambipuji, sekitar 8-10 km)
        $response = $this->postJson('/api/absensi', [
            'gambar' => UploadedFile::fake()->create('absen.jpg', 100, 'image/jpeg'),
            'lokasi' => '-8.204561,113.608975',
        ]);

        $response->assertStatus(422)
                 ->assertJsonFragment([
                     'message' => 'Gagal, Anda harus melakukan absensi di area kantor!'
                 ]);

        Carbon::setTestNow();
    }

    /**
     * Test karyawan bisa absen di luar kantor jika disetting oleh HRD.
     */
    public function test_karyawan_can_absen_outside_office_with_config(): void
    {
        Sanctum::actingAs($this->karyawanPelayanan, ['*']);
        Carbon::setTestNow(Carbon::today()->setTime(8, 30, 0));

        // HRD menyetting karyawan tersebut bisa check-in di luar kantor hari ini
        PengaturanAbsensi::create([
            'karyawan_id' => $this->karyawanPelayanan->id,
            'tanggal' => Carbon::today()->toDateString(),
            'ket_shift' => 'Pagi',
            'lokasi_checkin' => 'Luar Kantor',
            'lokasi_checkout' => 'Luar Kantor',
            'keterangan' => 'Tugas Luar Kota'
        ]);

        // Absen di lokasi yang jauh
        $response = $this->postJson('/api/absensi', [
            'gambar' => UploadedFile::fake()->create('absen.jpg', 100, 'image/jpeg'),
            'lokasi' => '-8.204561,113.608975',
        ]);

        $response->assertStatus(201)
                 ->assertJsonFragment([
                     'message' => 'Check-in berhasil! Selamat bekerja'
                 ]);

        Carbon::setTestNow();
    }

    /**
     * Test check-out berhasil.
     */
    public function test_karyawan_can_checkout(): void
    {
        Sanctum::actingAs($this->karyawanPelayanan, ['*']);
        Carbon::setTestNow(Carbon::today()->setTime(8, 30, 0));

        // Buat data checkin terlebih dahulu
        $absensi = Absensi::create([
            'karyawan_id' => $this->karyawanPelayanan->id,
            'tanggal' => Carbon::today()->toDateString(),
            'ket_shift' => 'Pagi',
            'shift_code' => 'pelayanan_pagi',
            'jam_masuk' => '08:30:00',
            'jadwal_masuk' => '08:45:00',
            'jadwal_keluar' => '17:00:00',
            'gambar_masuk' => 'img_in',
            'lokasi_masuk' => '-8.165454875316666,113.71174444623048',
            'status_absen' => 'Tepat Waktu',
        ]);

        // Set waktu check-out ke 17:05
        Carbon::setTestNow(Carbon::today()->setTime(17, 5, 0));

        $response = $this->postJson('/api/absensi', [
            'gambar' => UploadedFile::fake()->create('absen_out.jpg', 100, 'image/jpeg'),
            'lokasi' => '-8.165454875316666,113.71174444623048',
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'message' => 'Check-out berhasil! Sampai jumpa'
                 ]);

        $updatedAbsensi = Absensi::find($absensi->id);
        $this->assertEquals('17:05:00', $updatedAbsensi->jam_keluar);
        $this->assertNotNull($updatedAbsensi->gambar_keluar);
        Storage::disk('public')->assertExists($updatedAbsensi->gambar_keluar);

        Carbon::setTestNow();
    }

    /**
     * Test pengajuan cuti sakit tanpa bukti error.
     */
    public function test_pengajuan_cuti_validation(): void
    {
        Sanctum::actingAs($this->karyawanPelayanan, ['*']);

        // 1. Data form tidak lengkap
        $response = $this->postJson('/api/pengajuan-cuti', [
            'jenis_cuti' => 'SAKIT',
            'tanggal_mulai' => '',
            'tanggal_selesai' => '2026-06-10',
            'alasan' => 'Sakit demam',
        ]);

        $response->assertStatus(422)
                 ->assertJsonFragment([
                     'message' => 'Gagal, Harap lengkapi semua form!'
                 ]);

        // 2. Cuti Sakit tanpa bukti dokumen
        $response = $this->postJson('/api/pengajuan-cuti', [
            'jenis_cuti' => 'SAKIT',
            'tanggal_mulai' => '2026-06-08',
            'tanggal_selesai' => '2026-06-10',
            'alasan' => 'Sakit demam',
            'gambar_bukti_cuti' => '',
        ]);

        $response->assertStatus(422)
                 ->assertJsonFragment([
                     'message' => 'Bukti wajib diisi!!!'
                 ]);

        // 3. Cuti Sakit dengan bukti dokumen lengkap
        $response = $this->postJson('/api/pengajuan-cuti', [
            'jenis_cuti' => 'SAKIT',
            'tanggal_mulai' => '2026-06-08',
            'tanggal_selesai' => '2026-06-10',
            'alasan' => 'Sakit demam',
            'gambar_bukti_cuti' => 'bukti_surat_dokter_base64',
        ]);

        $response->assertStatus(201)
                 ->assertJsonFragment([
                     'message' => 'Pengajuan cuti berhasil dikirim'
                 ]);
    }

    /**
     * Test HRD menyetujui pengajuan cuti & record absensi otomatis dibuat.
     */
    public function test_hrd_approve_cuti(): void
    {
        Sanctum::actingAs($this->hrd, ['*']);

        $cuti = PengajuanCuti::create([
            'karyawan_id' => $this->karyawanPelayanan->id,
            'jenis_cuti' => 'CUTI',
            'tanggal_mulai' => '2026-06-15',
            'tanggal_selesai' => '2026-06-16',
            'alasan' => 'Acara keluarga pernikahan',
            'status_pengajuan' => 'PENDING',
        ]);

        $response = $this->postJson("/api/pengajuan-cuti/{$cuti->id}/review", [
            'status_pengajuan' => 'DISETUJUI'
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'message' => 'Berhasil, Pengajuan cuti disetujui.'
                 ]);

        // Cek status cuti terupdate
        $this->assertDatabaseHas('pengajuan_cuti', [
            'id' => $cuti->id,
            'status_pengajuan' => 'DISETUJUI'
        ]);

        // Cek record absensi otomatis terbuat untuk tanggal 15 dan 16
        $this->assertDatabaseHas('absensi', [
            'karyawan_id' => $this->karyawanPelayanan->id,
            'tanggal' => '2026-06-15',
            'status_absen' => 'Cuti'
        ]);

        $this->assertDatabaseHas('absensi', [
            'karyawan_id' => $this->karyawanPelayanan->id,
            'tanggal' => '2026-06-16',
            'status_absen' => 'Cuti'
        ]);
    }

    /**
     * Test HRD menyetujui pengajuan terlambat (status berubah jadi Lembur).
     */
    public function test_hrd_approve_lembur(): void
    {
        Sanctum::actingAs($this->hrd, ['*']);

        // Buat data absensi terlambat
        $absensi = Absensi::create([
            'karyawan_id' => $this->karyawanPelayanan->id,
            'tanggal' => '2026-06-02',
            'ket_shift' => 'Pagi',
            'shift_code' => 'pelayanan_pagi',
            'jam_masuk' => '09:05:00',
            'jadwal_masuk' => '08:45:00',
            'jadwal_keluar' => '17:00:00',
            'gambar_masuk' => 'img',
            'lokasi_masuk' => '-8.165454875316666,113.71174444623048',
            'status_absen' => 'Terlambat',
            'status_pengajuan' => 'PENDING',
            'alasan_keterangan' => 'Ban bocor mobil mogok dijalan',
        ]);

        $response = $this->postJson("/api/pengajuan-lembur/{$absensi->id}/review", [
            'status_pengajuan' => 'DISETUJUI'
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'message' => 'Berhasil, Pengajuan Lembur telah disetujui'
                 ]);

        $this->assertDatabaseHas('absensi', [
            'id' => $absensi->id,
            'status_absen' => 'Lembur',
            'status_pengajuan' => 'DISETUJUI'
        ]);
    }

    /**
     * Test HRD menolak pengajuan terlambat (status tetap Terlambat).
     */
    public function test_hrd_reject_lembur(): void
    {
        Sanctum::actingAs($this->hrd, ['*']);

        $absensi = Absensi::create([
            'karyawan_id' => $this->karyawanPelayanan->id,
            'tanggal' => '2026-06-02',
            'ket_shift' => 'Pagi',
            'shift_code' => 'pelayanan_pagi',
            'jam_masuk' => '09:05:00',
            'jadwal_masuk' => '08:45:00',
            'jadwal_keluar' => '17:00:00',
            'gambar_masuk' => 'img',
            'lokasi_masuk' => '-8.165454875316666,113.71174444623048',
            'status_absen' => 'Terlambat',
            'status_pengajuan' => 'PENDING',
            'alasan_keterangan' => 'Kesiangan tidur larut malam',
        ]);

        $response = $this->postJson("/api/pengajuan-lembur/{$absensi->id}/review", [
            'status_pengajuan' => 'DITOLAK'
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'message' => 'Gagal, pengajuan lembur berhasil di tolak'
                 ]);

        $this->assertDatabaseHas('absensi', [
            'id' => $absensi->id,
            'status_absen' => 'Terlambat',
            'status_pengajuan' => 'DITOLAK'
        ]);
    }

    /**
     * Test HRD menambah hari libur baru.
     */
    public function test_hrd_can_add_hari_libur(): void
    {
        Sanctum::actingAs($this->hrd, ['*']);

        // 1. Validasi form wajib
        $response = $this->postJson('/api/hari-libur', [
            'nama_hari_libur' => '',
            'jenis_hari_libur' => 'Nasional',
            'tanggal_mulai' => '2026-06-25',
            'tanggal_selesai' => '2026-06-25',
        ]);

        $response->assertStatus(422)
                 ->assertJsonFragment([
                     'message' => 'Harap lengkapi semua form wajib!'
                 ]);

        // 2. Simpan hari libur sukses
        $response = $this->postJson('/api/hari-libur', [
            'nama_hari_libur' => 'Idul Adha',
            'jenis_hari_libur' => 'Nasional',
            'tanggal_mulai' => '2026-06-25',
            'tanggal_selesai' => '2026-06-25',
            'keterangan' => 'Libur Hari Raya Idul Adha 1447 H'
        ]);

        $response->assertStatus(201)
                 ->assertJsonFragment([
                     'message' => 'Berhasil, Data Hari Libur berhasil ditambahkan'
                 ]);

        $this->assertDatabaseHas('hari_libur', [
            'nama_hari_libur' => 'Idul Adha',
            'jenis_hari_libur' => 'Nasional',
        ]);
    }

    /**
     * Test HRD menyetting pengaturan absensi kustom untuk karyawan per tanggal.
     */
    public function test_hrd_can_configure_custom_attendance(): void
    {
        Sanctum::actingAs($this->hrd, ['*']);

        // 1. Test validation error jika data wajib kosong
        $response = $this->postJson('/api/absensi-config', [
            'karyawan_id' => $this->karyawanPelayanan->id,
            'tanggal' => '',
            'ket_shift' => 'Pagi',
            'lokasi_checkin' => 'Luar Kantor',
            'lokasi_checkout' => 'Luar Kantor',
        ]);

        $response->assertStatus(422)
                 ->assertJsonFragment([
                     'message' => 'Tanggal Wajib Diisi'
                 ]);

        // 2. Test input valid
        $response = $this->postJson('/api/absensi-config', [
            'karyawan_id' => $this->karyawanPelayanan->id,
            'tanggal' => '2026-06-03',
            'ket_shift' => 'Siang',
            'lokasi_checkin' => 'Luar Kantor',
            'lokasi_checkout' => 'Kantor',
            'keterangan' => 'Pelatihan Dinas Luar'
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'message' => 'Berhasil, Pengaturan absensi karyawan berhasil diubah'
                 ]);

        $this->assertDatabaseHas('pengaturan_absensi', [
            'karyawan_id' => $this->karyawanPelayanan->id,
            'tanggal' => '2026-06-03',
            'ket_shift' => 'Siang',
            'lokasi_checkin' => 'Luar Kantor',
            'lokasi_checkout' => 'Kantor',
        ]);
    }

    /**
     * Test endpoint GET /api/absensi mengembalikan metadata hari libur jika hari ini libur.
     */
    public function test_index_returns_holiday_metadata(): void
    {
        Sanctum::actingAs($this->karyawanPelayanan, ['*']);
        Carbon::setTestNow(Carbon::today()->setTime(8, 30, 0));
        $todayStr = Carbon::today()->toDateString();

        // 1. Cek ketika tidak ada hari libur
        $response = $this->getJson('/api/absensi');
        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'hari_libur' => null
                 ]);

        // 2. Buat hari libur hari ini
        HariLibur::create([
            'nama_hari_libur' => 'Hari Raya Nyepi',
            'jenis_hari_libur' => 'Nasional',
            'tanggal_mulai' => $todayStr,
            'tanggal_selesai' => $todayStr,
            'keterangan' => 'Libur Nyepi'
        ]);

        // 3. Cek kembali, harus mengembalikan nama hari libur
        $response = $this->getJson('/api/absensi');
        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'hari_libur' => 'Hari Raya Nyepi'
                 ]);

        Carbon::setTestNow();
    }
}
