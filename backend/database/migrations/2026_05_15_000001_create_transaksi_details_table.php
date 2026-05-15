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
        Schema::create('transaksi_details', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('transaksi_id');
            
            // Polymorphic relation untuk Produk atau Treatment
            $table->unsignedBigInteger('itemable_id');
            $table->string('itemable_type');
            
            $table->string('nama_item', 100);
            $table->integer('qty');
            $table->decimal('harga', 15, 2);
            $table->decimal('total_harga', 15, 2);
            
            $table->timestamps();

            $table->foreign('transaksi_id')->references('id')->on('transaksis')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksi_details');
    }
};
