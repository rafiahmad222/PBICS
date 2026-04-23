<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Laravel\Sanctum\HasApiTokens;

class DataKaryawan extends Authenticatable
{
    use HasApiTokens, HasUuids;

    protected $table = 'data_karyawan';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'NamaLengkap_karyawan',
        'Nomor_Identitas',
        'Tanggal_Lahir',
        'Tempat_Lahir',
        'Alamat',
        'Divisi',
        'Jabatan',
        'Cabang',
        'Email',
        'No_Telp',
        'Username',
        'Password',
        'Tanggal_bergabung',
    ];

    // Supaya password tidak ikut ke response JSON
    protected $hidden = [
        'Password',
    ];

    public function getAuthPassword()
    {
        return $this->Password;
    }
}
