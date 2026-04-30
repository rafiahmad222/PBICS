<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\DataKaryawan;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class DataKaryawanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // DataKaryawan::create([
        //     'NamaLengkap_karyawan' => 'Admin Utama',
        //     'Nomor_Identitas' => '1234567890123456',
        //     'Tanggal_Lahir' => '1990-01-01',
        //     'Tempat_Lahir' => 'Jakarta',
        //     'Alamat' => 'Jl. Kebangsaan No. 1, Jakarta',
        //     'Divisi' => 'Manager',
        //     'Jabatan' => 'Lead',
        //     'Cabang' => 'Jember',
        //     'Email' => 'admin@pbics.com',
        //     'No_Telp' => '081234567890',
        //     'Username' => 'admin',
        //     'Password' => Hash::make('password123'),
        //     'Tanggal_bergabung' => '2023-01-01',
        // ]);

        // DataKaryawan::create([
        //     'NamaLengkap_karyawan' => 'Dr. Budi Santoso',
        //     'Nomor_Identitas' => '1234567890123457',
        //     'Tanggal_Lahir' => '1985-05-15',
        //     'Tempat_Lahir' => 'Bandung',
        //     'Alamat' => 'Jl. Kesehatan No. 2, Bandung',
        //     'Divisi' => 'Dokter',
        //     'Jabatan' => 'Anggota Staff',
        //     'Cabang' => 'Jember',
        //     'Email' => 'budi.santoso@pbics.com',
        //     'No_Telp' => '081234567891',
        //     'Username' => 'drbudi',
        //     'Password' => Hash::make('password123'),
        //     'Tanggal_bergabung' => '2023-02-01',
        // ]);
        
        // DataKaryawan::create([
        //     'NamaLengkap_karyawan' => 'Siti Aminah',
        //     'Nomor_Identitas' => '1234567890123458',
        //     'Tanggal_Lahir' => '1992-10-20',
        //     'Tempat_Lahir' => 'Surabaya',
        //     'Alamat' => 'Jl. Melati No. 3, Surabaya',
        //     'Divisi' => 'Kasir',
        //     'Jabatan' => 'Anggota Staff',
        //     'Cabang' => 'Lumajang',
        //     'Email' => 'siti.aminah@pbics.com',
        //     'No_Telp' => '081234567892',
        //     'Username' => 'siti',
        //     'Password' => Hash::make('password123'),
        //     'Tanggal_bergabung' => '2023-03-01',
        // ]);

        $faker = Faker::create('id_ID');

        $counters = [
            'OWN' => 1,
            'SAD' => 1,
            'LD' => 1,
            'STF' => 1,
        ];

        for ($i = 0; $i < 27; $i++) {
            $divisi = $faker->randomElement(['Super Admin', 'Owner', 'Dokter', 'Customer Service', 'HRD', 'Supervisor Treatment', 'Supervisor Produk', 'Gudang Umum', 'Staff OB', 'Staff Satpam', 'Apoteker', 'Asisten Apoteker', 'Asisten Supervisor Treatment']);
            $jabatan = $faker->randomElement(['Lead','Anggota Staff']);

            if ($divisi === 'Owner') {
                $prefix = 'OWN';
            } elseif ($divisi === 'Super Admin') {
                $prefix = 'SAD';
            } elseif ($jabatan === 'Lead') {
                $prefix = 'LD';
            } else {
                $prefix = 'STF';
            }

            $kodeKaryawan = $prefix . '-' . str_pad($counters[$prefix]++, 3, '0', STR_PAD_LEFT);

            DataKaryawan::create([
                'NamaLengkap_karyawan' => $faker->name,
                'Nomor_Identitas' => $faker->numerify('################'),
                'kode_karyawan' => $kodeKaryawan,
                'Tanggal_Lahir' => $faker->date('Y-m-d', '2005-01-01'),
                'Tempat_Lahir' => $faker->city,
                'Alamat' => $faker->address,
                'Divisi' => $divisi,
                'Jabatan' => $jabatan,
                'Cabang' => $faker->randomElement(['Jember','Lumajang']),
                'Email' => $faker->unique()->safeEmail,
                'No_Telp' => $faker->numerify('08##########'),
                'Username' => $faker->unique()->userName,
                'Password' => Hash::make('password123'),
                'Tanggal_bergabung' => $faker->dateTimeBetween('-5 years', 'now')->format('Y-m-d'),
            ]);
        }
    }
}
