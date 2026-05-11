<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaketTreatment extends Model
{
    use HasFactory;

    protected $fillable = [
        'Kode_paket',
        'Nama_paket',
        'Deskripsi',
        'Harga_paket'
    ];

    protected $appends = ['status'];

    public function treatments()
    {
        return $this->belongsToMany(Treatment::class, 'paket_treatment_details', 'paket_treatment_id', 'treatment_id')
                    ->withPivot('Jumlah')
                    ->withTimestamps();
    }

    public function getStatusAttribute()
    {
        // If there are no related treatments, we assume it's available.
        if ($this->treatments->isEmpty()) {
            return 'Available';
        }

        foreach ($this->treatments as $treatment) {
            // A package is Non Available if any of its component treatments are Non Available.
            // The treatment's status attribute will dynamically check its own stock.
            if ($treatment->status === 'Non Available') {
                return 'Non Available';
            }
        }

        return 'Available';
    }
}
