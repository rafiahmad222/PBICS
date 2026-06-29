<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class DataPasien extends Model
{
    use HasUuids, \App\Traits\LogsActivity;

    public static $logModule = 'Manajemen Pasien';
    public static $logNameAttribute = 'Nama_pasien';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $appends = ['needs_member_fee'];

    public function getNeedsMemberFeeAttribute()
    {
        $tipeMember = $this->Tipe_Member ?? $this->Tipe_member ?? 'Non Member';
        if (strcasecmp($tipeMember, 'Member') !== 0) {
            return false;
        }

        return !\App\Models\TransaksiDetail::where('itemable_type', self::class)
            ->where('itemable_id', $this->id)
            ->where('nama_item', 'Biaya Pendaftaran Member')
            ->exists();
    }

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

    public function rekamMedis()
    {
        return $this->hasMany(RekamMedis::class, 'data_pasien_id');
    }

    public function reservasis()
    {
        return $this->hasMany(Reservasi::class, 'pasien_id');
    }

    public function transaksis()
    {
        return $this->hasMany(Transaksi::class, 'data_pasien_id');
    }
}
