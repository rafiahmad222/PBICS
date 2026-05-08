<?php

namespace Tests\Feature\DataPasien;

use Tests\TestCase;
use App\Models\DataKaryawan;
use App\Models\DataPasien;
use App\Models\KabKota;
use App\Models\Kec;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class CreatePasienTest extends TestCase
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
            'Email' => 'cs@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'cs_pasien',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'CS-001',
            'Tanggal_bergabung' => '2026-05-08',
        ]);

        $this->kabkota = KabKota::create(['name' => 'Jember']);
        $this->kec = Kec::create(['KabKota_id' => $this->kabkota->id, 'name' => 'Kaliwates']);
    }

    public function test_can_create_new_pasien(): void
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->postJson('/api/pasien', [
            'Nama_pasien' => 'Pasien Testing',
            'no_Identitas' => '998877665544',
            'Tempat_Lahir' => 'Jember',
            'Tanggal_Lahir' => '1995-10-10',
            'Jenis_Kelamin' => 'Laki-laki',
            'no_Telp' => '085544332211',
            'KabKota_id' => $this->kabkota->id,
            'Kec_id' => $this->kec->id,
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'data' => [
                         'id',
                         'kode_Customer',
                         'no_RM',
                         'Nama_pasien'
                     ]
                 ]);

        $this->assertDatabaseHas('data_pasiens', [
            'Nama_pasien' => 'Pasien Testing',
            'Tipe_member' => 'Non Member', // Default fallback
            'Jenis_Kelamin' => 'L'
        ]);
    }

    public function test_create_pasien_validation_fails_if_empty(): void
    {
        Sanctum::actingAs($this->user, ['*']);

        $response = $this->postJson('/api/pasien', []);

        $response->assertStatus(422)
                 ->assertJsonStructure(['status', 'errors']);
    }
}
