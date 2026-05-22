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
        'Kategori',
        'Harga'
    ];

    protected $appends = ['status'];

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
