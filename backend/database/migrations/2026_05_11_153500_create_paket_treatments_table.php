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
        Schema::create('paket_treatments', function (Blueprint $table) {
            $table->id();
            $table->string('Kode_paket', 100);
            $table->string('Nama_paket', 100);
            $table->text('Deskripsi')->nullable();
            $table->decimal('Harga_paket', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paket_treatments');
    }
};
