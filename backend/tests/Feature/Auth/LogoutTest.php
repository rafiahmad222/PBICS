<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use App\Models\DataKaryawan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class LogoutTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user dapat melakukan logout dengan sukses
     */
    public function test_user_can_logout_successfully(): void
    {
        // 1. Persiapan Data (Setup)
        $karyawan = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'HRD Tester',
            'Nomor_Identitas' => '1234567890',
            'Tempat_Lahir' => 'Jember',
            'Tanggal_Lahir' => '1990-01-01',
            'Divisi' => 'HRD',
            'Cabang' => 'Jember',
            'Email' => 'hrd_logout@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'hrd_logout',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'STF-001',
            'Tanggal_bergabung' => '2026-05-08',
        ]);

        // Autentikasi user menggunakan Sanctum
        Sanctum::actingAs($karyawan, ['*']);

        // 2. Aksi (Action)
        $response = $this->postJson('/api/logout');

        // 3. Verifikasi (Assertion)
        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Logout berhasil'
                 ]);
                 
        // Pastikan token sudah terhapus di database
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    /**
     * Test user gagal logout jika belum login
     */
    public function test_user_cannot_logout_if_unauthenticated(): void
    {
        // Langsung hit endpoint tanpa Sanctum::actingAs
        $response = $this->postJson('/api/logout');

        // Middleware auth:sanctum seharusnya memblokir dengan 401
        $response->assertStatus(401);
    }
}
