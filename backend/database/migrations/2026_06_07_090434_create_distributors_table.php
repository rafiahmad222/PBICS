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
        Schema::create('distributors', function (Blueprint $table) {
            $table->id();
            $table->string('nama_distributor', 255);
            $table->date('tanggal_lahir');
            $table->string('alamat', 50);
            $table->string('no_telp', 20); // Using string to support 10-13 characters (e.g. leading zeros)
            $table->string('email', 255);
            $table->string('distributor', 20);
            $table->decimal('deposit_masuk', 15, 2)->default(0);
            $table->decimal('sisa_deposit', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('distributors');
    }
};
