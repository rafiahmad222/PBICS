<?php

namespace Tests\Feature\DashboardOwner;

use Tests\TestCase;
use App\Models\DataKaryawan;
use App\Models\DataPasien;
use App\Models\Transaksi;
use App\Models\TransaksiDetail;
use App\Models\StokProduk;
use App\Models\Treatment;
use App\Models\StokRacikan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class DashboardOwnerTest extends TestCase
{
    use RefreshDatabase;

    protected DataKaryawan $karyawan;
    protected DataPasien $pasien;

    protected function setUp(): void
    {
        parent::setUp();

        // Create mock Employee/Karyawan for auth
        $this->karyawan = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Owner PBICS',
            'Nomor_Identitas' => '9876543210',
            'Tempat_Lahir' => 'Surabaya',
            'Tanggal_Lahir' => '1985-05-05',
            'Divisi' => 'Owner',
            'Cabang' => 'Jember',
            'Email' => 'owner@pbics.com',
            'No_Telp' => '081234567891',
            'Username' => 'owner_pbics',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'OW-001',
            'Tanggal_bergabung' => '2026-01-01',
        ]);

        // Create mock Patient/Pasien
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

    /**
     * Test unauthenticated access.
     */
    public function test_unauthenticated_user_cannot_access_top_selling(): void
    {
        $response = $this->getJson('/api/dashboard-owner/top-selling');
        $response->assertStatus(401);
    }

    /**
     * Test top selling items retrieval and ordering.
     */
    public function test_authenticated_user_can_get_top_selling_items(): void
    {
        Sanctum::actingAs($this->karyawan, ['*']);

        // Create 2 products
        $p1 = StokProduk::create([
            'Nama_produk' => 'Cream Siang', 'Kode_Produk' => 'PRD-001', 'Kategori' => 'Skincare', 'Stok' => 50, 'Harga' => 80000
        ]);
        $p2 = StokProduk::create([
            'Nama_produk' => 'Cream Malam', 'Kode_Produk' => 'PRD-002', 'Kategori' => 'Skincare', 'Stok' => 40, 'Harga' => 90000
        ]);

        // Create 2 treatments
        $t1 = Treatment::create([
            'Nama_treatment' => 'Facial Glow', 'Kode_treatment' => 'TRT-001', 'Kategori' => 'Facial', 'Harga' => 150000
        ]);
        $t2 = Treatment::create([
            'Nama_treatment' => 'Laser Therapy', 'Kode_treatment' => 'TRT-002', 'Kategori' => 'Laser', 'Harga' => 500000
        ]);

        // Create 2 racikan
        $r1 = StokRacikan::create([
            'nama_obat_racik' => 'Acne Cream Custom', 'deskripsi_racikan' => 'Racikan jerawat', 'harga' => 120000
        ]);
        $r2 = StokRacikan::create([
            'nama_obat_racik' => 'Brightening Gel Custom', 'deskripsi_racikan' => 'Racikan flek', 'harga' => 130000
        ]);

        // Create Completed Transaction
        $transaksiSelesai = Transaksi::create([
            'order_id' => 'ORD-1', 'tipe_transaksi' => 'Produk', 'no_faktur' => 'PB-1',
            'nama_pasien_distributor' => 'Pasien A', 'karyawan_id' => $this->karyawan->id,
            'tanggal_transaksi' => '2026-06-01', 'status' => 'Selesai', 'total_keseluruhan' => 1000000
        ]);

        // Details: p1 sold 5 units, p2 sold 10 units (p2 is top seller)
        TransaksiDetail::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(), 'transaksi_id' => $transaksiSelesai->id,
            'itemable_type' => 'App\Models\StokProduk', 'itemable_id' => $p1->id, 'nama_item' => 'Cream Siang',
            'qty' => 5, 'harga' => 80000, 'total_harga' => 400000
        ]);
        TransaksiDetail::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(), 'transaksi_id' => $transaksiSelesai->id,
            'itemable_type' => 'App\Models\StokProduk', 'itemable_id' => $p2->id, 'nama_item' => 'Cream Malam',
            'qty' => 10, 'harga' => 90000, 'total_harga' => 900000
        ]);

        // Details: t1 sold 8 units, t2 sold 2 units (t1 is top seller)
        TransaksiDetail::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(), 'transaksi_id' => $transaksiSelesai->id,
            'itemable_type' => 'App\Models\Treatment', 'itemable_id' => $t1->id, 'nama_item' => 'Facial Glow',
            'qty' => 8, 'harga' => 150000, 'total_harga' => 1200000
        ]);
        TransaksiDetail::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(), 'transaksi_id' => $transaksiSelesai->id,
            'itemable_type' => 'App\Models\Treatment', 'itemable_id' => $t2->id, 'nama_item' => 'Laser Therapy',
            'qty' => 2, 'harga' => 500000, 'total_harga' => 1000000
        ]);

        // Details: r1 sold 3 units, r2 sold 7 units (r2 is top seller)
        TransaksiDetail::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(), 'transaksi_id' => $transaksiSelesai->id,
            'itemable_type' => 'App\Models\StokRacikan', 'itemable_id' => $r1->id, 'nama_item' => 'Acne Cream Custom',
            'qty' => 3, 'harga' => 120000, 'total_harga' => 360000
        ]);
        TransaksiDetail::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(), 'transaksi_id' => $transaksiSelesai->id,
            'itemable_type' => 'App\Models\StokRacikan', 'itemable_id' => $r2->id, 'nama_item' => 'Brightening Gel Custom',
            'qty' => 7, 'harga' => 130000, 'total_harga' => 910000
        ]);

        // Create Pending Transaction (Should not be counted)
        $transaksiPending = Transaksi::create([
            'order_id' => 'ORD-2', 'tipe_transaksi' => 'Produk', 'no_faktur' => null,
            'nama_pasien_distributor' => 'Pasien B', 'karyawan_id' => $this->karyawan->id,
            'tanggal_transaksi' => '2026-06-01', 'status' => 'Pending', 'total_keseluruhan' => 500000
        ]);
        TransaksiDetail::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(), 'transaksi_id' => $transaksiPending->id,
            'itemable_type' => 'App\Models\StokProduk', 'itemable_id' => $p1->id, 'nama_item' => 'Cream Siang',
            'qty' => 20, 'harga' => 80000, 'total_harga' => 1600000
        ]);

        // Make Request
        $response = $this->getJson('/api/dashboard-owner/top-selling');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.produk.0.id', $p2->id) // p2 should be first because 10 > 5
            ->assertJsonPath('data.produk.0.total_terjual', 10)
            ->assertJsonPath('data.produk.1.id', $p1->id)
            ->assertJsonPath('data.produk.1.total_terjual', 5)
            ->assertJsonPath('data.treatment.0.id', $t1->id) // t1 should be first because 8 > 2
            ->assertJsonPath('data.treatment.0.total_terjual', 8)
            ->assertJsonPath('data.racikan.0.id', $r2->id) // r2 should be first because 7 > 3
            ->assertJsonPath('data.racikan.0.total_terjual', 7);
    }

    /**
     * Test filtering by dates and limits.
     */
    public function test_authenticated_user_can_filter_top_selling_by_date_and_limit(): void
    {
        Sanctum::actingAs($this->karyawan, ['*']);

        $p1 = StokProduk::create([
            'Nama_produk' => 'Cream A', 'Kode_Produk' => 'PRD-A', 'Kategori' => 'Skincare', 'Stok' => 50, 'Harga' => 10000
        ]);
        $p2 = StokProduk::create([
            'Nama_produk' => 'Cream B', 'Kode_Produk' => 'PRD-B', 'Kategori' => 'Skincare', 'Stok' => 50, 'Harga' => 10000
        ]);

        // Transaksi 1: 2026-06-01
        $t1 = Transaksi::create([
            'order_id' => 'O-1', 'tipe_transaksi' => 'Produk', 'no_faktur' => 'PB-1',
            'nama_pasien_distributor' => 'A', 'karyawan_id' => $this->karyawan->id,
            'tanggal_transaksi' => '2026-06-01', 'status' => 'Selesai', 'total_keseluruhan' => 10000
        ]);
        TransaksiDetail::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(), 'transaksi_id' => $t1->id,
            'itemable_type' => 'App\Models\StokProduk', 'itemable_id' => $p1->id, 'nama_item' => 'Cream A',
            'qty' => 10, 'harga' => 10000, 'total_harga' => 100000
        ]);

        // Transaksi 2: 2026-06-15
        $t2 = Transaksi::create([
            'order_id' => 'O-2', 'tipe_transaksi' => 'Produk', 'no_faktur' => 'PB-2',
            'nama_pasien_distributor' => 'B', 'karyawan_id' => $this->karyawan->id,
            'tanggal_transaksi' => '2026-06-15', 'status' => 'Selesai', 'total_keseluruhan' => 10000
        ]);
        TransaksiDetail::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(), 'transaksi_id' => $t2->id,
            'itemable_type' => 'App\Models\StokProduk', 'itemable_id' => $p2->id, 'nama_item' => 'Cream B',
            'qty' => 20, 'harga' => 10000, 'total_harga' => 200000
        ]);

        // Test date filter: 2026-06-01 to 2026-06-10 (should only show p1)
        $response = $this->getJson('/api/dashboard-owner/top-selling?start_date=2026-06-01&end_date=2026-06-10');
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.produk')
            ->assertJsonPath('data.produk.0.id', $p1->id);

        // Test limit filter: limit = 1 (should only show top item)
        $response2 = $this->getJson('/api/dashboard-owner/top-selling?limit=1');
        $response2->assertStatus(200)
            ->assertJsonCount(1, 'data.produk')
            ->assertJsonPath('data.produk.0.id', $p2->id); // Cream B has 20 sales total, Cream A has 10. Limit=1 shows only B.
    }
}
