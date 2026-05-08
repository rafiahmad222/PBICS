<?php

namespace Tests\Feature\Wilayah;

use Tests\TestCase;
use App\Models\KabKota;
use App\Models\DataKaryawan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class GetKabKotaTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test mendapatkan semua data Kabupaten/Kota
     */
    public function test_can_get_all_kabupaten_kota(): void
    {
        // Setup User Auth
        $user = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Admin Wilayah',
            'Nomor_Identitas' => '1122334455',
            'Tempat_Lahir' => 'Surabaya',
            'Tanggal_Lahir' => '1990-01-01',
            'Divisi' => 'Customer Service',
            'Cabang' => 'Jember',
            'Email' => 'admin_wilayah@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'admin_wilayah',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'CS-005',
            'Tanggal_bergabung' => '2026-05-08',
        ]);
        Sanctum::actingAs($user, ['*']);

        // Setup Wilayah
        KabKota::create(['name' => 'Jember']);
        KabKota::create(['name' => 'Lumajang']);

        // Aksi
        $response = $this->getJson('/api/wilayah/kabkota');

        // Verifikasi
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'data' => [
                         '*' => ['id', 'name']
                     ]
                 ])
                 ->assertJsonCount(2, 'data')
                 ->assertJsonFragment(['name' => 'Jember']);
    }
}
