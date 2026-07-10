<?php

namespace Tests\Feature\Promo;

use Tests\TestCase;
use App\Models\DataKaryawan;
use App\Models\Promo;
use App\Models\PromoVoucher;
use App\Models\PromoTarget;
use App\Models\StokProduk;
use App\Models\Treatment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Carbon\Carbon;

class PromoTest extends TestCase
{
    use RefreshDatabase;

    private DataKaryawan $admin;
    private DataKaryawan $karyawanBiasa;
    private StokProduk $produk1;
    private StokProduk $produk2;
    private Treatment $treatment1;

    protected function setUp(): void
    {
        parent::setUp();

        // Buat Karyawan dengan Divisi Super Admin (Akses CRUD Promo)
        $this->admin = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Admin Promo',
            'Nomor_Identitas' => '1122334455667788',
            'Tempat_Lahir' => 'Jember',
            'Tanggal_Lahir' => '1995-01-01',
            'Divisi' => 'Super Admin',
            'Jabatan' => 'Lead',
            'Cabang' => 'Jember',
            'Email' => 'admin_promo@gmail.com',
            'No_Telp' => '081234567891',
            'Username' => 'admin_promo',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'ADM-002',
            'Tanggal_bergabung' => '2026-05-08',
        ]);

        // Buat Karyawan dengan Divisi Pantry (Bukan akses CRUD Promo)
        $this->karyawanBiasa = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Karyawan Pantry',
            'Nomor_Identitas' => '8877665544332211',
            'Tempat_Lahir' => 'Jember',
            'Tanggal_Lahir' => '1998-02-02',
            'Divisi' => 'Pantry',
            'Jabatan' => 'Anggota Staff',
            'Cabang' => 'Jember',
            'Email' => 'pantry@gmail.com',
            'No_Telp' => '081234567892',
            'Username' => 'pantry_staff',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'STF-009',
            'Tanggal_bergabung' => '2026-05-08',
        ]);

        // Seed data produk & treatment untuk relasi promo targets
        $this->produk1 = StokProduk::create([
            'Nama_produk' => 'Serum Glowing',
            'Kode_Produk' => 'PROD-001',
            'Kategori' => 'Serum',
            'Harga' => 150000,
            'Harga_Distributor' => 120000,
            'Stok' => 50,
        ]);

        $this->produk2 = StokProduk::create([
            'Nama_produk' => 'Sunscreen SPF 50',
            'Kode_Produk' => 'PROD-002',
            'Kategori' => 'Sunscreen',
            'Harga' => 100000,
            'Harga_Distributor' => 80000,
            'Stok' => 50,
        ]);

        $this->treatment1 = Treatment::create([
            'Kode_treatment' => 'TRT-001',
            'Nama_treatment' => 'Facial Treatment',
            'Kategori' => 'Facial',
            'Harga' => 200000,
        ]);
    }

    /**
     * Test CRUD Promo & Validasi Hak Akses.
     */
    public function test_super_admin_can_crud_promos(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        // 1. Simpan Promo Baru
        $response = $this->postJson('/api/promos', [
            'kategori' => 'Produk',
            'nama_promo' => 'Promo Merdeka',
            'mode_promo' => 'basic',
            'tipe_diskon' => 'persentase',
            'nilai_diskon' => 10.00,
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-08-01',
            'is_voucher_fisik' => false,
            'kode_promo' => 'MERDEKA10',
            'kuota_global' => 100,
            'status' => 'Aktif'
        ]);

        $response->assertStatus(210)
                 ->assertJsonFragment([
                     'nama_promo' => 'Promo Merdeka',
                     'kode_promo' => 'MERDEKA10'
                 ]);

        $this->assertDatabaseHas('promos', [
            'kode_promo' => 'MERDEKA10',
            'status' => 'Aktif'
        ]);

        $promoId = $response->json('data.id');

        // 2. Tampilkan Detail Promo
        $response = $this->getJson("/api/promos/{$promoId}");
        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'id' => $promoId,
                     'nama_promo' => 'Promo Merdeka'
                 ]);

        // 3. Update Promo
        $response = $this->putJson("/api/promos/{$promoId}", [
            'kategori' => 'Produk',
            'nama_promo' => 'Promo Merdeka v2',
            'mode_promo' => 'basic',
            'tipe_diskon' => 'persentase',
            'nilai_diskon' => 15.00,
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-08-01',
            'is_voucher_fisik' => false,
            'kode_promo' => 'MERDEKA15',
            'kuota_global' => 200,
            'status' => 'Aktif'
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'nama_promo' => 'Promo Merdeka v2',
                     'kode_promo' => 'MERDEKA15'
                 ]);

        // 4. Hapus Promo (Soft Delete)
        $response = $this->deleteJson("/api/promos/{$promoId}");
        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'message' => 'Promo berhasil dihapus.'
                 ]);

        $this->assertSoftDeleted('promos', [
            'id' => $promoId
        ]);
    }

    /**
     * Test Pantry/Karyawan Biasa tidak bisa akses CRUD Promo.
     */
    public function test_karyawan_biasa_cannot_access_crud_promos(): void
    {
        Sanctum::actingAs($this->karyawanBiasa, ['*']);

        $response = $this->postJson('/api/promos', [
            'kategori' => 'Produk',
            'nama_promo' => 'Promo Klandestin',
            'mode_promo' => 'basic',
            'tipe_diskon' => 'persentase',
            'nilai_diskon' => 10.00,
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-08-01',
            'is_voucher_fisik' => false,
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test Auto-generate kode promo jika non-voucher fisik kosong.
     */
    public function test_auto_generate_kode_promo(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->postJson('/api/promos', [
            'kategori' => 'Produk',
            'nama_promo' => 'Promo Auto Kode',
            'mode_promo' => 'basic',
            'tipe_diskon' => 'persentase',
            'nilai_diskon' => 10.00,
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-08-01',
            'is_voucher_fisik' => false,
            'status' => 'Aktif'
        ]);

        $response->assertStatus(210);
        $kodePromo = $response->json('data.kode_promo');
        $this->assertNotEmpty($kodePromo);
        $this->assertStringStartsWith('PRM-', $kodePromo);
    }

    /**
     * Test generate voucher fisik (jumlah_voucher N).
     */
    public function test_generate_physical_vouchers(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->postJson('/api/promos', [
            'kategori' => 'Produk',
            'nama_promo' => 'Promo Voucher Fisik',
            'mode_promo' => 'basic',
            'tipe_diskon' => 'persentase',
            'nilai_diskon' => 10.00,
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-08-01',
            'is_voucher_fisik' => true,
            'jumlah_voucher' => 10,
            'status' => 'Aktif'
        ]);

        $response->assertStatus(210);
        $this->assertCount(10, $response->json('data.vouchers'));

        $promoId = $response->json('data.id');
        $this->assertEquals(10, PromoVoucher::where('promo_id', $promoId)->count());
    }

    /**
     * Test POS Validation - Minimum Belanja.
     */
    public function test_pos_validation_min_order(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        // Buat promo min order
        $promo = Promo::create([
            'kategori' => 'Kombinasi',
            'nama_promo' => 'Diskon Gajian',
            'mode_promo' => 'min_order',
            'tipe_diskon' => 'nominal',
            'nilai_diskon' => 50000,
            'min_order_amount' => 300000,
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-07-20',
            'is_voucher_fisik' => false,
            'kode_promo' => 'GAJIAN50',
            'kuota_global' => 100,
            'status' => 'Aktif'
        ]);

        Carbon::setTestNow('2026-07-10');

        // 1. Uji belanja kurang dari minimum
        $response = $this->postJson('/api/promos/validate', [
            'kode' => 'GAJIAN50',
            'total_belanja' => 200000,
            'items' => [
                ['item_type' => 'Produk', 'item_id' => $this->produk1->id, 'qty' => 1, 'harga' => 150000]
            ]
        ]);

        $response->assertStatus(422)
                 ->assertJsonFragment([
                     'status' => 'invalid',
                     'message' => 'Total belanja minimum sebesar Rp 300.000 belum terpenuhi.'
                 ]);

        // 2. Uji belanja memenuhi minimum
        $response = $this->postJson('/api/promos/validate', [
            'kode' => 'GAJIAN50',
            'total_belanja' => 350000,
            'items' => [
                ['item_type' => 'Produk', 'item_id' => $this->produk1->id, 'qty' => 2, 'harga' => 150000],
                ['item_type' => 'Treatment', 'item_id' => $this->treatment1->id, 'qty' => 1, 'harga' => 50000]
            ]
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'status' => 'valid',
                     'discount_amount' => 50000
                 ]);

        Carbon::setTestNow();
    }

    /**
     * Test POS Validation - Bundle (Syarat & Benefit).
     */
    public function test_pos_validation_bundle(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        // Buat promo bundle: beli serum glowing (syarat), tebus murah sunscreen (benefit diskon 50%)
        $promo = Promo::create([
            'kategori' => 'Produk',
            'nama_promo' => 'Tebus Murah Sunscreen',
            'mode_promo' => 'bundle',
            'tipe_diskon' => 'persentase',
            'nilai_diskon' => 50,
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-07-20',
            'is_voucher_fisik' => false,
            'kode_promo' => 'TEBUSSPF',
            'kuota_global' => 10,
            'status' => 'Aktif'
        ]);

        // Syarat target
        PromoTarget::create([
            'promo_id' => $promo->id,
            'target_type' => 'Syarat',
            'item_type' => 'Produk',
            'item_id' => $this->produk1->id // Serum
        ]);

        // Benefit target
        PromoTarget::create([
            'promo_id' => $promo->id,
            'target_type' => 'Benefit',
            'item_type' => 'Produk',
            'item_id' => $this->produk2->id // Sunscreen
        ]);

        Carbon::setTestNow('2026-07-10');

        // 1. Tanpa item syarat
        $response = $this->postJson('/api/promos/validate', [
            'kode' => 'TEBUSSPF',
            'total_belanja' => 100000,
            'items' => [
                ['item_type' => 'Produk', 'item_id' => $this->produk2->id, 'qty' => 1, 'harga' => 100000] // Sunscreen saja
            ]
        ]);

        $response->assertStatus(422)
                 ->assertJsonFragment([
                     'status' => 'invalid',
                     'message' => 'Syarat pembelian item untuk promo ini belum terpenuhi.'
                 ]);

        // 2. Dengan item syarat & benefit
        $response = $this->postJson('/api/promos/validate', [
            'kode' => 'TEBUSSPF',
            'total_belanja' => 250000,
            'items' => [
                ['item_type' => 'Produk', 'item_id' => $this->produk1->id, 'qty' => 1, 'harga' => 150000],
                ['item_type' => 'Produk', 'item_id' => $this->produk2->id, 'qty' => 1, 'harga' => 100000]
            ]
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'status' => 'valid',
                     'discount_amount' => 50000 // 50% dari 100.000 sunscreen
                 ]);

        Carbon::setTestNow();
    }
}
