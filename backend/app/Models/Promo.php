<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\LogsActivity;

class Promo extends Model
{
    use HasUuids, SoftDeletes, LogsActivity;

    protected static $logModule = 'Promo';
    protected static $logNameAttribute = 'nama_promo';

    protected $table = 'promos';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'kategori',
        'nama_promo',
        'mode_promo',
        'tipe_diskon',
        'nilai_diskon',
        'min_order_amount',
        'tanggal_mulai',
        'tanggal_selesai',
        'is_voucher_fisik',
        'kode_promo',
        'kuota_global',
        'kuota_terpakai',
        'status',
        'created_by'
    ];

    protected $casts = [
        'is_voucher_fisik' => 'boolean',
        'nilai_diskon' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'kuota_global' => 'integer',
        'kuota_terpakai' => 'integer',
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date'
    ];

    public function vouchers()
    {
        return $this->hasMany(PromoVoucher::class, 'promo_id');
    }

    public function targets()
    {
        return $this->hasMany(PromoTarget::class, 'promo_id');
    }

    public function creator()
    {
        return $this->belongsTo(DataKaryawan::class, 'created_by');
    }
}
