<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DataPasienController;
use App\Http\Controllers\DataKaryawanController;
use App\Http\Controllers\WilayahController;
use App\Http\Controllers\StokProdukController;
use App\Http\Controllers\StokBahanTreatmentController;
use App\Http\Controllers\StokBahanMedisController;
use App\Http\Controllers\StokBahanInfusController;
use App\Http\Controllers\StokBarangApotekController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PaketBundlingController;
use App\Http\Controllers\TreatmentController;
use App\Http\Controllers\PaketTreatmentController;
use App\Http\Controllers\ReservasiController;
use App\Http\Controllers\RekamMedisController;
use App\Http\Controllers\TransaksiController;
use App\Http\Controllers\StokRacikanController;
use App\Http\Controllers\AntreanRacikanController;
use App\Http\Controllers\LaporanPenjualanController;
use App\Http\Controllers\AbsensiController;
use App\Http\Controllers\PengajuanCutiController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\PengaturanAbsensiController;
use App\Http\Controllers\HariLiburController;

/** PR
 * ini bisa ditambahkan middleware lagi di setiap API yang ada
 * penyesuain penggunaan API bisa diakses oleh aktor mana saja 
 */
//LOGIN
Route::post('/login', [AuthController::class, 'login']);

//Middleware Auth Sanctum
Route::middleware('auth:sanctum')->group(function () {

    //GET ME
    Route::get('/me', [AuthController::class, 'me']);

    //LOGOUT
    Route::post('/logout', [AuthController::class, 'logout']);

    // Data Pasien
    Route::get('/pasien/next-numbers', [DataPasienController::class, 'getNextNumbers']);
    Route::apiResource('pasien', DataPasienController::class);
    
    //Data Karyawan 
    Route::apiResource('karyawan', DataKaryawanController::class);
    Route::post('/karyawan/{id}/reset-password', [DataKaryawanController::class, 'updatePassword'])
        ->middleware('Divisi:HRD');

    // Data Wilayah
    Route::get('/wilayah/kabkota', [WilayahController::class, 'getKabKota']);
    Route::get('/wilayah/kecamatan/{kabKotaId}', [WilayahController::class, 'getKecByKabKota']);

    // Stok Produk
    Route::get('/stok-produk/next-number', [StokProdukController::class, 'getNextNumber']);
    Route::apiResource('stok-produk', StokProdukController::class);

    // Stok Bahan Treatment
    Route::get('/stok-bahan-treatment/next-number', [StokBahanTreatmentController::class, 'getNextNumber']);
    Route::apiResource('stok-bahan-treatment', StokBahanTreatmentController::class);

    // Stok Bahan Medis
    Route::get('/stok-bahan-medis/next-number', [StokBahanMedisController::class, 'getNextNumber']);
    Route::apiResource('stok-bahan-medis', StokBahanMedisController::class);

    // Stok Bahan Infus
    Route::get('/stok-bahan-infus/next-number', [StokBahanInfusController::class, 'getNextNumber']);
    Route::apiResource('stok-bahan-infus', StokBahanInfusController::class);

    // Stok Barang Apotek
    Route::get('/stok-barang-apotek/next-number', [StokBarangApotekController::class, 'getNextNumber']);
    Route::apiResource('stok-barang-apotek', StokBarangApotekController::class);

    // Stok Racikan
    Route::apiResource('stok-racikan', StokRacikanController::class);

    // Antrean Racikan
    Route::apiResource('antrean-racikan', AntreanRacikanController::class);

    // Paket Bundling
    Route::get('/paket-bundling/next-number', [PaketBundlingController::class, 'getNextNumber']);
    Route::apiResource('paket-bundling', PaketBundlingController::class);

    // Treatment
    Route::get('/treatment/next-number', [TreatmentController::class, 'getNextNumber']);
    Route::apiResource('treatment', TreatmentController::class);

    // Paket Treatment
    Route::get('/paket-treatment/next-number', [PaketTreatmentController::class, 'getNextNumber']);
    Route::apiResource('paket-treatment', PaketTreatmentController::class);

    // Rekam Medis
    Route::apiResource('rekam-medis', RekamMedisController::class);

    // Reservasi Treatment
    Route::apiResource('reservasi', ReservasiController::class);

    // Transaksi (PO Produk)
    Route::post('/transaksi/{id}/approve', [TransaksiController::class, 'approve']);
    Route::apiResource('transaksi', TransaksiController::class);

    // Laporan Penjualan
    Route::get('/laporan-penjualan', [LaporanPenjualanController::class, 'index']);
    Route::get('/laporan-penjualan/{id}', [LaporanPenjualanController::class, 'show']);

    // Activity Logs
    Route::get('/activity-logs', [\App\Http\Controllers\ActivityLogController::class, 'index']);

    // Absensi & Cuti Karyawan
    Route::get('/absensi', [AbsensiController::class, 'index']);
    Route::post('/absensi', [AbsensiController::class, 'store']);
    Route::post('/pengajuan-cuti', [PengajuanCutiController::class, 'store']);
    Route::get('/pengajuan-cuti', [PengajuanCutiController::class, 'index']);
    Route::get('/pengajuan-cuti/{id}', [PengajuanCutiController::class, 'show']);
    Route::post('/pengajuan-cuti/{id}/review', [PengajuanCutiController::class, 'review']);
    Route::get('/pengajuan-lembur', [AbsensiController::class, 'getPengajuanLembur']);
    Route::get('/pengajuan-lembur/{id}', [AbsensiController::class, 'showPengajuanLembur']);
    Route::post('/pengajuan-lembur/{id}/review', [AbsensiController::class, 'reviewPengajuanLembur']);
    Route::post('/settings/mode-ramadhan', [SettingController::class, 'updateModeRamadhan']);
    Route::post('/absensi-config', [PengaturanAbsensiController::class, 'storeOrUpdate']);
    Route::get('/hari-libur', [HariLiburController::class, 'index']);
    Route::post('/hari-libur', [HariLiburController::class, 'store']);
    Route::delete('/hari-libur/{id}', [HariLiburController::class, 'destroy']);

    // Distributor
    Route::apiResource('distributor', \App\Http\Controllers\DistributorController::class);
});
