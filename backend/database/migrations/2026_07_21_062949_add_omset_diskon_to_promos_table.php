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
        Schema::table('promos', function (Blueprint $table) {
            $table->decimal('total_omset', 15, 2)->default(0)->after('kuota_terpakai');
            $table->decimal('total_diskon', 15, 2)->default(0)->after('total_omset');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('promos', function (Blueprint $table) {
            $table->dropColumn(['total_omset', 'total_diskon']);
        });
    }
};
