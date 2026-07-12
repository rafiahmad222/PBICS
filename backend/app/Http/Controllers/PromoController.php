<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Promo;
use App\Models\PromoVoucher;
use App\Models\PromoTarget;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PromoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Promo::with(['targets', 'vouchers'])->withCount('vouchers');

        // Filter status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter kategori
        if ($request->filled('kategori')) {
            $query->where('kategori', $request->kategori);
        }

        // Filter tanggal
        if ($request->filled('start_date')) {
            $query->where('tanggal_mulai', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->where('tanggal_selesai', '<=', $request->end_date);
        }

        $promos = $query->orderBy('created_at', 'desc')->paginate($request->input('per_page', 10));

        return response()->json($promos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kategori' => 'required|in:Produk,Treatment,Kombinasi',
            'nama_promo' => 'required|string|max:255',
            'mode_promo' => 'required|in:basic,min_order,bundle,specific_item',
            'tipe_diskon' => 'required_if:mode_promo,basic,min_order|nullable|in:persentase,nominal',
            'nilai_diskon' => 'required_if:mode_promo,basic,min_order|nullable|numeric|min:0',
            'min_order_amount' => 'required_if:mode_promo,min_order|nullable|numeric|min:0',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'is_voucher_fisik' => 'boolean',
            'kode_promo' => 'nullable|string|max:50',
            'kuota_global' => 'nullable|integer|min:1',
            'status' => 'in:Aktif,Berakhir,Draft',
            'targets' => 'nullable|array',
            'targets.*.target_type' => 'required|in:Syarat,Benefit,Target,Spesifik',
            'targets.*.item_type' => 'required|in:Produk,Treatment',
            'targets.*.item_id' => 'required|integer',
            'targets.*.nilai_diskon_spesifik' => 'nullable|numeric|min:0',
            'jumlah_voucher' => 'required_if:is_voucher_fisik,true|nullable|integer|min:1',
        ]);

        $promo = DB::transaction(function () use ($validated, $request) {
            $isVoucher = $validated['is_voucher_fisik'] ?? false;
            $kodePromo = $validated['kode_promo'] ?? null;

            // Generate kode promo jika non-voucher fisik dan kode kosong
            if (!$isVoucher && empty($kodePromo)) {
                do {
                    $kodePromo = 'PRM-' . Str::upper(Str::random(8));
                } while (Promo::where('kode_promo', $kodePromo)->exists());
            }

            // Validasi keunikan kode promo jika diinput oleh user
            if (!$isVoucher && !empty($kodePromo)) {
                if (Promo::where('kode_promo', $kodePromo)->exists()) {
                    throw new \InvalidArgumentException('Kode promo sudah terdaftar.');
                }
            }

            $promoData = [
                'kategori' => $validated['kategori'],
                'nama_promo' => $validated['nama_promo'],
                'mode_promo' => $validated['mode_promo'],
                'tipe_diskon' => $validated['tipe_diskon'] ?? null,
                'nilai_diskon' => $validated['nilai_diskon'] ?? null,
                'min_order_amount' => $validated['min_order_amount'] ?? null,
                'tanggal_mulai' => $validated['tanggal_mulai'],
                'tanggal_selesai' => $validated['tanggal_selesai'],
                'is_voucher_fisik' => $isVoucher,
                'kode_promo' => $kodePromo,
                'kuota_global' => $validated['kuota_global'] ?? null,
                'status' => $validated['status'] ?? 'Draft',
                'created_by' => auth()->id()
            ];

            $promo = Promo::create($promoData);

            // Simpan target
            if (!empty($validated['targets'])) {
                foreach ($validated['targets'] as $target) {
                    $promo->targets()->create([
                        'target_type' => $target['target_type'],
                        'item_type' => $target['item_type'],
                        'item_id' => $target['item_id'],
                        'nilai_diskon_spesifik' => $target['nilai_diskon_spesifik'] ?? null,
                    ]);
                }
            }

            // Generate voucher fisik jika diset true
            if ($isVoucher && !empty($validated['jumlah_voucher'])) {
                $jumlahVoucher = (int)$validated['jumlah_voucher'];
                $vouchers = [];
                $generatedCodes = [];

                for ($i = 0; $i < $jumlahVoucher; $i++) {
                    do {
                        $code = 'VCH-' . Str::upper(Str::random(8));
                    } while (
                        in_array($code, $generatedCodes) || 
                        PromoVoucher::where('kode_voucher', $code)->exists()
                    );

                    $generatedCodes[] = $code;
                    $vouchers[] = [
                        'id' => (string) Str::uuid(),
                        'promo_id' => $promo->id,
                        'kode_voucher' => $code,
                        'is_used' => false,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }

                // Bulk insert vouchers
                PromoVoucher::insert($vouchers);
            }

            return $promo;
        });

        return response()->json([
            'message' => 'Promo berhasil dibuat.',
            'data' => $promo->load(['targets', 'vouchers'])
        ], 210); // Use 201 for standard created response
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $promo = Promo::with(['targets', 'vouchers'])->findOrFail($id);
        return response()->json($promo);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $promo = Promo::findOrFail($id);

        // Validasi core constraints jika promo sudah aktif dan digunakan
        $isUsed = $promo->kuota_terpakai > 0 || PromoVoucher::where('promo_id', $id)->where('is_used', true)->exists();

        $validated = $request->validate([
            'kategori' => 'required|in:Produk,Treatment,Kombinasi',
            'nama_promo' => 'required|string|max:255',
            'mode_promo' => 'required|in:basic,min_order,bundle,specific_item',
            'tipe_diskon' => 'required_if:mode_promo,basic,min_order|nullable|in:persentase,nominal',
            'nilai_diskon' => 'required_if:mode_promo,basic,min_order|nullable|numeric|min:0',
            'min_order_amount' => 'required_if:mode_promo,min_order|nullable|numeric|min:0',
            'tanggal_mulai' => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'is_voucher_fisik' => 'boolean',
            'kode_promo' => 'nullable|string|max:50|unique:promos,kode_promo,' . $id,
            'kuota_global' => 'nullable|integer|min:1',
            'status' => 'in:Aktif,Berakhir,Draft',
        ]);

        if ($isUsed && $promo->status === 'Aktif') {
            // Cek apakah data core berubah
            $coreFields = ['mode_promo', 'is_voucher_fisik', 'tipe_diskon', 'nilai_diskon', 'kode_promo'];
            foreach ($coreFields as $field) {
                if (isset($validated[$field]) && $validated[$field] != $promo->{$field}) {
                    return response()->json([
                        'message' => "Tidak diizinkan mengubah konfigurasi inti ({$field}) karena promo ini sedang aktif dan sudah terpakai."
                    ], 422);
                }
            }
        }

        $promo->update($validated);

        return response()->json([
            'message' => 'Promo berhasil diperbarui.',
            'data' => $promo
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $promo = Promo::findOrFail($id);
        $promo->delete();

        return response()->json([
            'message' => 'Promo berhasil dihapus.'
        ]);
    }

    /**
     * POS Validate Promo Code
     */
    public function validatePromo(Request $request)
    {
        $validated = $request->validate([
            'kode' => 'required|string',
            'total_belanja' => 'required|numeric|min:0',
            'items' => 'required|array',
            'items.*.item_type' => 'required|in:Produk,Treatment',
            'items.*.item_id' => 'required|integer',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.harga' => 'required|numeric|min:0',
        ]);

        $kode = Str::upper($validated['kode']);
        $totalBelanja = $validated['total_belanja'];
        $items = $validated['items'];

        // DB Transaction dengan Locking
        return DB::transaction(function () use ($kode, $totalBelanja, $items) {
            // 1. Cari kode di voucher atau promo
            $voucher = PromoVoucher::where('kode_voucher', $kode)
                ->lockForUpdate()
                ->first();

            $promo = null;
            if ($voucher) {
                $promo = Promo::where('id', $voucher->promo_id)
                    ->lockForUpdate()
                    ->first();
            } else {
                $promo = Promo::where('kode_promo', $kode)
                    ->where('is_voucher_fisik', false)
                    ->lockForUpdate()
                    ->first();
            }

            if (!$promo) {
                return response()->json([
                    'status' => 'invalid',
                    'message' => 'Kode promo atau voucher tidak ditemukan.'
                ], 422);
            }

            // 2. Cek masa berlaku
            $today = Carbon::today()->toDateString();
            if ($promo->tanggal_mulai->toDateString() > $today || $promo->tanggal_selesai->toDateString() < $today) {
                return response()->json([
                    'status' => 'invalid',
                    'message' => 'Promo belum dimulai atau sudah berakhir.'
                ], 422);
            }

            // 3. Cek Status Promo
            if ($promo->status !== 'Aktif') {
                return response()->json([
                    'status' => 'invalid',
                    'message' => 'Promo tidak sedang aktif.'
                ], 422);
            }

            // 4. Jika voucher, pastikan belum terpakai
            if ($voucher && $voucher->is_used) {
                return response()->json([
                    'status' => 'invalid',
                    'message' => 'Voucher fisik sudah pernah digunakan.'
                ], 422);
            }

            // 5. Jika promo global, pastikan kuota mencukupi
            if (!$voucher && $promo->kuota_global !== null && $promo->kuota_terpakai >= $promo->kuota_global) {
                return response()->json([
                    'status' => 'invalid',
                    'message' => 'Kuota global promo sudah habis.'
                ], 422);
            }

            // 6. Validasi Mode Promo
            $discountAmount = 0;
            $appliedItems = [];

            $targets = PromoTarget::where('promo_id', $promo->id)->get();

            if ($promo->mode_promo === 'min_order') {
                if ($totalBelanja < $promo->min_order_amount) {
                    return response()->json([
                        'status' => 'invalid',
                        'message' => "Total belanja minimum sebesar Rp " . number_format($promo->min_order_amount, 0, ',', '.') . " belum terpenuhi."
                    ], 422);
                }
                
                // Hitung diskon global min_order
                if ($promo->tipe_diskon === 'persentase') {
                    $discountAmount = $totalBelanja * ($promo->nilai_diskon / 100);
                } else {
                    $discountAmount = $promo->nilai_diskon;
                }
            } 
            elseif ($promo->mode_promo === 'bundle') {
                // Syarat: pastikan items memiliki barang yang terdaftar di target_type = Syarat
                $syaratTargets = $targets->where('target_type', 'Syarat');
                if ($syaratTargets->isEmpty()) {
                    return response()->json([
                        'status' => 'invalid',
                        'message' => 'Konfigurasi promo bundle tidak valid (Syarat kosong).'
                    ], 422);
                }

                $hasSyarat = false;
                foreach ($syaratTargets as $syarat) {
                    foreach ($items as $item) {
                        if ($item['item_type'] === $syarat->item_type && (int)$item['item_id'] === (int)$syarat->item_id) {
                            $hasSyarat = true;
                            break 2;
                        }
                    }
                }

                if (!$hasSyarat) {
                    return response()->json([
                        'status' => 'invalid',
                        'message' => 'Syarat pembelian item untuk promo ini belum terpenuhi.'
                    ], 422);
                }

                // Hitung Benefit: Cek jika ada item benefit di transaksi
                $benefitTargets = $targets->where('target_type', 'Benefit');
                foreach ($benefitTargets as $benefit) {
                    foreach ($items as $item) {
                        if ($item['item_type'] === $benefit->item_type && (int)$item['item_id'] === (int)$benefit->item_id) {
                            // Terapkan diskon ke item benefit
                            $itemDiscount = 0;
                            if ($promo->tipe_diskon === 'persentase') {
                                $itemDiscount = ($item['harga'] * $item['qty']) * ($promo->nilai_diskon / 100);
                            } else {
                                $itemDiscount = min($promo->nilai_diskon, $item['harga'] * $item['qty']);
                            }
                            $discountAmount += $itemDiscount;
                            $appliedItems[] = [
                                'item_type' => $item['item_type'],
                                'item_id' => $item['item_id'],
                                'discount' => $itemDiscount
                            ];
                        }
                    }
                }
            } 
            elseif ($promo->mode_promo === 'specific_item') {
                // Hitung diskon specific tiap item
                $spesifikTargets = $targets->where('target_type', 'Spesifik');
                if ($spesifikTargets->isEmpty()) {
                    return response()->json([
                        'status' => 'invalid',
                        'message' => 'Konfigurasi diskon spesifik item kosong.'
                    ], 422);
                }

                $hasSpesifik = false;
                foreach ($spesifikTargets as $spesifik) {
                    foreach ($items as $item) {
                        if ($item['item_type'] === $spesifik->item_type && (int)$item['item_id'] === (int)$spesifik->item_id) {
                            $hasSpesifik = true;
                            $itemDiscount = $spesifik->nilai_diskon_spesifik * $item['qty'];
                            $discountAmount += $itemDiscount;
                            $appliedItems[] = [
                                'item_type' => $item['item_type'],
                                'item_id' => $item['item_id'],
                                'discount' => $itemDiscount
                            ];
                        }
                    }
                }

                if (!$hasSpesifik) {
                    return response()->json([
                        'status' => 'invalid',
                        'message' => 'Tidak ada item dalam keranjang yang memenuhi diskon spesifik promo ini.'
                    ], 422);
                }
            } 
            else { // basic
                $targetTargets = $targets->where('target_type', 'Target');
                
                if ($targetTargets->isNotEmpty()) {
                    // Hanya item target yang didiskon
                    $hasTarget = false;
                    foreach ($targetTargets as $target) {
                        foreach ($items as $item) {
                            if ($item['item_type'] === $target->item_type && (int)$item['item_id'] === (int)$target->item_id) {
                                $hasTarget = true;
                                $itemDiscount = 0;
                                if ($promo->tipe_diskon === 'persentase') {
                                    $itemDiscount = ($item['harga'] * $item['qty']) * ($promo->nilai_diskon / 100);
                                } else {
                                    $itemDiscount = min($promo->nilai_diskon, $item['harga'] * $item['qty']);
                                }
                                $discountAmount += $itemDiscount;
                                $appliedItems[] = [
                                    'item_type' => $item['item_type'],
                                    'item_id' => $item['item_id'],
                                    'discount' => $itemDiscount
                                ];
                            }
                        }
                    }

                    if (!$hasTarget) {
                        return response()->json([
                            'status' => 'invalid',
                            'message' => 'Tidak ada item target promo ini di keranjang belanja.'
                        ], 422);
                    }
                } else {
                    // Global basic discount
                    if ($promo->tipe_diskon === 'persentase') {
                        $discountAmount = $totalBelanja * ($promo->nilai_diskon / 100);
                    } else {
                        $discountAmount = $promo->nilai_diskon;
                    }
                }
            }

            // Pastikan diskon tidak melebihi total belanja
            $discountAmount = min($discountAmount, $totalBelanja);

            return response()->json([
                'status' => 'valid',
                'message' => 'Promo berhasil divalidasi.',
                'promo' => [
                    'id' => $promo->id,
                    'nama_promo' => $promo->nama_promo,
                    'mode_promo' => $promo->mode_promo,
                    'is_voucher_fisik' => $promo->is_voucher_fisik,
                    'kode' => $voucher ? $voucher->kode_voucher : $promo->kode_promo,
                ],
                'discount_amount' => (float) $discountAmount,
                'applied_items' => $appliedItems
            ]);
        });
    }
}
