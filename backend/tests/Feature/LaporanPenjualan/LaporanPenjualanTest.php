<?php

namespace Tests\Feature\LaporanPenjualan;

use Tests\TestCase;
use App\Models\DataKaryawan;
use App\Models\DataPasien;
use App\Models\Transaksi;
use App\Models\TransaksiDetail;
use App\Models\StokProduk;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class LaporanPenjualanTest extends TestCase
{
    use RefreshDatabase;

    protected DataKaryawan $karyawan;
    protected DataPasien $pasien;

    protected function setUp(): void
    {
        parent::setUp();

        // Buat Karyawan untuk login & kasir transaksi
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
            'KabKota_id' => null,
            'Kec_id' => null,
        ]);
    }

    /**
     * Test pengguna tidak terautentikasi tidak bisa mengakses laporan
     */
    public function test_unauthenticated_user_cannot_access_laporan_penjualan(): void
    {
        $response = $this->getJson('/api/laporan-penjualan');
        $response->assertStatus(401);

        $responseDetail = $this->getJson('/api/laporan-penjualan/some-uuid');
        $responseDetail->assertStatus(401);
    }

    /**
     * Test menampilkan data Laporan Penjualan (Hanya status Selesai)
     */
    public function test_authenticated_user_can_get_list_of_laporan_penjualan(): void
    {
        Sanctum::actingAs($this->karyawan, ['*']);

        // Buat transaksi 1: Selesai
        $transaksiSelesai = Transaksi::create([
            'order_id' => 'ORD-20260531-0001',
            'tipe_transaksi' => 'Produk',
            'no_faktur' => 'PB-2605311001',
            'nama_pasien_distributor' => 'Ahmad Rafli',
            'data_pasien_id' => $this->pasien->id,
            'karyawan_id' => $this->karyawan->id,
            'tanggal_transaksi' => '2026-05-31',
            'status' => 'Selesai',
            'total_keseluruhan' => 150000.00
        ]);

        // Buat transaksi 2: Pending (Tidak boleh muncul di Laporan Penjualan)
        $transaksiPending = Transaksi::create([
            'order_id' => 'ORD-20260531-0002',
            'tipe_transaksi' => 'Produk',
            'no_faktur' => null,
            'nama_pasien_distributor' => 'Distributor Kimia',
            'karyawan_id' => $this->karyawan->id,
            'tanggal_transaksi' => '2026-05-31',
            'status' => 'Pending',
            'total_keseluruhan' => 500000.00
        ]);

        $response = $this->getJson('/api/laporan-penjualan');

        $response->assertStatus(200)
                 ->assertJsonPath('status', 'success')
                 ->assertJsonCount(1, 'data')
                 ->assertJsonFragment([
                     'id' => $transaksiSelesai->id,
                     'Tanggal_Transaksi' => '2026-05-31',
                     'no_Faktur' => 'PB-2605311001',
                     'Nama_pasien_atau_Distributor' => 'Ahmad Rafli',
                     'Total_Harga' => 150000.00
                 ])
                 ->assertJsonMissing(['id' => $transaksiPending->id]);
    }

    /**
     * Test filter tanggal transaksi
     */
    public function test_authenticated_user_can_filter_laporan_penjualan_by_date(): void
    {
        Sanctum::actingAs($this->karyawan, ['*']);

        // Transaksi tanggal 25 Mei
        $t1 = Transaksi::create([
            'order_id' => 'ORD-1', 'tipe_transaksi' => 'Produk', 'no_faktur' => 'PB-T1',
            'nama_pasien_distributor' => 'Pasien A', 'karyawan_id' => $this->karyawan->id,
            'tanggal_transaksi' => '2026-05-25', 'status' => 'Selesai', 'total_keseluruhan' => 100000
        ]);

        // Transaksi tanggal 30 Mei
        $t2 = Transaksi::create([
            'order_id' => 'ORD-2', 'tipe_transaksi' => 'Produk', 'no_faktur' => 'PB-T2',
            'nama_pasien_distributor' => 'Pasien B', 'karyawan_id' => $this->karyawan->id,
            'tanggal_transaksi' => '2026-05-30', 'status' => 'Selesai', 'total_keseluruhan' => 200000
        ]);

        // Filter start_date = 2026-05-28
        $response = $this->getJson('/api/laporan-penjualan?start_date=2026-05-28');
        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data')
                 ->assertJsonPath('data.0.no_Faktur', 'PB-T2');

        // Filter end_date = 2026-05-27
        $response2 = $this->getJson('/api/laporan-penjualan?end_date=2026-05-27');
        $response2->assertStatus(200)
                  ->assertJsonCount(1, 'data')
                  ->assertJsonPath('data.0.no_Faktur', 'PB-T1');
    }

    /**
     * Test pencarian laporan penjualan
     */
    public function test_authenticated_user_can_search_laporan_penjualan(): void
    {
        Sanctum::actingAs($this->karyawan, ['*']);

        Transaksi::create([
            'order_id' => 'ORD-1', 'tipe_transaksi' => 'Produk', 'no_faktur' => 'PB-FAKTUR-X',
            'nama_pasien_distributor' => 'Distributor Raya', 'karyawan_id' => $this->karyawan->id,
            'tanggal_transaksi' => '2026-05-31', 'status' => 'Selesai', 'total_keseluruhan' => 100000
        ]);

        Transaksi::create([
            'order_id' => 'ORD-2', 'tipe_transaksi' => 'Produk', 'no_faktur' => 'PB-FAKTUR-Y',
            'nama_pasien_distributor' => 'Candra Wijaya', 'karyawan_id' => $this->karyawan->id,
            'tanggal_transaksi' => '2026-05-31', 'status' => 'Selesai', 'total_keseluruhan' => 200000
        ]);

        // Cari "Raya"
        $response = $this->getJson('/api/laporan-penjualan?search=Raya');
        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data')
                 ->assertJsonPath('data.0.no_Faktur', 'PB-FAKTUR-X');

        // Cari "FAKTUR-Y"
        $response2 = $this->getJson('/api/laporan-penjualan?search=FAKTUR-Y');
        $response2->assertStatus(200)
                  ->assertJsonCount(1, 'data')
                  ->assertJsonPath('data.0.Nama_pasien_atau_Distributor', 'Candra Wijaya');
    }

    /**
     * Test melihat detail Laporan Penjualan dengan format yang sesuai
     */
    public function test_authenticated_user_can_view_laporan_penjualan_detail(): void
    {
        Sanctum::actingAs($this->karyawan, ['*']);

        // Buat produk dummy
        $produk = StokProduk::create([
            'Nama_produk' => 'Cream Pagi',
            'Kode_Produk' => 'PRD-001',
            'Kategori' => 'Skincare',
            'Stok' => 100,
            'Harga' => 75000.00
        ]);

        // Buat transaksi selesai
        $transaksi = Transaksi::create([
            'order_id' => 'ORD-100',
            'tipe_transaksi' => 'Produk',
            'no_faktur' => 'PB-2605312002',
            'nama_pasien_distributor' => 'Ahmad Rafli',
            'data_pasien_id' => $this->pasien->id,
            'alamat_pengiriman' => 'Jl. Gebang Kidul No. 12',
            'karyawan_id' => $this->karyawan->id,
            'tanggal_transaksi' => '2026-05-31',
            'catatan_pesanan' => 'Kirim cepat',
            'status' => 'Selesai',
            'total_keseluruhan' => 150000.00
        ]);

        // Buat detail transaksi
        TransaksiDetail::create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'transaksi_id' => $transaksi->id,
            'itemable_type' => 'App\Models\StokProduk',
            'itemable_id' => $produk->id,
            'nama_item' => 'Cream Pagi',
            'qty' => 2,
            'harga' => 75000.00,
            'total_harga' => 150000.00
        ]);

        $response = $this->getJson("/api/laporan-penjualan/{$transaksi->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('status', 'success')
                 ->assertJsonPath('data.No_Faktur', 'PB-2605312002')
                 ->assertJsonPath('data.Nama_Customer', 'Ahmad Rafli')
                 ->assertJsonPath('data.No_RM', '01-02-03')
                 ->assertJsonPath('data.Alamat_Pengiriman', 'Jl. Gebang Kidul No. 12')
                 ->assertJsonPath('data.Tanggal_Transaksi', '2026-05-31')
                 ->assertJsonPath('data.Nama_Kasir_atau_MOS', 'Kasir PBICS')
                 ->assertJsonPath('data.Catatan_Pesanan', 'Kirim cepat')
                 ->assertJsonCount(1, 'data.details')
                 ->assertJsonFragment([
                     'Nama_Produk' => 'Cream Pagi',
                     'Qty' => 2,
                     'Harga' => 75000.00,
                     'Total_Harga' => 150000.00
                 ]);
    }

    /**
     * Test detail return 404 jika belum selesai atau tidak ditemukan
     */
    public function test_view_detail_returns_404_for_invalid_transactions(): void
    {
        Sanctum::actingAs($this->karyawan, ['*']);

        // Transaksi belum selesai (Pending)
        $transaksiPending = Transaksi::create([
            'order_id' => 'ORD-300',
            'tipe_transaksi' => 'Produk',
            'no_faktur' => null,
            'nama_pasien_distributor' => 'Pasien C',
            'karyawan_id' => $this->karyawan->id,
            'tanggal_transaksi' => '2026-05-31',
            'status' => 'Pending',
            'total_keseluruhan' => 100000
        ]);

        // Coba akses pending
        $responsePending = $this->getJson("/api/laporan-penjualan/{$transaksiPending->id}");
        $responsePending->assertStatus(404);

        // Coba akses non-existent UUID
        $randomUuid = \Illuminate\Support\Str::uuid()->toString();
        $responseMissing = $this->getJson("/api/laporan-penjualan/{$randomUuid}");
        $responseMissing->assertStatus(404);
    }
}
