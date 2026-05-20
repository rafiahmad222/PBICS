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
        $faker = Faker::create('id_ID');

        // Membuat data Super Admin secara manual (tanpa faker)
        DataKaryawan::create([
            'NamaLengkap_karyawan' => 'Super Admin PBICS',
            'Nomor_Identitas' => '1234567890123456',
            'kode_karyawan' => 'SAD-001',
            'Tanggal_Lahir' => '1995-01-01',
            'Tempat_Lahir' => 'Jember',
            'Alamat' => 'Jl. PB Sudirman No. 1, Jember',
            'Divisi' => 'Super Admin',
            'Jabatan' => null,
            'Cabang' => 'Jember',
            'Email' => 'superadmin@gmail.com',
            'No_Telp' => '081234567890',
            'Username' => 'superadmin',
            'Password' => Hash::make('password123'),
            'Tanggal_bergabung' => '2021-01-01',
        ]);

        $counters = [
            'OWN' => 1,
            'SAD' => 2, // Mulai dari 2 karena SAD-001 sudah digunakan secara manual
            'LD' => 1,
            'STF' => 1,
        ];

        for ($i = 0; $i < 50; $i++) {
            $divisi = $faker->randomElement([
                'Super Admin',
                'Owner',
                'Dokter',
                'Customer Service',
                'HRD',
                'Supervisor Treatment',
                'Supervisor Produk',
                'Manajer Marketing of Sales',
                'Gudang Umum',
                'Staff OB',
                'Staff Satpam',
                'Apoteker',
                'Asisten Apoteker',
                'Asisten Supervisor Treatment']);
            
            if ($divisi === 'Owner' || $divisi === 'Super Admin') {
                $jabatan = null;
            } else {
                $jabatan = $faker->randomElement(['Lead','Anggota Staff']);
            }

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
