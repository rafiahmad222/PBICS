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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('karyawan_id')->nullable();
            $table->string('action');
            $table->string('module')->nullable();
            $table->text('details')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('karyawan_id')
                ->references('id')
                ->on('data_karyawan')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
