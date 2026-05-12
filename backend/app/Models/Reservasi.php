<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservasi extends Model
{
    protected $fillable = [
        'Tanggal_reservasi',
        'Jam_reservasi',
        'pasien_id',
        'Nama_pasien',
        'No_Telp',
        'karyawan_id',
        'treatment_id',
        'paket_treatment_id',
        'Keterangan'
    ];

    protected $appends = ['Pendaftar_pasien', 'Nama_treatment'];

    public function pasien()
    {
        return $this->belongsTo(DataPasien::class, 'pasien_id');
    }

    public function karyawan()
    {
        return $this->belongsTo(DataKaryawan::class, 'karyawan_id');
    }

    public function treatment()
    {
        return $this->belongsTo(Treatment::class, 'treatment_id');
    }

    public function paketTreatment()
    {
        return $this->belongsTo(PaketTreatment::class, 'paket_treatment_id');
    }

    public function getPendaftarPasienAttribute()
    {
        return $this->karyawan ? $this->karyawan->NamaLengkap_karyawan : null;
    }

    public function getNamaTreatmentAttribute()
    {
        if ($this->treatment_id && $this->treatment) {
            return $this->treatment->Nama_treatment;
        } elseif ($this->paket_treatment_id && $this->paketTreatment) {
            return $this->paketTreatment->Nama_paket;
        }
        return null;
    }
}
