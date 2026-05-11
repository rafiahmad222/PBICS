<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Treatment extends Model
{
    use HasFactory;

    protected $fillable = [
        'Kode_treatment',
        'Nama_treatment',
        'Harga'
    ];

    protected $appends = ['status'];

    public function bahan()
    {
        return $this->belongsToMany(StokBahanTreatment::class, 'treatment_bahans', 'treatment_id', 'stok_bahan_treatment_id')
                    ->withPivot('Jumlah')
                    ->withTimestamps();
    }

    public function getStatusAttribute()
    {
        // If there are no related materials, we assume it's available.
        if ($this->bahan->isEmpty()) {
            return 'Available';
        }

        foreach ($this->bahan as $bahan) {
            // If any required material's stock is less than required amount, return Non Available
            if ($bahan->Stok < $bahan->pivot->Jumlah) {
                return 'Non Available';
            }
        }

        return 'Available';
    }
}
