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
        Schema::table('data_karyawan', function (Blueprint $table) {
            $table->string('Divisi')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data_karyawan', function (Blueprint $table) {
            $table->enum('Divisi', [
                'Super Admin',
                'Owner',
                'Dokter',
                'Customer Service',
                'HRD',
                'Supervisor Treatment',
                'Supervisor Produk',
                'Manajer Marketing of Sales',
                'Gudang Umum',
                'Staff OB',
                'Staff Satpam',
                'Apoteker',
                'Asisten Apoteker',
                'Asisten Supervisor Treatment'])->change();
        });
    }
};
