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

