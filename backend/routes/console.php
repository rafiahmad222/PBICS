<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;
use App\Models\Promo;

Schedule::call(function () {
    Promo::where('status', 'Aktif')
        ->where('tanggal_selesai', '<', now()->toDateString())
        ->update(['status' => 'Berakhir']);
})->dailyAt('00:00');
