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
        Schema::create('stok_bahan_medis', function (Blueprint $table) {
            $table->id();
            $table->string('Nama_bahan_medis', 100);
            $table->string('Kategori', 100);
            $table->integer('Stok');
            $table->integer('Batas_minimal_stok')->default(5);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stok_bahan_medis');
    }
};
