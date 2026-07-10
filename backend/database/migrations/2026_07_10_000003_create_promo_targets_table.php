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
        Schema::create('promo_targets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('promo_id');
            $table->enum('target_type', ['Syarat', 'Benefit', 'Target', 'Spesifik']);
            $table->enum('item_type', ['Produk', 'Treatment']);
            $table->unsignedBigInteger('item_id');
            $table->decimal('nilai_diskon_spesifik', 15, 2)->nullable();
            $table->timestamps();

            $table->foreign('promo_id')->references('id')->on('promos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promo_targets');
    }
};
