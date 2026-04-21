<?php

namespace Database\Seeders;

use App\Models\KabKota;
use Illuminate\Database\Seeder;

class KabKotaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $file = base_path('regencies.csv');
        $lines = file($file);
        $uniqueNames = [];

        // Skip header row
        for ($i = 1; $i < count($lines); $i++) {
            $data = str_getcsv($lines[$i]);

            if (count($data) >= 3) {
                $name = trim($data[2]);
                // Hindari duplikat nama
                if (!in_array($name, $uniqueNames)) {
                    KabKota::firstOrCreate([
                        'name' => $name
                    ]);
                    $uniqueNames[] = $name;
                }
            }
        }
    }
}
