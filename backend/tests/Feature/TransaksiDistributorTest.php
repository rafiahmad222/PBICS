<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\DataKaryawan;
use App\Models\Distributor;
use App\Models\StokProduk;
use App\Models\Treatment;
use App\Models\Transaksi;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class TransaksiDistributorTest extends TestCase
{
    use RefreshDatabase;

    protected DataKaryawan $karyawan;
    protected Distributor $distributor;
    protected StokProduk $produk1;
    protected StokProduk $produk2;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup User Auth / Karyawan
        $this->karyawan = DataKaryawan::create([
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

        // Setup Distributor
        $this->distributor = Distributor::create([
            'nama_distributor' => 'Distributor Kimia',
            'tanggal_lahir' => '1990-05-15',
            'alamat' => 'Jl. Pahlawan 123',
            'no_telp' => '081234567890',
            'email' => 'kimia@distributor.com',
            'distributor' => 'Reseller',
            'deposit_masuk' => 1000000.00,
            'sisa_deposit' => 1000000.00,
        ]);

        // Setup Produk
        $this->produk1 = StokProduk::create([
            'Kode_Produk' => 'PRD-001',
            'Nama_produk' => 'Skincare Premium A',
            'Kategori' => 'Krim',
            'Harga' => 150000.00,
            'Harga_Distributor' => 100000.00,
            'Stok' => 100,
            'Batas_minimal_stok' => 5,
        ]);

        $this->produk2 = StokProduk::create([
            'Kode_Produk' => 'PRD-002',
            'Nama_produk' => 'Skincare Serum B',
            'Kategori' => 'Serum',
            'Harga' => 200000.00,
            'Harga_Distributor' => 120000.00,
            'Stok' => 100,
            'Batas_minimal_stok' => 5,
        ]);
    }

    public function test_distributor_purchase_with_sufficient_deposit_succeeds_and_deducts_balance(): void
    {
        Sanctum::actingAs($this->karyawan, ['*']);

        // Order: 2x produk1 (2 * 100,000 = 200,000)
        $response = $this->postJson('/api/transaksi', [
            'distributor_id' => $this->distributor->id,
            'nama_pasien_distributor' => $this->distributor->nama_distributor,
            'alamat_pengiriman' => 'Alamat Pengiriman',
            'tanggal_transaksi' => '2026-06-15',
            'details' => [
                [
                    'item_type' => 'StokProduk',
                    'item_id' => $this->produk1->id,
                    'qty' => 2
                ]
            ]
        ]);

        $response->assertStatus(201);
        
        // Cek sisa deposit berkurang (1,000,000 - 200,000 = 800,000)
        $this->distributor->refresh();
        $this->assertEquals(800000.00, $this->distributor->sisa_deposit);

        // Cek harga yang digunakan adalah Harga_Distributor
        $transaksi = Transaksi::latest()->first();
        $this->assertEquals(200000.00, $transaksi->total_keseluruhan);
        $this->assertEquals($this->distributor->id, $transaksi->distributor_id);
    }

    public function test_distributor_purchase_with_insufficient_deposit_fails(): void
    {
        Sanctum::actingAs($this->karyawan, ['*']);

        // Set deposit distributor ke jumlah yang sangat kecil
        $this->distributor->update(['sisa_deposit' => 50000.00]);

        // Order: 2x produk1 (2 * 100,000 = 200,000) -> melebihi 50,000
        $response = $this->postJson('/api/transaksi', [
            'distributor_id' => $this->distributor->id,
            'nama_pasien_distributor' => $this->distributor->nama_distributor,
            'alamat_pengiriman' => 'Alamat Pengiriman',
            'tanggal_transaksi' => '2026-06-15',
            'details' => [
                [
                    'item_type' => 'StokProduk',
                    'item_id' => $this->produk1->id,
                    'qty' => 2
                ]
            ]
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['distributor_id']);

        // Deposit harus tetap utuh
        $this->distributor->refresh();
        $this->assertEquals(50000.00, $this->distributor->sisa_deposit);
    }

    public function test_distributor_cannot_purchase_treatment_or_racikan(): void
    {
        Sanctum::actingAs($this->karyawan, ['*']);

        $treatment = Treatment::create([
            'Kode_treatment' => 'TRT-001',
            'Nama_treatment' => 'Facial Treatment',
            'Kategori' => 'Wajah',
            'Harga' => 250000.00,
            'status' => 'Available',
        ]);

        $response = $this->postJson('/api/transaksi', [
            'distributor_id' => $this->distributor->id,
            'nama_pasien_distributor' => $this->distributor->nama_distributor,
            'alamat_pengiriman' => 'Alamat Pengiriman',
            'tanggal_transaksi' => '2026-06-15',
            'details' => [
                [
                    'item_type' => 'Treatment',
                    'item_id' => $treatment->id,
                    'qty' => 1
                ]
            ]
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['details']);

        // Deposit tetap utuh
        $this->distributor->refresh();
        $this->assertEquals(1000000.00, $this->distributor->sisa_deposit);
    }

    public function test_updating_pending_distributor_transaction_adjusts_deposit_correctly(): void
    {
        Sanctum::actingAs($this->karyawan, ['*']);

        // 1. Create transaction: 2x produk1 = 200,000 (Sisa deposit -> 800,000)
        $createResponse = $this->postJson('/api/transaksi', [
            'distributor_id' => $this->distributor->id,
            'nama_pasien_distributor' => $this->distributor->nama_distributor,
            'alamat_pengiriman' => 'Alamat Pengiriman',
            'tanggal_transaksi' => '2026-06-15',
            'details' => [
                [
                    'item_type' => 'StokProduk',
                    'item_id' => $this->produk1->id,
                    'qty' => 2
                ]
            ]
        ]);
        $createResponse->assertStatus(201);
        $transaksiId = $createResponse->json('data.0.id');

        // 2. Update transaction: decrease qty to 1x produk1 = 100,000 (Refund 100,000 -> Sisa deposit -> 900,000)
        $updateResponse = $this->putJson("/api/transaksi/{$transaksiId}", [
            'details' => [
                [
                    'item_type' => 'StokProduk',
                    'item_id' => $this->produk1->id,
                    'qty' => 1
                ]
            ]
        ]);
        $updateResponse->assertStatus(200);

        $this->distributor->refresh();
        $this->assertEquals(900000.00, $this->distributor->sisa_deposit);

        // 3. Update transaction: increase qty to 5x produk1 = 500,000 (Deduct additional 400,000 -> Sisa deposit -> 500,000)
        $updateResponse2 = $this->putJson("/api/transaksi/{$transaksiId}", [
            'details' => [
                [
                    'item_type' => 'StokProduk',
                    'item_id' => $this->produk1->id,
                    'qty' => 5
                ]
            ]
        ]);
        $updateResponse2->assertStatus(200);

        $this->distributor->refresh();
        $this->assertEquals(500000.00, $this->distributor->sisa_deposit);

        // 4. Update transaction with insufficient remaining deposit: 10x produk1 = 1,000,000 (Need additional 500,000, but sisa is 500,000 -> fail)
        $updateResponse3 = $this->putJson("/api/transaksi/{$transaksiId}", [
            'details' => [
                [
                    'item_type' => 'StokProduk',
                    'item_id' => $this->produk1->id,
                    'qty' => 11 // 1.1 million total -> needs 600,000 extra -> fails
                ]
            ]
        ]);
        $updateResponse3->assertStatus(422);

        $this->distributor->refresh();
        $this->assertEquals(500000.00, $this->distributor->sisa_deposit); // Deposit is unchanged
    }

    public function test_approving_distributor_transaction_adjusts_deposit_correctly(): void
    {
        Sanctum::actingAs($this->karyawan, ['*']);

        // 1. Create transaction: 2x produk1 = 200,000 (Sisa deposit -> 800,000)
        $createResponse = $this->postJson('/api/transaksi', [
            'distributor_id' => $this->distributor->id,
            'nama_pasien_distributor' => $this->distributor->nama_distributor,
            'alamat_pengiriman' => 'Alamat Pengiriman',
            'tanggal_transaksi' => '2026-06-15',
            'details' => [
                [
                    'item_type' => 'StokProduk',
                    'item_id' => $this->produk1->id,
                    'qty' => 2
                ]
            ]
        ]);
        $createResponse->assertStatus(201);
        $transaksiId = $createResponse->json('data.0.id');
        $detailId = $createResponse->json('data.0.details.0.id');

        // 2. Approve transaction with edited qty: Gudang changes qty to 1x produk1 = 100,000 (Refund 100,000 -> Sisa deposit -> 900,000)
        $approveResponse = $this->postJson("/api/transaksi/{$transaksiId}/approve", [
            'details' => [
                [
                    'id' => $detailId,
                    'qty' => 1,
                    'subtotal' => 100000.00
                ]
            ]
        ]);
        $approveResponse->assertStatus(200);

        $this->distributor->refresh();
        $this->assertEquals(900000.00, $this->distributor->sisa_deposit);
        
        $transaksi = Transaksi::find($transaksiId);
        $this->assertEquals('Selesai', $transaksi->status);
        $this->assertEquals(100000.00, $transaksi->total_keseluruhan);
    }
}
