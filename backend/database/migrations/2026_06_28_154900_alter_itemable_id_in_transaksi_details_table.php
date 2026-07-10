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
            // Ubah tipe kolom itemable_id menjadi string (VARCHAR) agar bisa menampung UUID maupun integer ID
            DB::statement("ALTER TABLE transaksi_details MODIFY COLUMN itemable_id VARCHAR(255) NOT NULL");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            // Kembalikan ke tipe data unsignedBigInteger
            DB::statement("ALTER TABLE transaksi_details MODIFY COLUMN itemable_id BIGINT UNSIGNED NOT NULL");
        }
    }
};
