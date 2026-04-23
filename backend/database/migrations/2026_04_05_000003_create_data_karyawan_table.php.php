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
        Schema::create('data_karyawan', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('NamaLengkap_karyawan');
            $table->string('Nomor_Identitas')->unique();
            $table->enum('Divisi', ['Dokter', 'Customer Service', 'Perawat', 'Staff Gudang', 'Kasir', 'Manager', 'HRD', 'Owner', 'Komisaris']);
            $table->enum('Jabatan', ['Lead', 'Anggota Staff']);
            $table->enum('Cabang', ['Jember', 'Lumajang']);
            $table->string('Tempat_Lahir');
            $table->date('Tanggal_Lahir');
            $table->text('Alamat')->nullable();
            $table->string('Email')->unique();
            $table->string('Tanggal_bergabung');
            $table->string('No_Telp');
            $table->string('Username')->unique();
            $table->string('Password');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_karyawan');
    }
};
