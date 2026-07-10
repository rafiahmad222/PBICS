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
        Schema::create('promos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->enum('kategori', ['Produk', 'Treatment', 'Kombinasi']);
            $table->string('nama_promo');
            $table->enum('mode_promo', ['basic', 'min_order', 'bundle', 'specific_item']);
            $table->enum('tipe_diskon', ['persentase', 'nominal'])->nullable();
            $table->decimal('nilai_diskon', 15, 2)->nullable();
            $table->decimal('min_order_amount', 15, 2)->nullable();
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->boolean('is_voucher_fisik')->default(false);
            $table->string('kode_promo')->nullable()->unique();
            $table->integer('kuota_global')->nullable();
            $table->integer('kuota_terpakai')->default(0);
            $table->enum('status', ['Aktif', 'Berakhir', 'Draft'])->default('Draft');
            $table->uuid('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('created_by')->references('id')->on('data_karyawan')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promos');
    }
};
