<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use App\Models\DataKaryawan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class MeTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test mendapatkan data profil user yang sedang login
     */
    public function test_user_can_get_their_profile_data(): void
    {
        // 1. Setup
        $karyawan = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Dr. Budi',
            'Nomor_Identitas' => '333444555',
            'Tempat_Lahir' => 'Surabaya',
            'Tanggal_Lahir' => '1985-12-12',
            'Divisi' => 'Dokter',
            'Cabang' => 'Lumajang',
            'Email' => 'budi_dokter@gmail.com',
            'No_Telp' => '089988776655',
            'Username' => 'budi_doc',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'STF-003',
            'Tanggal_bergabung' => '2026-05-08',
        ]);

        Sanctum::actingAs($karyawan, ['*']);

        // 2. Aksi
        $response = $this->getJson('/api/me');

        // 3. Verifikasi
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'data' => [
                         'id',
                         'NamaLengkap_karyawan',
                         'Divisi',
                         'Email',
                         'Username'
                     ]
                 ])
                 ->assertJsonPath('data.NamaLengkap_karyawan', 'Dr. Budi')
                 ->assertJsonPath('data.Email', 'budi_dokter@gmail.com');
    }

    /**
     * Test gagal akses profil jika tidak login
     */
    public function test_user_cannot_get_profile_if_unauthenticated(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401);
    }
}
