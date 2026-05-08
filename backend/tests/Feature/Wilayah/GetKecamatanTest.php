<?php

namespace Tests\Feature\Wilayah;

use Tests\TestCase;
use App\Models\KabKota;
use App\Models\Kec;
use App\Models\DataKaryawan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class GetKecamatanTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test mendapatkan data Kecamatan berdasarkan ID Kabupaten/Kota
     */
    public function test_can_get_kecamatan_by_kabkota_id(): void
    {
        // Setup User Auth
        $user = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Admin Wilayah 2',
            'Nomor_Identitas' => '1122334455',
            'Tempat_Lahir' => 'Surabaya',
            'Tanggal_Lahir' => '1990-01-01',
            'Divisi' => 'Customer Service',
            'Cabang' => 'Jember',
            'Email' => 'admin_wilayah2@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'admin_wilayah2',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'CS-006',
            'Tanggal_bergabung' => '2026-05-08',
        ]);
        Sanctum::actingAs($user, ['*']);

        // Setup Wilayah
        $kabkota = KabKota::create(['name' => 'Jember']);
        Kec::create(['KabKota_id' => $kabkota->id, 'name' => 'Sumbersari']);
        Kec::create(['KabKota_id' => $kabkota->id, 'name' => 'Patrang']);

        // Aksi
        $response = $this->getJson("/api/wilayah/kecamatan/{$kabkota->id}");

        // Verifikasi
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'data' => [
                         '*' => ['id', 'name']
                     ]
                 ])
                 ->assertJsonCount(2, 'data')
                 ->assertJsonFragment(['name' => 'Sumbersari']);
    }
}
