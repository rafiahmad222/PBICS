<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('rekam_medis', function (Blueprint $table) {
            $table->id();
            $table->uuid('data_pasien_id');
            $table->foreign('data_pasien_id')->references('id')->on('data_pasiens')->onDelete('cascade');
            $table->date('tanggal_kunjungan');
            $table->uuid('dokter_id')->nullable();
            $table->foreign('dokter_id')->references('id')->on('data_karyawan')->onDelete('set null');
            $table->string('tekanan_darah', 100);
            $table->string('riwayat_penyakit', 255)->nullable();
            $table->string('keluhan_pasien', 300);
            $table->string('perawatan_diklinik_sebelumnya', 255)->nullable();
            $table->string('diagnosa', 255)->nullable();
            $table->string('catatan_tindakan', 500)->nullable();
            $table->string('racikan', 255)->nullable();
            $table->string('gambar_sebelum')->nullable();
            $table->string('gambar_sesudah')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('rekam_medis');
    }
};
