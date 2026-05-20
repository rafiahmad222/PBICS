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
        Schema::create('transaksis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('no_faktur', 50)->unique()->nullable();
            $table->string('no_resi', 50)->unique();
            
            // Relasi ke tabel pasien (bisa null jika dari distributor luar yg tidak terdaftar)
            $table->uuid('data_pasien_id')->nullable();
            $table->string('nama_pasien_distributor', 255);
            $table->string('alamat_pengiriman', 255)->nullable();
            
            // Relasi ke tabel karyawan (MOS / CS)
            $table->uuid('karyawan_id');
            
            $table->date('tanggal_transaksi');
            $table->string('catatan_pesanan', 100)->nullable();
            
            // Status: Pending, Selesai, Dibatalkan
            $table->enum('status', ['Pending', 'Selesai', 'Dibatalkan'])->default('Pending');
            $table->decimal('total_keseluruhan', 15, 2)->default(0);
            
            $table->timestamps();

            // Foreign keys
            $table->foreign('data_pasien_id')->references('id')->on('data_pasiens')->onDelete('set null');
            $table->foreign('karyawan_id')->references('id')->on('data_karyawan')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksis');
    }
};
