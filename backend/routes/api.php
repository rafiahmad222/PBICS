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

Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Data Pasien & Karyawan
    Route::get('/pasien/next-numbers', [DataPasienController::class, 'getNextNumbers']);
    Route::apiResource('pasien', DataPasienController::class);
    Route::apiResource('karyawan', DataKaryawanController::class);
    Route::post('/karyawan/{id}/reset-password', [DataKaryawanController::class, 'updatePassword'])
        ->middleware('Divisi:HRD');

    // Data Wilayah
    Route::get('/wilayah/kabkota', [WilayahController::class, 'getKabKota']);
    Route::get('/wilayah/kecamatan/{kabKotaId}', [WilayahController::class, 'getKecByKabKota']);

    // Stok Produk
    Route::apiResource('stok-produk', StokProdukController::class);

    // Stok Bahan Treatment
    Route::apiResource('stok-bahan-treatment', StokBahanTreatmentController::class);

    // Stok Bahan Medis
    Route::apiResource('stok-bahan-medis', StokBahanMedisController::class);

    // Stok Bahan Infus
    Route::apiResource('stok-bahan-infus', StokBahanInfusController::class);

    // Stok Barang Apotek
    Route::apiResource('stok-barang-apotek', StokBarangApotekController::class);
});

