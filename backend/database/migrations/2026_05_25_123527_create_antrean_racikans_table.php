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
            $table->string('patient_id', 50);
            $table->string('patient_name', 150);
            $table->string('dokter_name', 150)->nullable();
            $table->text('racikan_text');
            $table->enum('status', ['Pending', 'Selesai'])->default('Pending');
            $table->timestamps();
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
