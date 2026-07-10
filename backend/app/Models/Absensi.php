<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Absensi extends Model
{
    use HasUuids, \App\Traits\LogsActivity;

    public static $logModule = 'Absensi Karyawan';
    public static $logNameAttribute = 'tanggal';

    protected $table = 'absensi';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'karyawan_id',
        'tanggal',
        'ket_shift',
        'shift_code',
        'jam_masuk',
        'jam_keluar',
        'jadwal_masuk',
        'jadwal_keluar',
        'gambar_masuk',
        'gambar_keluar',
        'lokasi_masuk',
        'lokasi_keluar',
        'status_masuk',
        'status_keluar',
    ];

    public static $SHIFTS = [
        'Pelayanan' => [
            'normal' => [
                'pelayanan_pagi' => ['label' => 'Pagi', 'check_in' => '08:45:00', 'check_out' => '17:00:00', 'overnight' => false],
                'pelayanan_siang' => ['label' => 'Siang', 'check_in' => '10:30:00', 'check_out' => '19:00:00', 'overnight' => false],
            ],
            'ramadhan' => [
                'pelayanan_pagi_rmdn' => ['label' => 'Pagi (Ramadhan)', 'check_in' => '07:30:00', 'check_out' => '16:00:00', 'overnight' => false],
                'pelayanan_siang_rmdn' => ['label' => 'Siang (Ramadhan)', 'check_in' => '10:30:00', 'check_out' => '19:00:00', 'overnight' => false],
            ]
        ],
        'Satpam' => [
            'normal' => [
                'satpam_pagi' => ['label' => 'Pagi', 'check_in' => '07:30:00', 'check_out' => '20:00:00', 'overnight' => false],
                'satpam_malam' => ['label' => 'Malam', 'check_in' => '19:30:00', 'check_out' => '07:30:00', 'overnight' => true],
            ],
            'ramadhan' => [
                'satpam_pagi_rmdn' => ['label' => 'Pagi (Ramadhan)', 'check_in' => '06:30:00', 'check_out' => '19:00:00', 'overnight' => false],
                'satpam_malam_rmdn' => ['label' => 'Malam (Ramadhan)', 'check_in' => '18:30:00', 'check_out' => '06:30:00', 'overnight' => true],
            ]
        ],
        'OB' => [
            'normal' => [
                'ob_normal' => ['label' => 'Normal', 'check_in' => '07:00:00', 'check_out' => '17:00:00', 'overnight' => false],
                'ob_lembur' => ['label' => 'Lembur', 'check_in' => '07:00:00', 'check_out' => '19:00:00', 'overnight' => false],
            ],
            'ramadhan' => [
                'ob_normal_rmdn' => ['label' => 'Normal (Ramadhan)', 'check_in' => '06:00:00', 'check_out' => '16:00:00', 'overnight' => false],
                'ob_lembur_rmdn' => ['label' => 'Lembur (Ramadhan)', 'check_in' => '06:00:00', 'check_out' => '18:00:00', 'overnight' => false],
            ]
        ],
        'Umum' => [
            'normal' => [
                'umum_normal' => ['label' => 'Normal', 'check_in' => '08:00:00', 'check_out' => '17:00:00', 'overnight' => false],
            ],
            'ramadhan' => [
                'umum_normal_rmdn' => ['label' => 'Normal (Ramadhan)', 'check_in' => '07:00:00', 'check_out' => '16:00:00', 'overnight' => false],
            ]
        ]
    ];

    public function karyawan()
    {
        return $this->belongsTo(DataKaryawan::class, 'karyawan_id', 'id');
    }

    public function pengajuanAbsensi()
    {
        return $this->hasMany(PengajuanAbsensi::class, 'absensi_id', 'id');
    }

    public static function getShiftCategoryByDivisi($divisi)
    {
        $pelayanan = [
            'Customer Service',
            'Dokter',
            'Apoteker',
            'Asisten Apoteker',
            'Supervisor Treatment',
            'Asisten Supervisor Treatment'
        ];

        if (in_array($divisi, $pelayanan)) {
            return 'Pelayanan';
        }

        if ($divisi === 'Staff Satpam') {
            return 'Satpam';
        }

        if ($divisi === 'Staff OB') {
            return 'OB';
        }

        return 'Umum';
    }

    public static function findShift($codeOrLabel, $category, $isRamadhan)
    {
        $mode = $isRamadhan ? 'ramadhan' : 'normal';
        $shifts = self::$SHIFTS[$category][$mode] ?? [];

        // Cocokkan berdasarkan key/code
        if (isset($shifts[$codeOrLabel])) {
            return array_merge(['code' => $codeOrLabel], $shifts[$codeOrLabel]);
        }

        // Cocokkan berdasarkan label
        foreach ($shifts as $code => $data) {
            if (strcasecmp($data['label'], $codeOrLabel) === 0) {
                return array_merge(['code' => $code], $data);
            }
        }

        // Cari di mode lain sebagai cadangan
        $otherMode = $isRamadhan ? 'normal' : 'ramadhan';
        $otherShifts = self::$SHIFTS[$category][$otherMode] ?? [];
        if (isset($otherShifts[$codeOrLabel])) {
            return array_merge(['code' => $codeOrLabel], $otherShifts[$codeOrLabel]);
        }
        foreach ($otherShifts as $code => $data) {
            if (strcasecmp($data['label'], $codeOrLabel) === 0) {
                return array_merge(['code' => $code], $data);
            }
        }

        return null;
    }

    public static function matchClosestShift($timeStr, $category, $isRamadhan)
    {
        $mode = $isRamadhan ? 'ramadhan' : 'normal';
        $shifts = self::$SHIFTS[$category][$mode] ?? [];

        $checkTime = \Carbon\Carbon::createFromFormat('H:i:s', $timeStr);

        $closestCode = null;
        $closestData = null;
        $minDiff = null;

        foreach ($shifts as $code => $data) {
            $shiftTime = \Carbon\Carbon::createFromFormat('H:i:s', $data['check_in']);
            $diff = abs($checkTime->diffInSeconds($shiftTime));

            if ($minDiff === null || $diff < $minDiff) {
                $minDiff = $diff;
                $closestCode = $code;
                $closestData = $data;
            }
        }

        if ($closestCode) {
            return array_merge(['code' => $closestCode], $closestData);
        }

        return null;
    }

    public static function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000; // meter

        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2);
        $lonTo = deg2rad($lon2);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));

        return $angle * $earthRadius;
    }
}
