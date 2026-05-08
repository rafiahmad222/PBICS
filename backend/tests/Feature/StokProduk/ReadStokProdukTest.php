<?php

namespace Tests\Feature\StokProduk;

use Tests\TestCase;
use App\Models\DataKaryawan;
use App\Models\StokProduk;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class ReadStokProdukTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup User Auth
        $this->user = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Admin Gudang Read',
            'Nomor_Identitas' => '1122334455',
            'Tempat_Lahir' => 'Surabaya',
            'Tanggal_Lahir' => '1990-01-01',
            'Divisi' => 'Gudang Umum',
            'Cabang' => 'Jember',
            'Email' => 'gudang_read@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'admin_gudang_read',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'GUD-002',
            'Tanggal_bergabung' => '2026-05-08',
        ]);
    }

    public function test_can_get_all_stok_produk(): void
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->getJson('/api/stok-produk');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'message',
                     'data' => [
                         '*' => ['id', 'Nama_produk', 'Kode_Produk', 'Kategori', 'Stok']
                     ]
                 ]);
    }
}
