<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KabKota extends Model
{
    protected $table = 'KabKota';
    protected $fillable = ['name'];

    public function dataPasiens()
    {
        return $this->hasMany(DataPasien::class);
    }
}
