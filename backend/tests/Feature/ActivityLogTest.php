<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\DataKaryawan;
use App\Models\ActivityLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test activity log creation with karyawan_id and fetching via controller.
     */
    public function test_activity_log_creation_and_retrieval(): void
    {
        $karyawan = DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Luthfi Tester',
            'Nomor_Identitas' => '1234567890123',
            'Tempat_Lahir' => 'Lumajang',
            'Tanggal_Lahir' => '1995-05-15',
            'Divisi' => 'HRD',
            'Cabang' => 'Lumajang',
            'Email' => 'luthfi@gmail.com',
            'No_Telp' => '081234567891',
            'Username' => 'luthfi_tester',
            'Password' => Hash::make('password123'),
            'kode_karyawan' => 'STF-101',
            'Tanggal_bergabung' => '2026-06-01',
        ]);

        // Authenticate the user
        Sanctum::actingAs($karyawan);

        // Create log manually
        $log = ActivityLog::create([
            'karyawan_id' => $karyawan->id,
            'action' => 'LOGIN',
            'module' => 'Autentikasi',
            'details' => "Karyawan Luthfi Tester berhasil masuk.",
            'created_at' => now(),
        ]);

        // Assert DB has the log
        $this->assertDatabaseHas('activity_logs', [
            'id' => $log->id,
            'karyawan_id' => $karyawan->id,
            'action' => 'LOGIN',
        ]);

        // Assert relationship works
        $retrievedLog = ActivityLog::with('karyawan')->find($log->id);
        $this->assertNotNull($retrievedLog->karyawan);
        $this->assertEquals($karyawan->NamaLengkap_karyawan, $retrievedLog->karyawan->NamaLengkap_karyawan);

        // Test GET API endpoint
        $response = $this->getJson('/api/activity-logs');

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'karyawan_id' => $karyawan->id,
                     'NamaLengkap_karyawan' => 'Luthfi Tester'
                 ]);
    }
}
