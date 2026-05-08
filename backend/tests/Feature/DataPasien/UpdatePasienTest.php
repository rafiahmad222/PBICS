<?php

namespace Tests\Feature\DataPasien;

use Tests\TestCase;
use App\Models\DataKaryawan;
use App\Models\DataPasien;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class UpdatePasienTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup User Auth
        $this->user = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Admin Pasien Update',
            'Nomor_Identitas' => '1122334455',
            'Tempat_Lahir' => 'Surabaya',
            'Tanggal_Lahir' => '1990-01-01',
            'Divisi' => 'Customer Service',
            'Cabang' => 'Jember',
            'Email' => 'cs_update@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'cs_pasien_update',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'CS-003',
            'Tanggal_bergabung' => '2026-05-08',
        ]);
    }

    public function test_can_update_pasien_data(): void
    {
        Sanctum::actingAs($this->user, ['*']);

        // Setup Data Pasien awal
        $pasien = DataPasien::create([
            'Nama_pasien' => 'Pasien Lama',
            'no_Identitas' => '123123123',
            'Tempat_Lahir' => 'Jember',
            'Tanggal_Lahir' => '1990-01-01',
            'Jenis_Kelamin' => 'L',
            'no_Telp' => '08111',
            'kode_Customer' => '2026-05-0001',
            'no_RM' => '00-00-01',
            'Tipe_Member' => 'Non Member'
        ]);

        // Aksi update
        $response = $this->putJson('/api/pasien/' . $pasien->id, [
            'Nama_pasien' => 'Pasien Baru Diubah'
        ]);

        // Verifikasi
        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Data pasien berhasil diperbarui'
                 ]);

        $this->assertDatabaseHas('data_pasiens', [
            'id' => $pasien->id,
            'Nama_pasien' => 'Pasien Baru Diubah'
        ]);
    }
}
