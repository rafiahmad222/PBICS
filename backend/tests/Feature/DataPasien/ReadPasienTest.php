<?php

namespace Tests\Feature\DataPasien;

use Tests\TestCase;
use App\Models\DataKaryawan;
use App\Models\DataPasien;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class ReadPasienTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup User Auth
        $this->user = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Admin Pasien',
            'Nomor_Identitas' => '1122334455',
            'Tempat_Lahir' => 'Surabaya',
            'Tanggal_Lahir' => '1990-01-01',
            'Divisi' => 'Customer Service',
            'Cabang' => 'Jember',
            'Email' => 'cs_read@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'cs_pasien_read',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'CS-002',
            'Tanggal_bergabung' => '2026-05-08',
        ]);
    }

    public function test_can_get_list_of_pasien(): void
    {
        Sanctum::actingAs($this->user, ['*']);

        // Aksi
        $response = $this->getJson('/api/pasien');

        // Verifikasi
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'data' => [
                         'data', 'current_page', 'last_page'
                     ]
                 ]);
    }

    public function test_can_get_pasien_detail_with_riwayat_pembelian(): void
    {
        Sanctum::actingAs($this->user, ['*']);

        // 1. Buat Pasien
        $pasien = DataPasien::create([
            'kode_Customer' => '2026-06-0001',
            'no_member' => 'MEM-002',
            'no_RM' => '01-02-04',
            'Nama_pasien' => 'Dewi Sartika',
            'no_Identitas' => '35789012345679',
            'Tipe_Member' => 'Member',
            'Tempat_Lahir' => 'Bandung',
            'Tanggal_Lahir' => '1995-12-04',
            'Jenis_Kelamin' => 'P',
            'Email' => 'dewi@example.com',
            'no_Telp' => '082234567891',
            'Alamat' => 'Jl. Braga No. 12',
            'KabKota_id' => null,
            'Kec_id' => null,
        ]);

        // 2. Buat Transaksi Selesai
        $transaksi = \App\Models\Transaksi::create([
            'order_id' => 'ORD-20260615-0001',
            'tipe_transaksi' => 'Produk',
            'no_faktur' => 'PB-2606151001',
            'nama_pasien_distributor' => 'Dewi Sartika',
            'data_pasien_id' => $pasien->id,
            'karyawan_id' => $this->user->id,
            'tanggal_transaksi' => '2026-06-15',
            'status' => 'Selesai',
            'total_keseluruhan' => 200000.00
        ]);

        // 3. Buat Detail Transaksi
        // Detail 1: Produk
        \App\Models\TransaksiDetail::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'transaksi_id' => $transaksi->id,
            'itemable_type' => 'App\Models\StokProduk',
            'itemable_id' => 1,
            'nama_item' => 'Sunscreen SPF 50',
            'qty' => 1,
            'harga' => 80000.00,
            'total_harga' => 80000.00
        ]);

        // Detail 2: Treatment
        \App\Models\TransaksiDetail::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'transaksi_id' => $transaksi->id,
            'itemable_type' => 'App\Models\Treatment',
            'itemable_id' => 2,
            'nama_item' => 'Laser Whitening',
            'qty' => 1,
            'harga' => 120000.00,
            'total_harga' => 120000.00
        ]);

        // Aksi: panggil show
        $response = $this->getJson("/api/pasien/{$pasien->id}");

        // Verifikasi
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'data',
                     'riwayat_pembelian' => [
                         'produk',
                         'treatment',
                         'racikan'
                     ]
                 ])
                 ->assertJsonCount(1, 'riwayat_pembelian.produk')
                 ->assertJsonCount(1, 'riwayat_pembelian.treatment')
                 ->assertJsonCount(0, 'riwayat_pembelian.racikan')
                 ->assertJsonFragment([
                     'nama_item' => 'Sunscreen SPF 50',
                     'qty' => 1,
                     'harga' => 80000.00
                 ])
                 ->assertJsonFragment([
                     'nama_item' => 'Laser Whitening',
                     'qty' => 1,
                     'harga' => 120000.00
                 ]);
    }
}
