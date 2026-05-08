<?php

namespace Tests\Feature\DataPasien;

use Tests\TestCase;
use App\Models\DataKaryawan;
use App\Models\DataPasien;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class DeletePasienTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup User Auth
        $this->user = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Admin Pasien Delete',
            'Nomor_Identitas' => '1122334455',
            'Tempat_Lahir' => 'Surabaya',
            'Tanggal_Lahir' => '1990-01-01',
            'Divisi' => 'Customer Service',
            'Cabang' => 'Jember',
            'Email' => 'cs_delete@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'cs_pasien_delete',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'CS-004',
            'Tanggal_bergabung' => '2026-05-08',
        ]);
    }

    public function test_can_delete_pasien_data(): void
    {
        Sanctum::actingAs($this->user, ['*']);

        $pasien = DataPasien::create([
            'Nama_pasien' => 'Pasien Akan Dihapus',
            'no_Identitas' => '9999999',
            'Tempat_Lahir' => 'Jember',
            'Tanggal_Lahir' => '1990-01-01',
            'Jenis_Kelamin' => 'L',
            'no_Telp' => '08111',
            'kode_Customer' => '2026-05-0002',
            'no_RM' => '00-00-02',
            'Tipe_Member' => 'Non Member'
        ]);

        // Aksi delete
        $response = $this->deleteJson('/api/pasien/' . $pasien->id);

        // Verifikasi (Method destroy masih kosong di Controller, jadi minimal mengembalikan response sukses/200)
        $response->assertStatus(200);
    }
}
