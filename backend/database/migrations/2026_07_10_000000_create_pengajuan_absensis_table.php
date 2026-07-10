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
        Schema::create('pengajuan_absensi', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('absensi_id')->constrained('absensi')->onDelete('cascade');
            $table->foreignUuid('karyawan_id')->constrained('data_karyawan')->onDelete('cascade');
            $table->string('tipe_pengajuan', 25); // 'terlambat', 'lembur'
            $table->integer('durasi'); // durasi terlambat/lembur dalam menit
            $table->string('alasan_keterangan', 300);
            $table->string('status_pengajuan', 25)->default('PENDING'); // PENDING, DISETUJUI, DITOLAK
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengajuan_absensi');
    }
};
