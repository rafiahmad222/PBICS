<?php

namespace Tests\Feature\DataKaryawan;

use Tests\TestCase;
use App\Models\DataKaryawan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class CreateKaryawanTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test admin dapat membuat data karyawan baru.
     */
    public function test_admin_can_create_new_karyawan(): void
    {
        // 1. Setup - Authentikasi
        $admin = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Admin Tester',
            'Nomor_Identitas' => '999999999',
            'Tempat_Lahir' => 'Jember',
            'Tanggal_Lahir' => '1990-01-01',
            'Divisi' => 'HRD',
            'Jabatan' => 'Lead',
            'Cabang' => 'Jember',
            'Email' => 'admin_test@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'admin_hrd',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'HRD-001',
            'Tanggal_bergabung' => '2026-05-08',
        ]);
        Sanctum::actingAs($admin, ['*']);

        // 2. Aksi
        $response = $this->postJson('/api/karyawan', [
            'NamaLengkap_karyawan' => 'Staff Baru',
            'Nomor_Identitas' => '1234567890123456',
            'Tempat_Lahir' => 'Surabaya',
            'Tanggal_Lahir' => '1995-05-05',
            'Alamat' => 'Jl. Mawar No 1',
            'Divisi' => 'Staff OB',
            'Jabatan' => 'Anggota Staff',
            'Cabang' => 'Jember',
            'Email' => 'staffbaru@gmail.com',
            'No_Telp' => '08111222333',
            'Username' => 'staff_ob',
            'Password' => 'password123',
        ]);

        // 3. Verifikasi
        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'data' => [
                         'id',
                         'kode_karyawan',
                         'nama_lengkap',
                         'email'
                     ]
                 ]);

        // Pastikan tersimpan di database
        $this->assertDatabaseHas('data_karyawan', [
            'Email' => 'staffbaru@gmail.com',
            'Username' => 'staff_ob'
        ]);
    }

    /**
     * Test validasi required fields gagal jika kosong.
     */
    public function test_create_karyawan_fails_validation(): void
    {
        // 1. Setup - Authentikasi
        $admin = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Admin Tester 2',
            'Nomor_Identitas' => '999999998',
            'Tempat_Lahir' => 'Jember',
            'Tanggal_Lahir' => '1990-01-01',
            'Divisi' => 'HRD',
            'Jabatan' => 'Lead',
            'Cabang' => 'Jember',
            'Email' => 'admin_test2@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'admin_hrd_2',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'HRD-002',
            'Tanggal_bergabung' => '2026-05-08',
        ]);
        Sanctum::actingAs($admin, ['*']);

        // 2. Aksi (Payload kosong)
        $response = $this->postJson('/api/karyawan', []);

        // 3. Verifikasi
        $response->assertStatus(422)
                 ->assertJsonStructure([
                     'status',
                     'errors'
                 ]);
    }
}
