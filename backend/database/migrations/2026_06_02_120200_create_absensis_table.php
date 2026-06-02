<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('absensi', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('karyawan_id')->constrained('data_karyawan')->onDelete('cascade');
            $table->date('tanggal');
            $table->string('ket_shift', 50);
            $table->string('shift_code', 50);
            $table->time('jam_masuk')->nullable();
            $table->time('jam_keluar')->nullable();
            $table->time('jadwal_masuk');
            $table->time('jadwal_keluar');
            $table->string('gambar_masuk')->nullable();
            $table->string('gambar_keluar')->nullable();
            $table->string('lokasi_masuk')->nullable();
            $table->string('lokasi_keluar')->nullable();
            $table->string('status_absen', 25);
            $table->string('status_pengajuan', 25)->nullable();
            $table->string('alasan_keterangan', 300)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('absensi');
    }
};
