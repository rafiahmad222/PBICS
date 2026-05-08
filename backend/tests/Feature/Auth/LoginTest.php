<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use App\Models\DataKaryawan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test untuk memastikan user dapat login dengan kredensial yang benar.
     */
    public function test_user_can_login_with_correct_credentials(): void
    {
        // 1. Persiapan Data (Setup)
        $karyawan = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'HRD Tester',
            'Nomor_Identitas' => '1234567890',
            'Tempat_Lahir' => 'Jember',
            'Tanggal_Lahir' => '1990-01-01',
            'Divisi' => 'HRD',
            'Cabang' => 'Jember',
            'Email' => 'hrd@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'hrd_tester',
            'Password' => Hash::make('password123'),
            'kode_karyawan' => 'STF-001',
            'Tanggal_bergabung' => '2026-05-08',
        ]);

        // 2. Aksi (Action)
        $response = $this->postJson('/api/login', [
            'Username' => 'hrd_tester',
            'Password' => 'password123',
        ]);

        // 3. Verifikasi (Assertion)
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'access_token',
                     'data' => [
                         'id',
                         'nama_lengkap',
                         'jabatan',
                         'divisi',
                         'cabang'
                     ]
                 ])
                 ->assertJson([
                     'message' => 'Login berhasil',
                 ]);
    }

    public function test_user_cannot_login_with_wrong_password(): void
    {
        // 1. Persiapan Data (Setup)
        DataKaryawan::create([
            'NamaLengkap_karyawan' => 'HRD Tester 2',
            'Nomor_Identitas' => '1234567891',
            'Tempat_Lahir' => 'Jember',
            'Tanggal_Lahir' => '1990-01-01',
            'Divisi' => 'HRD',
            'Cabang' => 'Jember',
            'Email' => 'hrd2@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'hrd_salah',
            'Password' => Hash::make('password123'),
            'kode_karyawan' => 'STF-002',
            'Tanggal_bergabung' => '2026-05-08',
        ]);

        // 2. Aksi (Action)
        $response = $this->postJson('/api/login', [
            'Username' => 'hrd_salah',
            'Password' => 'salahpassword',
        ]);

        // 3. Verifikasi (Assertion)
        $response->assertStatus(401)
                 ->assertJson([
                     'message' => 'Username atau Password salah!'
                 ]);
    }
}