<?php

namespace Tests\Feature\DataKaryawan;

use Tests\TestCase;
use App\Models\DataKaryawan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class UpdateKaryawanTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Setup User Auth
        $this->user = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Admin Update',
            'Nomor_Identitas' => '1122334455',
            'Tempat_Lahir' => 'Surabaya',
            'Tanggal_Lahir' => '1990-01-01',
            'Divisi' => 'HRD',
            'Cabang' => 'Jember',
            'Email' => 'hrd_update@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'hrd_update',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'HRD-002',
            'Tanggal_bergabung' => '2026-05-08',
        ]);
    }

    public function test_can_update_karyawan(): void
    {
        Sanctum::actingAs($this->user, ['*']);

        $karyawan = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Karyawan Lama',
            'Nomor_Identitas' => '999999999',
            'Tempat_Lahir' => 'Jember',
            'Tanggal_Lahir' => '1995-01-01',
            'Divisi' => 'Staff OB',
            'Cabang' => 'Jember',
            'Email' => 'lama@gmail.com',
            'No_Telp' => '08111',
            'Username' => 'lama',
            'Password' => bcrypt('password123'),
            'kode_karyawan' => 'STF-001',
            'Tanggal_bergabung' => '2026-05-08',
        ]);

        $response = $this->putJson('/api/karyawan/' . $karyawan->id, [
            'NamaLengkap_karyawan' => 'Karyawan Diubah',
            'Email' => 'diubah@gmail.com'
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Data karyawan berhasil diupdate'
                 ]);

        $this->assertDatabaseHas('data_karyawan', [
            'id' => $karyawan->id,
            'NamaLengkap_karyawan' => 'Karyawan Diubah',
            'Email' => 'diubah@gmail.com'
        ]);
    }
}
