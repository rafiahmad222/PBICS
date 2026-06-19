<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Treatment extends Model
{
    use HasFactory, \App\Traits\LogsActivity;

    protected static $logModule = 'Treatment';
    protected static $logNameAttribute = 'Nama_treatment';

    protected $fillable = [
        'Kode_treatment',
        'Nama_treatment',
        'Kategori',
        'Harga'
    ];

    protected $appends = ['status', 'max_stok'];

    public function bahan()
    {
        return $this->hasMany(TreatmentBahan::class);
    }

    public function getStatusAttribute()
    {
        if ($this->bahan->isEmpty()) {
            return 'Available';
        }

        foreach ($this->bahan as $treatmentBahan) {
            $item = $treatmentBahan->bahan; 
            if (!$item || $item->Stok < $treatmentBahan->Jumlah) {
                return 'Non Available';
            }
        }

        return 'Available';
    }

    public function getMaxStokAttribute()
    {
        if ($this->bahan->isEmpty()) {
            return 999;
        }

        $minPossible = null;
        foreach ($this->bahan as $treatmentBahan) {
            $item = $treatmentBahan->bahan;
            if (!$item) {
                return 0;
            }
            $possible = floor($item->Stok / max(1, $treatmentBahan->Jumlah));
            if ($minPossible === null || $possible < $minPossible) {
                $minPossible = $possible;
            }
        }

        return $minPossible ?? 0;
    }

    public function paketTreatments()
    {
        return $this->belongsToMany(PaketTreatment::class, 'paket_treatment_details', 'treatment_id', 'paket_treatment_id');
    }

    public function rekamMedis()
    {
        return $this->belongsToMany(RekamMedis::class, 'rekam_medis_treatments', 'treatment_id', 'rekam_medis_id')
                    ->withTimestamps();
    }
}
