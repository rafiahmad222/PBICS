<?php

namespace Tests\Feature\StokProduk;

use Tests\TestCase;
use App\Models\DataKaryawan;
use App\Models\StokProduk;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class GetNextNumberStokProdukTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup User Auth
        $this->user = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Admin Gudang Next',
            'Nomor_Identitas' => '1122334455',
            'Tempat_Lahir' => 'Surabaya',
            'Tanggal_Lahir' => '1990-01-01',
            'Divisi' => 'Gudang Umum',
            'Cabang' => 'Jember',
            'Email' => 'gudang_next@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'admin_gudang_next',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'GUD-005',
            'Tanggal_bergabung' => '2026-05-08',
        ]);
    }

    public function test_can_get_next_number_stok_produk_empty(): void
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->getJson('/api/stok-produk/next-number');

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'success',
                     'Kode_Produk' => 'PRD-001'
                 ]);
    }

    public function test_can_get_next_number_stok_produk_with_existing_data(): void
    {
        Sanctum::actingAs($this->user, ['*']);

        StokProduk::create([
            'Nama_produk' => 'Produk A',
            'Kode_Produk' => 'PRD-005',
            'Kategori' => 'Kategori A',
            'Harga' => 10000,
            'Harga_Distributor' => 8000,
            'Stok' => 10,
            'Batas_minimal_stok' => 5
        ]);

        $response = $this->getJson('/api/stok-produk/next-number');

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'success',
                     'Kode_Produk' => 'PRD-006'
                 ]);
    }
}
