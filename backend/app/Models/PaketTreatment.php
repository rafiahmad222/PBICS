<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaketTreatment extends Model
{
    use HasFactory, \App\Traits\LogsActivity;

    protected static $logModule = 'Paket Treatment';
    protected static $logNameAttribute = 'Nama_paket';

    protected $fillable = [
        'Kode_paket',
        'Nama_paket',
        'Deskripsi',
        'Harga_paket'
    ];

    protected $appends = ['status', 'max_stok'];

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

    public function getMaxStokAttribute()
    {
        if ($this->treatments->isEmpty()) {
            return 999;
        }

        $minPossible = null;
        foreach ($this->treatments as $treatment) {
            $pivotQty = $treatment->pivot->Jumlah ?? 1;
            $possible = floor($treatment->max_stok / max(1, $pivotQty));
            if ($minPossible === null || $possible < $minPossible) {
                $minPossible = $possible;
            }
        }

        return $minPossible ?? 0;
    }
}
