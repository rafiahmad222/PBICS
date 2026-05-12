<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TreatmentBahan extends Model
{
    use HasFactory;

    protected $table = 'treatment_bahans';

    protected $fillable = [
        'treatment_id',
        'bahan_id',
        'bahan_type',
        'Jumlah',
    ];

    public function bahan()
    {
        return $this->morphTo();
    }

    public function treatment()
    {
        return $this->belongsTo(Treatment::class);
    }
}
