<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Transaksi;
use App\Models\DataKaryawan;
use App\Models\DataPasien;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Traits\ShiftsDateAfterFivePM;

class ShiftsDateAfterFivePMTest extends TestCase
{
    use RefreshDatabase;

    protected DataKaryawan $karyawan;
    protected DataPasien $pasien;

    protected function setUp(): void
    {
        parent::setUp();

        // Buat Karyawan untuk kasir transaksi
        $this->karyawan = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Kasir PBICS',
            'Nomor_Identitas' => '1234567890',
            'Tempat_Lahir' => 'Surabaya',
            'Tanggal_Lahir' => '1995-12-12',
            'Divisi' => 'Customer Service',
            'Cabang' => 'Jember',
            'Email' => 'kasir@pbics.com',
            'No_Telp' => '081234567890',
            'Username' => 'kasir_pbics',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'CS-001',
            'Tanggal_bergabung' => '2026-05-01',
        ]);

        // Buat Pasien terdaftar
        $this->pasien = DataPasien::create([
            'kode_Customer' => '2026-05-0001',
            'no_member' => 'MEM-001',
            'no_RM' => '01-02-03',
            'Nama_pasien' => 'Ahmad Rafli',
            'no_Identitas' => '35789012345678',
            'Tipe_Member' => 'Member',
            'Tempat_Lahir' => 'Surabaya',
            'Tanggal_Lahir' => '2000-01-01',
            'Jenis_Kelamin' => 'L',
            'Email' => 'rafli@example.com',
            'no_Telp' => '082234567890',
            'Alamat' => 'Jl. Dharmahusada No. 10',
        ]);
    }

    public function test_transaksi_created_before_five_pm_does_not_shift_date(): void
    {
        // Set current time to 14:00 (2 PM)
        Carbon::setTestNow(Carbon::create(2026, 6, 7, 14, 0, 0));

        $transaksi = Transaksi::create([
            'order_id' => 'ORD-20260607-0001',
            'tipe_transaksi' => 'Produk',
            'no_faktur' => 'PB-2606071001',
            'nama_pasien_distributor' => 'Ahmad Rafli',
            'data_pasien_id' => $this->pasien->id,
            'karyawan_id' => $this->karyawan->id,
            'tanggal_transaksi' => '2026-06-07',
            'status' => 'Selesai',
            'total_keseluruhan' => 150000.00
        ]);

        $this->assertEquals('2026-06-07', $transaksi->tanggal_transaksi);
        $this->assertEquals('2026-06-07', $transaksi->created_at->toDateString());

        Carbon::setTestNow(); // Reset time mock
    }

    public function test_transaksi_created_after_five_pm_shifts_date_to_next_day(): void
    {
        // Set current time to 17:30 (5:30 PM)
        Carbon::setTestNow(Carbon::create(2026, 6, 7, 17, 30, 0));

        $transaksi = Transaksi::create([
            'order_id' => 'ORD-20260607-0002',
            'tipe_transaksi' => 'Produk',
            'no_faktur' => 'PB-2606071002',
            'nama_pasien_distributor' => 'Ahmad Rafli',
            'data_pasien_id' => $this->pasien->id,
            'karyawan_id' => $this->karyawan->id,
            'tanggal_transaksi' => '2026-06-07',
            'status' => 'Selesai',
            'total_keseluruhan' => 150000.00
        ]);

        // tanggal_transaksi must be shifted by 1 day to 2026-06-08
        $this->assertEquals('2026-06-08', $transaksi->tanggal_transaksi);
        
        // created_at must also be shifted to tomorrow
        $this->assertEquals('2026-06-08', $transaksi->created_at->toDateString());

        Carbon::setTestNow(); // Reset time mock
    }
}
