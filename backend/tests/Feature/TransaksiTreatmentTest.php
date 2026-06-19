<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\DataKaryawan;
use App\Models\Treatment;
use App\Models\TreatmentBahan;
use App\Models\StokBahanTreatment;
use App\Models\Transaksi;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class TransaksiTreatmentTest extends TestCase
{
    use RefreshDatabase;

    protected DataKaryawan $karyawan;
    protected StokBahanTreatment $bahanA;
    protected StokBahanTreatment $bahanB;
    protected Treatment $treatmentA;
    protected Treatment $treatmentB;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup User Auth / Karyawan
        $this->karyawan = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Admin CS',
            'Nomor_Identitas' => '1122334455',
            'Tempat_Lahir' => 'Surabaya',
            'Tanggal_Lahir' => '1990-01-01',
            'Divisi' => 'Customer Service',
            'Cabang' => 'Jember',
            'Email' => 'cs@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'admin_cs',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'CS-001',
            'Tanggal_bergabung' => '2026-05-08',
        ]);

        // Setup Bahan
        $this->bahanA = StokBahanTreatment::create([
            'Kode_Produk' => 'BHN-001',
            'Nama_produk' => 'Cairan Infus A',
            'Kategori' => 'Cairan',
            'Harga' => 20000.00,
            'Stok' => 5,
            'Batas_minimal_stok' => 1,
        ]);

        $this->bahanB = StokBahanTreatment::create([
            'Kode_Produk' => 'BHN-002',
            'Nama_produk' => 'Jarum B',
            'Kategori' => 'Alat Medis',
            'Harga' => 10000.00,
            'Stok' => 10,
            'Batas_minimal_stok' => 1,
        ]);

        // Setup Treatment A (Membutuhkan 1x bahanA dan 2x bahanB)
        $this->treatmentA = Treatment::create([
            'Kode_treatment' => 'TRT-001',
            'Nama_treatment' => 'Infus Whitening',
            'Kategori' => 'Infus',
            'Harga' => 300000.00,
        ]);

        TreatmentBahan::create([
            'treatment_id' => $this->treatmentA->id,
            'bahan_id' => $this->bahanA->id,
            'bahan_type' => StokBahanTreatment::class,
            'Jumlah' => 1,
        ]);

        TreatmentBahan::create([
            'treatment_id' => $this->treatmentA->id,
            'bahan_id' => $this->bahanB->id,
            'bahan_type' => StokBahanTreatment::class,
            'Jumlah' => 2,
        ]);

        // Setup Treatment B (Membutuhkan 2x bahanA)
        $this->treatmentB = Treatment::create([
            'Kode_treatment' => 'TRT-002',
            'Nama_treatment' => 'Infus Premium',
            'Kategori' => 'Infus',
            'Harga' => 500000.00,
        ]);

        TreatmentBahan::create([
            'treatment_id' => $this->treatmentB->id,
            'bahan_id' => $this->bahanA->id,
            'bahan_type' => StokBahanTreatment::class,
            'Jumlah' => 2,
        ]);
    }

    public function test_treatment_transaction_succeeds_when_stock_is_sufficient(): void
    {
        Sanctum::actingAs($this->karyawan, ['*']);

        // Order: 2x treatmentA (Membutuhkan: 2x bahanA, 4x bahanB)
        // Stok: bahanA = 5 (cukup), bahanB = 10 (cukup)
        $response = $this->postJson('/api/transaksi', [
            'nama_pasien_distributor' => 'Pasien Tes',
            'tanggal_transaksi' => '2026-06-19',
            'details' => [
                [
                    'item_type' => 'Treatment',
                    'item_id' => $this->treatmentA->id,
                    'qty' => 2
                ]
            ]
        ]);

        $response->assertStatus(201);

        // Pastikan stok berkurang dengan benar
        $this->bahanA->refresh();
        $this->bahanB->refresh();
        $this->assertEquals(3, $this->bahanA->Stok); // 5 - (2 * 1) = 3
        $this->assertEquals(6, $this->bahanB->Stok);  // 10 - (2 * 2) = 6
    }

    public function test_treatment_transaction_fails_when_stock_is_insufficient(): void
    {
        Sanctum::actingAs($this->karyawan, ['*']);

        // Order: 6x treatmentA (Membutuhkan: 6x bahanA, 12x bahanB)
        // Stok: bahanA = 5 (kurang), bahanB = 10 (kurang)
        $response = $this->postJson('/api/transaksi', [
            'nama_pasien_distributor' => 'Pasien Tes',
            'tanggal_transaksi' => '2026-06-19',
            'details' => [
                [
                    'item_type' => 'Treatment',
                    'item_id' => $this->treatmentA->id,
                    'qty' => 6
                ]
            ]
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['details']);
        $response->assertJsonFragment([
            'errors' => [
                'details' => [
                    "Stok bahan 'Cairan Infus A' tidak mencukupi untuk melakukan treatment 'Infus Whitening'. Dibutuhkan: 6, Tersedia: 5."
                ]
            ]
        ]);

        // Pastikan stok tidak berkurang
        $this->bahanA->refresh();
        $this->bahanB->refresh();
        $this->assertEquals(5, $this->bahanA->Stok);
        $this->assertEquals(10, $this->bahanB->Stok);
    }

    public function test_multiple_treatments_sharing_ingredient_fail_when_accumulated_need_exceeds_stock(): void
    {
        Sanctum::actingAs($this->karyawan, ['*']);

        // Order:
        // - 2x treatmentA (Membutuhkan: 2x bahanA)
        // - 2x treatmentB (Membutuhkan: 4x bahanA)
        // Total kebutuhan bahanA = 6. Stok bahanA = 5 (kurang)
        $response = $this->postJson('/api/transaksi', [
            'nama_pasien_distributor' => 'Pasien Tes',
            'tanggal_transaksi' => '2026-06-19',
            'details' => [
                [
                    'item_type' => 'Treatment',
                    'item_id' => $this->treatmentA->id,
                    'qty' => 2
                ],
                [
                    'item_type' => 'Treatment',
                    'item_id' => $this->treatmentB->id,
                    'qty' => 2
                ]
            ]
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['details']);
        $response->assertJsonFragment([
            'errors' => [
                'details' => [
                    "Stok bahan 'Cairan Infus A' tidak mencukupi untuk melakukan treatment 'Infus Whitening'. Dibutuhkan: 6, Tersedia: 5."
                ]
            ]
        ]);

        // Pastikan stok tidak berkurang
        $this->bahanA->refresh();
        $this->assertEquals(5, $this->bahanA->Stok);
    }
}
