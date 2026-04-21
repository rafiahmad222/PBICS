<?php

namespace Database\Seeders;

use App\Models\KabKota;
use App\Models\Kec;
use Illuminate\Database\Seeder;

class KecSeeder extends Seeder
{
    public function run(): void
    {
        // Load regencies.csv untuk mapping
        $regenciesFile = base_path('regencies.csv');
        $regenciesLines = file($regenciesFile);
        $regencyMap = [];  // id_regency => name

        for ($i = 1; $i < count($regenciesLines); $i++) {
            $data = str_getcsv($regenciesLines[$i]);
            if (count($data) >= 3) {
                $regencyMap[$data[0]] = trim($data[2]);
            }
        }

        // Load districts.csv
        $file = base_path('districts.csv');
        $lines = file($file);

        for ($i = 0; $i < count($lines); $i++) {
            $data = str_getcsv($lines[$i]);

            if (count($data) >= 3) {
                $regencyId = $data[1];
                $districtName = trim($data[2]);

                // Cari nama kab/kota dari mapping
                $kabKotaName = $regencyMap[$regencyId] ?? null;

                if ($kabKotaName) {
                    // Cari kab_kota.id berdasarkan nama
                    $kabKota = KabKota::where('name', $kabKotaName)->first();

                    if ($kabKota) {
                        Kec::firstOrCreate([
                            'KabKota_id' => $kabKota->id,
                            'name' => $districtName
                        ]);
                    }
                }
            }
        }
    }
}
