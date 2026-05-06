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
        Schema::create('paket_bundling_produks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paket_bundling_id')->constrained('paket_bundlings')->onDelete('cascade');
            $table->foreignId('stok_produk_id')->constrained('stok_produks')->onDelete('cascade');
            $table->integer('Jumlah');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paket_bundling_produks');
    }
};
