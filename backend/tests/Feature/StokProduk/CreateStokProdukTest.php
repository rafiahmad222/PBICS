<?php

namespace Tests\Feature\StokProduk;

use Tests\TestCase;
use App\Models\DataKaryawan;
use App\Models\StokProduk;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class CreateStokProdukTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup User Auth
        $this->user = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Admin Gudang',
            'Nomor_Identitas' => '1122334455',
            'Tempat_Lahir' => 'Surabaya',
            'Tanggal_Lahir' => '1990-01-01',
            'Divisi' => 'Gudang Umum',
            'Cabang' => 'Jember',
            'Email' => 'gudang@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'admin_gudang',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'GUD-001',
            'Tanggal_bergabung' => '2026-05-08',
        ]);
    }

    public function test_can_create_new_stok_produk(): void
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->postJson('/api/stok-produk', [
            'Nama_produk' => 'Skincare A',
            'Kategori' => 'Krim Wajah',
            'Harga' => 150000,
            'Harga_Distributor' => 100000,
            'Stok' => 50,
            'Batas_minimal_stok' => 10
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'data' => [
                         'id',
                         'Kode_Produk',
                         'Nama_produk'
                     ]
                 ]);

        $this->assertDatabaseHas('stok_produks', [
            'Nama_produk' => 'Skincare A',
            'Kategori' => 'Krim Wajah',
            'Stok' => 50
        ]);
    }

    public function test_create_stok_produk_validation_fails(): void
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->postJson('/api/stok-produk', []);

        $response->assertStatus(422);
    }

    public function test_create_stok_produk_fails_with_negative_stok(): void
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->postJson('/api/stok-produk', [
            'Nama_produk' => 'Skincare Negative',
            'Kategori' => 'Krim Wajah',
            'Harga' => 150000,
            'Harga_Distributor' => 100000,
            'Stok' => -5,
            'Batas_minimal_stok' => 10
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['Stok']);
    }
}
