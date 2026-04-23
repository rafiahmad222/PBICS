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
        Schema::create('data_pasiens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('kode_Customer')->unique()->nullable();
            $table->string('no_member')->nullable()->unique();
            $table->enum('Tipe_member', ['Member','Non Member']);
            $table->string('no_RM')->unique();
            $table->string('Nama_pasien');
            $table->string('no_Identitas'); // No. KTP/Passport
            $table->string('Tempat_Lahir');
            $table->date('Tanggal_Lahir');
            $table->enum('Jenis_Kelamin', ['L', 'P']); // L = Laki-laki, P = Perempuan
            $table->string('Email')->nullable();
            $table->string('no_Telp');
            $table->string('Alamat')->nullable();
            $table->unsignedBigInteger('KabKota_id')->nullable();
            $table->foreign('KabKota_id')->references('id')->on('KabKota');
            $table->unsignedBigInteger('Kec_id')->nullable();
            $table->foreign('Kec_id')->references('id')->on('Kec');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_pasiens');
    }
};
