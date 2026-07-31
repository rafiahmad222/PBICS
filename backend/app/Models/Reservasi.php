<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservasi extends Model
{
    use \App\Traits\LogsActivity;

    protected static $logModule = 'Reservasi';
    protected static $logNameAttribute = 'Nama_pasien';

    const STATUS_PENDING = 'Pending';
    const STATUS_HADIR = 'Hadir';
    const STATUS_TIDAK_DATANG = 'Tidak Datang';
    const STATUS_BATAL = 'Batal';

    protected $fillable = [
        'Tanggal_reservasi',
        'Jam_reservasi',
        'pasien_id',
        'rekam_medis_id',
        'Nama_pasien',
        'No_Telp',
        'karyawan_id',
        'dokter_id',
        'treatment_id',
        'paket_treatment_id',
        'Keterangan',
        'status'
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

    public function dokter()
    {
        return $this->belongsTo(DataKaryawan::class, 'dokter_id');
    }

    public function rekamMedis()
    {
        return $this->belongsTo(RekamMedis::class, 'rekam_medis_id');
    }

    public function treatment()
    {
        return $this->belongsTo(Treatment::class, 'treatment_id');
    }

    public function paketTreatment()
    {
        return $this->belongsTo(PaketTreatment::class, 'paket_treatment_id');
    }

    public function treatments()
    {
        return $this->belongsToMany(Treatment::class, 'reservasi_treatments', 'reservasi_id', 'treatment_id')->withTimestamps();
    }

    public function paketTreatments()
    {
        return $this->belongsToMany(PaketTreatment::class, 'reservasi_paket_treatments', 'reservasi_id', 'paket_treatment_id')->withTimestamps();
    }

    public function getPendaftarPasienAttribute()
    {
        return $this->karyawan ? $this->karyawan->NamaLengkap_karyawan : null;
    }

    public function getNamaTreatmentAttribute()
    {
        $names = [];

        if ($this->treatments && $this->treatments->isNotEmpty()) {
            foreach ($this->treatments as $t) {
                $names[] = $t->Nama_treatment;
            }
        } elseif ($this->treatment_id && $this->treatment) {
            $names[] = $this->treatment->Nama_treatment;
        }

        if ($this->paketTreatments && $this->paketTreatments->isNotEmpty()) {
            foreach ($this->paketTreatments as $pt) {
                $names[] = $pt->Nama_paket;
            }
        } elseif ($this->paket_treatment_id && $this->paketTreatment) {
            $names[] = $this->paketTreatment->Nama_paket;
        }

        return !empty($names) ? implode(', ', $names) : null;
    }
}
