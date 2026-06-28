<?php

namespace App\Traits;

use App\Models\ActivityLog;

trait LogsActivity
{
    /**
     * Boot the trait.
     */
    protected static function bootLogsActivity()
    {
        static::created(function ($model) {
            self::logAction($model, 'CREATE');
        });

        static::updated(function ($model) {
            self::logAction($model, 'UPDATE');
        });

        static::deleted(function ($model) {
            self::logAction($model, 'DELETE');
        });
    }

    /**
     * Log the action.
     *
     * @param \Illuminate\Database\Eloquent\Model $model
     * @param string $action
     */
    protected static function logAction($model, $action)
    {
        // Pastikan hanya melog jika ada user yang login (via request API)
        if (!auth()->check()) {
            return;
        }

        $module = self::getLogModule();
        $details = self::getLogDetails($model, $action, $module);

        ActivityLog::create([
            'karyawan_id' => auth()->id(),
            'action' => $action,
            'module' => $module,
            'details' => $details,
            'created_at' => now(),
        ]);
    }

    /**
     * Get the module name.
     *
     * @return string
     */
    protected static function getLogModule()
    {
        return static::$logModule ?? class_basename(static::class);
    }

    /**
     * Get the log details string.
     *
     * @param \Illuminate\Database\Eloquent\Model $model
     * @param string $action
     * @param string $module
     * @return string
     */
    protected static function getLogDetails($model, $action, $module)
    {
        $nameAttribute = static::$logNameAttribute ?? 'id';
        $recordName = $model->{$nameAttribute};

        switch ($action) {
            case 'CREATE':
                return "Menambahkan data $module baru: " . ($recordName ?? 'ID ' . $model->id);
            case 'UPDATE':
                return "Memperbarui data $module: " . ($recordName ?? 'ID ' . $model->id);
            case 'DELETE':
                return "Menghapus data $module: " . ($recordName ?? 'ID ' . $model->id);
            default:
                return "Melakukan aksi $action pada data $module";
        }
    }
}
