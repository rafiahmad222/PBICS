<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Distributor extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_distributor',
        'tanggal_lahir',
        'alamat',
        'no_telp',
        'email',
        'distributor',
        'deposit_masuk',
        'sisa_deposit',
    ];
}
