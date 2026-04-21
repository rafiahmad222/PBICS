<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kec extends Model
{
    protected $table = 'Kec';
    protected $fillable = ['KabKota_id', 'name'];

    public function kabKota()
    {
        return $this->belongsTo(KabKota::class);
    }

    public function dataPasiens()
    {
        return $this->hasMany(DataPasien::class);
    }
}
