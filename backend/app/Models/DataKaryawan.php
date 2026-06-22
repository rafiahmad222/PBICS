<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Laravel\Sanctum\HasApiTokens;

class DataKaryawan extends Authenticatable
{
    use HasApiTokens, HasUuids, \App\Traits\LogsActivity;

    public static $logModule = 'Manajemen Karyawan';
    public static $logNameAttribute = 'NamaLengkap_karyawan';

    /**
     * Override logAction to log own profile updates with custom module and details.
     */
    protected static function logAction($model, $action)
    {
        if (!auth()->check()) {
            return;
        }

        // Jika password di-reset oleh admin/orang lain, abaikan log UPDATE generik di sini.
        // Karena event ini sudah dicatat secara spesifik sebagai RESET_PASSWORD di controller.
        if ($action === 'UPDATE' && $model->isDirty('Password') && auth()->id() !== $model->id) {
            return;
        }

        $isOwnProfile = (auth()->id() === $model->id);

        if ($isOwnProfile && $action === 'UPDATE') {
            $module = 'Profil';
            $details = 'Memperbarui data profile milik sendiri';
        } else {
            $module = self::getLogModule();
            $details = self::getLogDetails($model, $action, $module);
        }

        \App\Models\ActivityLog::create([
            'karyawan_id' => auth()->id(),
            'action' => $action,
            'module' => $module,
            'details' => $details,
            'created_at' => now(),
        ]);
    }

    protected $table = 'data_karyawan';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'NamaLengkap_karyawan',
        'Nomor_Identitas',
        'kode_karyawan',
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

    public function rekamMedis()
    {
        return $this->hasMany(RekamMedis::class, 'dokter_id');
    }
}
