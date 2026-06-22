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
        Schema::create('antrean_racikans', function (Blueprint $table) {
            $table->id();
            $table->uuid('data_pasiens_id');
            $table->string('nama_pasien', 150);
            $table->string('nama_dokter', 150)->nullable();
            $table->text('racikan_text');
            $table->enum('status', ['Pending', 'Selesai'])->default('Pending');
            $table->timestamps();

            $table->foreign('data_pasiens_id')->references('id')->on('data_pasiens')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('antrean_racikans');
    }
};
