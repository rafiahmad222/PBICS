<?php

namespace Tests\Feature\DataPasien;

use Tests\TestCase;
use App\Models\DataKaryawan;
use App\Models\DataPasien;
use App\Models\KabKota;
use App\Models\Kec;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class GetDistribusiWilayahTest extends TestCase
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
            'Email' => 'cs_test@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'cs_pasien_test',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'CS-005',
            'Tanggal_bergabung' => '2026-05-08',
        ]);
    }

    public function test_can_get_patient_distribution_aggregated_by_kecamatan(): void
    {
        Sanctum::actingAs($this->user, ['*']);

        // Setup Wilayah
        $kabkota = KabKota::create(['name' => 'Jember']);
        $kecA = Kec::create(['KabKota_id' => $kabkota->id, 'name' => 'Kaliwates']);
        $kecB = Kec::create(['KabKota_id' => $kabkota->id, 'name' => 'Sumbersari']);

        // Setup Pasien
        DataPasien::create([
            'Nama_pasien' => 'Pasien Kaliwates 1',
            'no_Identitas' => '111111111111',
            'Tempat_Lahir' => 'Jember',
            'Tanggal_Lahir' => '1995-10-10',
            'Jenis_Kelamin' => 'L',
            'no_Telp' => '085544332211',
            'no_RM' => '00-00-01',
            'kode_Customer' => '2026-06-0001',
            'Tipe_Member' => 'Non Member',
            'KabKota_id' => $kabkota->id,
            'Kec_id' => $kecA->id,
        ]);

        DataPasien::create([
            'Nama_pasien' => 'Pasien Kaliwates 2',
            'no_Identitas' => '222222222222',
            'Tempat_Lahir' => 'Jember',
            'Tanggal_Lahir' => '1996-10-10',
            'Jenis_Kelamin' => 'P',
            'no_Telp' => '085544332212',
            'no_RM' => '00-00-02',
            'kode_Customer' => '2026-06-0002',
            'Tipe_Member' => 'Non Member',
            'KabKota_id' => $kabkota->id,
            'Kec_id' => $kecA->id,
        ]);

        DataPasien::create([
            'Nama_pasien' => 'Pasien Sumbersari 1',
            'no_Identitas' => '333333333333',
            'Tempat_Lahir' => 'Jember',
            'Tanggal_Lahir' => '1997-10-10',
            'Jenis_Kelamin' => 'L',
            'no_Telp' => '085544332213',
            'no_RM' => '00-00-03',
            'kode_Customer' => '2026-06-0003',
            'Tipe_Member' => 'Non Member',
            'KabKota_id' => $kabkota->id,
            'Kec_id' => $kecB->id,
        ]);

        // Aksi
        $response = $this->getJson('/api/pasien-distribusi');

        // Verifikasi
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'data' => [
                         '*' => ['kecamatan', 'total_pasien']
                     ]
                 ]);

        // Verifikasi isi data agregasi
        $data = $response->json('data');
        $this->assertCount(2, $data);

        // Cari Kaliwates
        $kaliwatesData = collect($data)->firstWhere('kecamatan', 'Kaliwates');
        $this->assertNotNull($kaliwatesData);
        $this->assertEquals(2, $kaliwatesData['total_pasien']);

        // Cari Sumbersari
        $sumbersariData = collect($data)->firstWhere('kecamatan', 'Sumbersari');
        $this->assertNotNull($sumbersariData);
        $this->assertEquals(1, $sumbersariData['total_pasien']);
    }

    public function test_cannot_access_distribution_without_authentication(): void
    {
        $response = $this->getJson('/api/pasien-distribusi');
        $response->assertStatus(401);
    }
}
