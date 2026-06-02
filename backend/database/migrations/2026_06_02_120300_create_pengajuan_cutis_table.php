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
        Schema::create('pengajuan_cuti', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('karyawan_id')->constrained('data_karyawan')->onDelete('cascade');
            $table->string('jenis_cuti', 25);
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->string('alasan', 300);
            $table->string('gambar_bukti_cuti')->nullable();
            $table->string('status_pengajuan', 25)->default('PENDING');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengajuan_cuti');
    }
};
