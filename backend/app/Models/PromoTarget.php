<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PromoTarget extends Model
{
    use HasUuids;

    protected $table = 'promo_targets';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'promo_id',
        'target_type',
        'item_type',
        'item_id',
        'nilai_diskon_spesifik'
    ];

    protected $casts = [
        'item_id' => 'integer',
        'nilai_diskon_spesifik' => 'decimal:2'
    ];

    protected $appends = ['item_name'];

    public function getItemNameAttribute()
    {
        if ($this->item_type === 'Produk') {
            return StokProduk::find($this->item_id)?->Nama_produk ?? 'Unknown Product';
        } elseif ($this->item_type === 'Treatment') {
            return Treatment::find($this->item_id)?->Nama_treatment ?? 'Unknown Treatment';
        }
        return 'Unknown';
    }

    public function promo()
    {
        return $this->belongsTo(Promo::class, 'promo_id');
    }

    /**
     * Get the associated item model instance.
     */
    public function item()
    {
        if ($this->item_type === 'Produk') {
            return $this->belongsTo(StokProduk::class, 'item_id');
        } elseif ($this->item_type === 'Treatment') {
            return $this->belongsTo(Treatment::class, 'item_id');
        }
        return null;
    }
}
