<?php

namespace Tests\Feature\DataPasien;

use Tests\TestCase;
use App\Models\DataKaryawan;
use App\Models\DataPasien;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class ReadPasienTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup User Auth
        $this->user = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Admin Pasien',
            'Nomor_Identitas' => '1122334455',
            'Tempat_Lahir' => 'Surabaya',
            'Tanggal_Lahir' => '1990-01-01',
            'Divisi' => 'Customer Service',
            'Cabang' => 'Jember',
            'Email' => 'cs_read@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'cs_pasien_read',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'CS-002',
            'Tanggal_bergabung' => '2026-05-08',
        ]);
    }

    public function test_can_get_list_of_pasien(): void
    {
        Sanctum::actingAs($this->user, ['*']);

        // Aksi
        $response = $this->getJson('/api/pasien');

        // Verifikasi
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'data' => [
                         'data', 'current_page', 'last_page'
                     ]
                 ]);
    }
}
