<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            // Modify the enum options for tipe_transaksi in transaksis table
            DB::statement("ALTER TABLE transaksis MODIFY COLUMN tipe_transaksi ENUM('Produk', 'Treatment', 'Racikan', 'Registrasi Member') NOT NULL DEFAULT 'Produk'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            // Revert enum back to original options
            DB::statement("ALTER TABLE transaksis MODIFY COLUMN tipe_transaksi ENUM('Produk', 'Treatment', 'Racikan') NOT NULL DEFAULT 'Produk'");
        }
    }
};
