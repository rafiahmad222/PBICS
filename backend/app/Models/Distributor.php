<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Distributor extends Model
{
    use HasFactory, \App\Traits\LogsActivity;

    protected static $logModule = 'Distributor';
    protected static $logNameAttribute = 'nama_distributor';

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
