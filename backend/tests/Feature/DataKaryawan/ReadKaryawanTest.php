<?php

namespace Tests\Feature\DataKaryawan;

use Tests\TestCase;
use App\Models\DataKaryawan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class ReadKaryawanTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup User Auth
        $this->user = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Admin Read',
            'Nomor_Identitas' => '1122334455',
            'Tempat_Lahir' => 'Surabaya',
            'Tanggal_Lahir' => '1990-01-01',
            'Divisi' => 'HRD',
            'Cabang' => 'Jember',
            'Email' => 'hrd_read@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'hrd_read',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'HRD-001',
            'Tanggal_bergabung' => '2026-05-08',
        ]);
    }

    public function test_can_get_all_karyawan(): void
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->getJson('/api/karyawan');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'data' => [
                         'data' => [
                             '*' => ['id', 'kode_karyawan', 'nama_lengkap', 'inisial', 'jabatan', 'cabang']
                         ]
                     ]
                 ]);
    }

    public function test_can_get_single_karyawan(): void
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->getJson('/api/karyawan/' . $this->user->id);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'data' => [
                         'id', 'NamaLengkap_karyawan', 'Email', 'Divisi'
                     ]
                 ])
                 ->assertJsonPath('data.NamaLengkap_karyawan', 'Admin Read');
    }
}
