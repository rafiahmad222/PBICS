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

        $counters = [
            'OWN' => 1,
            'SAD' => 1,
            'LD' => 1,
            'STF' => 1,
        ];

        for ($i = 0; $i < 27; $i++) {
            $divisi = $faker->randomElement(['Super Admin', 'Owner', 'Dokter', 'Customer Service', 'HRD', 'Supervisor Treatment', 'Supervisor Produk', 'Gudang Umum', 'Staff OB', 'Staff Satpam', 'Apoteker', 'Asisten Apoteker', 'Asisten Supervisor Treatment']);
            
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
