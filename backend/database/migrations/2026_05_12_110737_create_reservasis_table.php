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
        Schema::create('reservasis', function (Blueprint $table) {
            $table->id();
            $table->date('Tanggal_reservasi');
            $table->time('Jam_reservasi');
            $table->uuid('pasien_id')->nullable();
            $table->string('Nama_pasien', 255)->nullable(); // Make nullable, filled if pasien_id is null or just fetched
            $table->string('No_Telp', 50);
            $table->uuid('karyawan_id'); // Pendaftar
            $table->unsignedBigInteger('treatment_id')->nullable();
            $table->unsignedBigInteger('paket_treatment_id')->nullable();
            $table->string('Keterangan', 255)->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('pasien_id')->references('id')->on('data_pasiens')->onDelete('set null');
            $table->foreign('karyawan_id')->references('id')->on('data_karyawan')->onDelete('cascade');
            $table->foreign('treatment_id')->references('id')->on('treatments')->onDelete('set null');
            $table->foreign('paket_treatment_id')->references('id')->on('paket_treatments')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservasis');
    }
};
