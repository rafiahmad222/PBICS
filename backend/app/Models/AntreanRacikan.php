<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AntreanRacikan extends Model
{
    protected $table = 'antrean_racikans';

    protected $fillable = [
        'patient_id',
        'patient_name',
        'dokter_name',
        'racikan_text',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];
}
