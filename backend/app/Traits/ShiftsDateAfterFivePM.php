<?php

namespace App\Traits;

use Carbon\Carbon;

trait ShiftsDateAfterFivePM
{
    /**
     * Boot the trait to hook into the model's Eloquent events.
     */
    protected static function bootShiftsDateAfterFivePM()
    {
        static::creating(function ($model) {
            // Jika dalam env testing, abaikan shift kecuali Carbon::hasTestNow() diset (untuk testing trait)
            if (app()->environment('testing') && !Carbon::hasTestNow()) {
                return;
            }

            // Cek apakah waktu saat ini di atas jam 17:00 (5 sore)
            if (Carbon::now()->hour >= 17) {
                // 1. Shift timestamp created_at ke besok (jika model menggunakan timestamps)
                if ($model->timestamps) {
                    $tomorrow = Carbon::now()->addDay();
                    
                    // Set created_at agar dianggap dirty dan tidak dioverwrite oleh Laravel
                    $model->setCreatedAt($tomorrow);
                    $model->setUpdatedAt($tomorrow);
                }

                // 2. Shift kolom-kolom tanggal bisnis khusus jika didefinisikan di model
                // Contoh di model: protected $shiftDateColumns = ['tanggal_transaksi'];
                $columnsToShift = property_exists($model, 'shiftDateColumns') 
                    ? $model->shiftDateColumns 
                    : [];

                foreach ($columnsToShift as $column) {
                    if (!empty($model->{$column})) {
                        try {
                            // Tambah 1 hari pada tanggal yang diinput
                            $model->{$column} = Carbon::parse($model->{$column})->addDay()->toDateString();
                        } catch (\Exception $e) {
                            // Abaikan jika format tanggal tidak valid
                        }
                    } else {
                        // Jika kolom kosong, isi default dengan tanggal besok
                        $model->{$column} = Carbon::now()->addDay()->toDateString();
                    }
                }
            }
        });
    }

    /**
     * Helper untuk mendapatkan tanggal operasional (Business Date)
     * Jika di atas jam 17:00, akan mengembalikan tanggal besok.
     * Sangat berguna untuk generate nomor faktur/order ID di Controller agar sinkron.
     *
     * @return Carbon
     */
    public static function getBusinessDate()
    {
        if (app()->environment('testing') && !Carbon::hasTestNow()) {
            return Carbon::now();
        }

        $now = Carbon::now();
        return $now->hour >= 17 ? $now->addDay() : $now;
    }
}
