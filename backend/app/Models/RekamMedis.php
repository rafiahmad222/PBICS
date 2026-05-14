<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RekamMedis extends Model
{
    use HasFactory;

    protected $table = 'rekam_medis';

    protected $fillable = [
        'data_pasien_id',
        'tanggal_kunjungan',
        'dokter_id',
        'tekanan_darah',
        'riwayat_penyakit',
        'keluhan_pasien',
        'perawatan_diklinik_sebelumnya',
        'diagnosa',
        'catatan_tindakan',
        'racikan',
        'gambar_sebelum',
        'gambar_sesudah',
    ];

    public function pasien()
    {
        return $this->belongsTo(DataPasien::class, 'data_pasien_id');
    }

    public function dokter()
    {
        return $this->belongsTo(DataKaryawan::class, 'dokter_id');
    }

    public function treatments()
    {
        return $this->belongsToMany(Treatment::class, 'rekam_medis_treatments', 'rekam_medis_id', 'treatment_id')
                    ->withTimestamps();
    }

    public function reseps()
    {
        return $this->belongsToMany(StokProduk::class, 'rekam_medis_reseps', 'rekam_medis_id', 'stok_produk_id')
                    ->withPivot('jumlah')
                    ->withTimestamps();
    }
}
