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
        // 1. Modify rekam_medis table columns to be nullable
        Schema::table('rekam_medis', function (Blueprint $table) {
            $table->string('tekanan_darah', 100)->nullable()->change();
            $table->string('keluhan_pasien', 300)->nullable()->change();
        });

        // 2. Modify reservasis table: add rekam_medis_id and make treatment columns nullable
        Schema::table('reservasis', function (Blueprint $table) {
            $table->unsignedBigInteger('rekam_medis_id')->nullable()->after('pasien_id');
            $table->foreign('rekam_medis_id')->references('id')->on('rekam_medis')->onDelete('set null');
            
            // Ensure treatment fields are nullable
            $table->unsignedBigInteger('treatment_id')->nullable()->change();
            $table->unsignedBigInteger('paket_treatment_id')->nullable()->change();
        });

        // 3. Create pivot tables for multiple treatments and packages on reservasis
        Schema::create('reservasi_treatments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reservasi_id');
            $table->unsignedBigInteger('treatment_id');
            $table->timestamps();

            $table->foreign('reservasi_id')->references('id')->on('reservasis')->onDelete('cascade');
            $table->foreign('treatment_id')->references('id')->on('treatments')->onDelete('cascade');
        });

        Schema::create('reservasi_paket_treatments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reservasi_id');
            $table->unsignedBigInteger('paket_treatment_id');
            $table->timestamps();

            $table->foreign('reservasi_id')->references('id')->on('reservasis')->onDelete('cascade');
            $table->foreign('paket_treatment_id')->references('id')->on('paket_treatments')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservasi_paket_treatments');
        Schema::dropIfExists('reservasi_treatments');

        Schema::table('reservasis', function (Blueprint $table) {
            $table->dropForeign(['rekam_medis_id']);
            $table->dropColumn('rekam_medis_id');
        });

        Schema::table('rekam_medis', function (Blueprint $table) {
            $table->string('tekanan_darah', 100)->nullable(false)->change();
            $table->string('keluhan_pasien', 300)->nullable(false)->change();
        });
    }
};
