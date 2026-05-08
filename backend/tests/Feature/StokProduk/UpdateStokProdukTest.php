<?php

namespace Tests\Feature\StokProduk;

use Tests\TestCase;
use App\Models\DataKaryawan;
use App\Models\StokProduk;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class UpdateStokProdukTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup User Auth
        $this->user = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Admin Gudang Update',
            'Nomor_Identitas' => '1122334455',
            'Tempat_Lahir' => 'Surabaya',
            'Tanggal_Lahir' => '1990-01-01',
            'Divisi' => 'Gudang Umum',
            'Cabang' => 'Jember',
            'Email' => 'gudang_update@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'admin_gudang_update',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'GUD-003',
            'Tanggal_bergabung' => '2026-05-08',
        ]);
    }

    public function test_can_update_stok_produk(): void
    {
        Sanctum::actingAs($this->user, ['*']);

        $produk = StokProduk::create([
            'Nama_produk' => 'Skincare Lama',
            'Kode_Produk' => 'PRD-001',
            'Kategori' => 'Krim Wajah',
            'Harga' => 150000,
            'Harga_Distributor' => 100000,
            'Stok' => 50,
            'Batas_minimal_stok' => 10
        ]);

        $response = $this->putJson('/api/stok-produk/' . $produk->id, [
            'Nama_produk' => 'Skincare Baru Update',
            'Stok' => 75
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'success',
                     'message' => 'Data Stok Produk berhasil diperbarui'
                 ]);

        $this->assertDatabaseHas('stok_produks', [
            'id' => $produk->id,
            'Nama_produk' => 'Skincare Baru Update',
            'Stok' => 75
        ]);
    }
}
