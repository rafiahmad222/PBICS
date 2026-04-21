<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class DataPasien extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'kode_Customer',
        'no_member',
        'no_RM',
        'Nama_pasien',
        'no_Identitas',
        'Tipe_Member',
        'Tempat_Lahir',
        'Tanggal_Lahir',
        'Jenis_Kelamin',
        'Email',
        'no_Telp',
        'Alamat',
        'KabKota_id',
        'Kec_id',
    ];

    public function kabKota()
    {
        return $this->belongsTo(KabKota::class, 'KabKota_id');
    }

    public function kec()
    {
        return $this->belongsTo(Kec::class, 'Kec_id');
    }
}
