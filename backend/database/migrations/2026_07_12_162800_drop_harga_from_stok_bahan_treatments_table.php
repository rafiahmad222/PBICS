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
        Schema::table('stok_bahan_treatments', function (Blueprint $table) {
            $table->dropColumn('Harga');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stok_bahan_treatments', function (Blueprint $table) {
            $table->decimal('Harga', 15, 2)->after('Kategori');
        });
    }
};
