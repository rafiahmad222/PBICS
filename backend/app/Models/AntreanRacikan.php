<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AntreanRacikan extends Model
{
    protected $table = 'antrean_racikans';

    protected $fillable = [
        'data_pasiens_id',
        'nama_pasien',
        'nama_dokter',
        'racikan_text',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    public function dataPasien()
    {
        return $this->belongsTo(DataPasien::class, 'data_pasiens_id');
    }
}
