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

        // Ambil semua data KabKota sekali saja (mengurangi N+1 query)
        $kabKotaList = KabKota::pluck('id', 'name')->toArray();

        // Load districts.csv
        $file = base_path('districts.csv');
        $lines = file($file);

        $kecsToInsert = [];
        $now = now();

        for ($i = 0; $i < count($lines); $i++) {
            $data = str_getcsv($lines[$i]);

            if (count($data) >= 3) {
                $regencyId = $data[1];
                $districtName = trim($data[2]);

                // Cari nama kab/kota dari mapping csv
                $kabKotaName = $regencyMap[$regencyId] ?? null;

                // Cek apakah KabKota ada di database
                if ($kabKotaName && isset($kabKotaList[$kabKotaName])) {
                    $kecsToInsert[] = [
                        'KabKota_id' => $kabKotaList[$kabKotaName],
                        'name' => $districtName,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }
        }

        // Insert data sekaligus (Bulk Insert / Chunk)
        $chunks = array_chunk($kecsToInsert, 1000);
        foreach ($chunks as $chunk) {
            Kec::insert($chunk); // Akan jauh lebih cepat daripada firstOrCreate satu per satu
        }
    }
}
