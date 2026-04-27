<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\DataKaryawan;
use Illuminate\Support\Facades\Hash;

class DataKaryawanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Admin Utama',
            'Nomor_Identitas' => '1234567890123456',
            'Tanggal_Lahir' => '1990-01-01',
            'Tempat_Lahir' => 'Jakarta',
            'Alamat' => 'Jl. Kebangsaan No. 1, Jakarta',
            'Divisi' => 'Manager',
            'Jabatan' => 'Lead',
            'Cabang' => 'Jember',
            'Email' => 'admin@pbics.com',
            'No_Telp' => '081234567890',
            'Username' => 'admin',
            'Password' => Hash::make('password123'),
            'Tanggal_bergabung' => '2023-01-01',
        ]);

        DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Dr. Budi Santoso',
            'Nomor_Identitas' => '1234567890123457',
            'Tanggal_Lahir' => '1985-05-15',
            'Tempat_Lahir' => 'Bandung',
            'Alamat' => 'Jl. Kesehatan No. 2, Bandung',
            'Divisi' => 'Dokter',
            'Jabatan' => 'Anggota Staff',
            'Cabang' => 'Jember',
            'Email' => 'budi.santoso@pbics.com',
            'No_Telp' => '081234567891',
            'Username' => 'drbudi',
            'Password' => Hash::make('password123'),
            'Tanggal_bergabung' => '2023-02-01',
        ]);
        
        DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Siti Aminah',
            'Nomor_Identitas' => '1234567890123458',
            'Tanggal_Lahir' => '1992-10-20',
            'Tempat_Lahir' => 'Surabaya',
            'Alamat' => 'Jl. Melati No. 3, Surabaya',
            'Divisi' => 'Kasir',
            'Jabatan' => 'Anggota Staff',
            'Cabang' => 'Lumajang',
            'Email' => 'siti.aminah@pbics.com',
            'No_Telp' => '081234567892',
            'Username' => 'siti',
            'Password' => Hash::make('password123'),
            'Tanggal_bergabung' => '2023-03-01',
        ]);
    }
}
