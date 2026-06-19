<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use App\Models\StokProduk;
use App\Models\Treatment;
use App\Models\DataPasien;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;
use App\Traits\ShiftsDateAfterFivePM;

class TransaksiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Transaksi::with(['pasien', 'karyawan', 'details.itemable']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $transaksis = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Data Transaksi berhasil ditampilkan',
            'data' => $transaksis
        ]);
    }

    /**
     * Store a newly created resource in storage (Oleh MOS / CS).
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'data_pasien_id' => 'nullable|exists:data_pasiens,id',
                'distributor_id' => 'nullable|exists:distributors,id',
                'nama_pasien_distributor' => 'required|string|max:255',
                'is_distributor' => 'nullable|boolean',
                'alamat_pengiriman' => 'nullable|string|max:255',
                'tanggal_transaksi' => 'required|date',
                'catatan_pesanan' => 'nullable|string|max:100',
                'metode_pembayaran' => 'nullable|string|in:Tunai,Non Tunai',
                
                'details' => 'required|array|min:1',
                'details.*.item_type' => 'required|string|in:StokProduk,Treatment,StokRacikan',
                'details.*.item_id' => 'required|integer',
                'details.*.qty' => 'required|integer|min:1',
            ]);

            DB::beginTransaction();

            $isDistributor = !empty($validated['distributor_id']) || $request->boolean('is_distributor');

            if (!empty($validated['distributor_id'])) {
                foreach ($validated['details'] as $detail) {
                    if ($detail['item_type'] !== 'StokProduk') {
                        throw ValidationException::withMessages([
                            'details' => 'Distributor hanya diperbolehkan membeli produk (StokProduk).'
                        ]);
                    }
                }

                $distributor = \App\Models\Distributor::find($validated['distributor_id']);
                if ($distributor) {
                    $totalRequiredDeposit = 0;
                    foreach ($validated['details'] as $item) {
                        $itemClass = 'App\\Models\\' . $item['item_type'];
                        $modelItem = $itemClass::find($item['item_id']);
                        if (!$modelItem) {
                            throw ValidationException::withMessages(['details' => 'Item tidak ditemukan']);
                        }
                        $harga = (isset($modelItem->Harga_Distributor) && $modelItem->Harga_Distributor > 0) 
                                 ? $modelItem->Harga_Distributor 
                                 : $modelItem->Harga;
                        $totalRequiredDeposit += $harga * $item['qty'];
                    }

                    if ($distributor->sisa_deposit < $totalRequiredDeposit) {
                        throw ValidationException::withMessages([
                            'distributor_id' => 'Saldo deposit distributor tidak mencukupi. Sisa deposit saat ini: Rp ' . number_format($distributor->sisa_deposit, 0, ',', '.')
                        ]);
                    }

                    $distributor->sisa_deposit -= $totalRequiredDeposit;
                    $distributor->save();
                }
            }

            $karyawanId = Auth::id(); 
            if (!$karyawanId) {
                $karyawanId = \App\Models\DataKaryawan::first()->id ?? null;
            }

            $itemsProduk = [];
            $itemsTreatment = [];
            $itemsRacikan = [];

            foreach ($validated['details'] as $item) {
                if ($item['item_type'] === 'StokProduk') {
                    $itemsProduk[] = $item;
                } elseif ($item['item_type'] === 'Treatment') {
                    $itemsTreatment[] = $item;
                } elseif ($item['item_type'] === 'StokRacikan') {
                    $itemsRacikan[] = $item;
             
                }
            }

            $createdTransaksis = [];
            $businessNow = ShiftsDateAfterFivePM::getBusinessDate();
            $todayYmd = $businessNow->format('ymd');
            $orderId = 'ORD-' . $todayYmd . '-' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT);

            // Process Treatment
            if (count($itemsTreatment) > 0) {
                // 1. Validasi ketersediaan stok bahan untuk seluruh treatment yang dipesan
                $requiredIngredients = [];
                foreach ($itemsTreatment as $item) {
                    $itemClass = 'App\\Models\\' . $item['item_type'];
                    $modelItem = $itemClass::with('bahan')->find($item['item_id']);
                    
                    if (!$modelItem) {
                        throw ValidationException::withMessages(['details' => 'Item tidak ditemukan']);
                    }

                    if ($modelItem->bahan) {
                        foreach ($modelItem->bahan as $bahanRelation) {
                            $key = $bahanRelation->bahan_type . ':' . $bahanRelation->bahan_id;
                            $neededQty = $item['qty'] * $bahanRelation->Jumlah;
                            
                            if (isset($requiredIngredients[$key])) {
                                $requiredIngredients[$key]['qty'] += $neededQty;
                            } else {
                                $requiredIngredients[$key] = [
                                    'bahan_type' => $bahanRelation->bahan_type,
                                    'bahan_id' => $bahanRelation->bahan_id,
                                    'qty' => $neededQty,
                                    'nama_treatment' => $modelItem->Nama_treatment
                                ];
                            }
                        }
                    }
                }

                foreach ($requiredIngredients as $req) {
                    $bahanModelClass = $req['bahan_type'];
                    $bahan = $bahanModelClass::find($req['bahan_id']);
                    
                    if (!$bahan) {
                        throw ValidationException::withMessages([
                            'details' => "Bahan untuk treatment '{$req['nama_treatment']}' tidak ditemukan."
                        ]);
                    }

                    if ($bahan->Stok < $req['qty']) {
                        $namaBahan = $bahan->Nama_produk 
                            ?? $bahan->Nama_barang_apotek 
                            ?? $bahan->Nama_bahan_medis 
                            ?? $bahan->Nama_bahan_infus 
                            ?? 'Bahan';
                        throw ValidationException::withMessages([
                            'details' => "Stok bahan '{$namaBahan}' tidak mencukupi untuk melakukan treatment '{$req['nama_treatment']}'. Dibutuhkan: {$req['qty']}, Tersedia: {$bahan->Stok}."
                        ]);
                    }
                }

                $prefixTreatment = 'PB-' . $todayYmd . '2';
                $lastFakturTreatment = Transaksi::where('no_faktur', 'like', $prefixTreatment . '%')
                                                ->orderBy('no_faktur', 'desc')
                                                ->first();
                if ($lastFakturTreatment) {
                    $lastSeq = (int) substr($lastFakturTreatment->no_faktur, -3);
                    $newSeq = $lastSeq + 1;
                } else {
                    $newSeq = 1;
                }
                $noFakturTreatment = 'PB-' . $todayYmd . '2' . str_pad($newSeq, 3, '0', STR_PAD_LEFT);

                $transaksiTreatment = Transaksi::create([
                    'order_id' => $orderId,
                    'tipe_transaksi' => 'Treatment',
                    'no_resi' => null,
                    'no_faktur' => $noFakturTreatment,
                    'data_pasien_id' => $validated['data_pasien_id'] ?? null,
                    'distributor_id' => $validated['distributor_id'] ?? null,
                    'nama_pasien_distributor' => $validated['nama_pasien_distributor'],
                    'alamat_pengiriman' => $validated['alamat_pengiriman'] ?? null,
                    'karyawan_id' => $karyawanId,
                    'tanggal_transaksi' => $validated['tanggal_transaksi'],
                    'catatan_pesanan' => $validated['catatan_pesanan'] ?? null,
                    'status' => 'Selesai',
                    'total_keseluruhan' => 0,
                    'metode_pembayaran' => $validated['metode_pembayaran'] ?? 'Tunai'
                ]);

                $totalKeseluruhan = 0;
                $detailsInsert = [];

                foreach ($itemsTreatment as $item) {
                    $itemClass = 'App\\Models\\' . $item['item_type'];
                    $modelItem = $itemClass::with('bahan')->find($item['item_id']);
                    
                    if (!$modelItem) {
                        throw ValidationException::withMessages(['details' => 'Item tidak ditemukan']);
                    }

                    $harga = $modelItem->Harga;
                    $namaItem = $modelItem->Nama_treatment;
                    
                    $totalHarga = $harga * $item['qty'];
                    $totalKeseluruhan += $totalHarga;

                    $detailsInsert[] = [
                        'id' => \Illuminate\Support\Str::uuid()->toString(),
                        'transaksi_id' => $transaksiTreatment->id,
                        'itemable_type' => $itemClass,
                        'itemable_id' => $item['item_id'],
                        'nama_item' => $namaItem,
                        'qty' => $item['qty'],
                        'harga' => $harga,
                        'total_harga' => $totalHarga,
                        'created_at' => $businessNow,
                        'updated_at' => $businessNow,
                    ];

                    // Kurangi stok bahan
                    if ($modelItem->bahan) {
                        foreach ($modelItem->bahan as $bahanRelation) {
                            $bahanModelClass = $bahanRelation->bahan_type;
                            $bahan = $bahanModelClass::find($bahanRelation->bahan_id);
                            if ($bahan) {
                                $pengurangan = $item['qty'] * $bahanRelation->Jumlah;
                                $bahan->Stok -= $pengurangan;
                                $bahan->save();
                            }
                        }
                    }
                }

                \App\Models\TransaksiDetail::insert($detailsInsert);
                $transaksiTreatment->update(['total_keseluruhan' => $totalKeseluruhan]);
                $createdTransaksis[] = $transaksiTreatment->load('details');
            }

            // Process Obat Racik
            if (count($itemsRacikan) > 0) {
                $prefixRacikan = 'PB-' . $todayYmd . '3';
                $lastFakturRacikan = Transaksi::where('no_faktur', 'like', $prefixRacikan . '%')
                                              ->orderBy('no_faktur', 'desc')
                                              ->first();
                if ($lastFakturRacikan) {
                    $lastSeq = (int) substr($lastFakturRacikan->no_faktur, -3);
                    $newSeq = $lastSeq + 1;
                } else {
                    $newSeq = 1;
                }
                $noFakturRacikan = 'PB-' . $todayYmd . '3' . str_pad($newSeq, 3, '0', STR_PAD_LEFT);

                $transaksiRacikan = Transaksi::create([
                    'order_id' => $orderId,
                    'tipe_transaksi' => 'Racikan',
                    'no_resi' => null,
                    'no_faktur' => $noFakturRacikan,
                    'data_pasien_id' => $validated['data_pasien_id'] ?? null,
                    'distributor_id' => $validated['distributor_id'] ?? null,
                    'nama_pasien_distributor' => $validated['nama_pasien_distributor'],
                    'alamat_pengiriman' => $validated['alamat_pengiriman'] ?? null,
                    'karyawan_id' => $karyawanId,
                    'tanggal_transaksi' => $validated['tanggal_transaksi'],
                    'catatan_pesanan' => $validated['catatan_pesanan'] ?? null,
                    'status' => 'Selesai',
                    'total_keseluruhan' => 0,
                    'metode_pembayaran' => $validated['metode_pembayaran'] ?? 'Tunai'
                ]);

                $totalKeseluruhan = 0;
                $detailsInsert = [];

                foreach ($itemsRacikan as $item) {
                    $itemClass = 'App\\Models\\' . $item['item_type'];
                    $modelItem = $itemClass::find($item['item_id']);
                    
                    if (!$modelItem) {
                        throw ValidationException::withMessages(['details' => 'Item tidak ditemukan']);
                    }

                    $harga = $modelItem->harga ?? $modelItem->Harga;
                    $namaItem = $modelItem->nama_obat_racik ?? $modelItem->Nama_obat_racik;
                    
                    $totalHarga = $harga * $item['qty'];
                    $totalKeseluruhan += $totalHarga;

                    $detailsInsert[] = [
                        'id' => \Illuminate\Support\Str::uuid()->toString(),
                        'transaksi_id' => $transaksiRacikan->id,
                        'itemable_type' => $itemClass,
                        'itemable_id' => $item['item_id'],
                        'nama_item' => $namaItem,
                        'qty' => $item['qty'],
                        'harga' => $harga,
                        'total_harga' => $totalHarga,
                        'created_at' => $businessNow,
                        'updated_at' => $businessNow,
                    ];
                }

                \App\Models\TransaksiDetail::insert($detailsInsert);
                $transaksiRacikan->update(['total_keseluruhan' => $totalKeseluruhan]);
                $createdTransaksis[] = $transaksiRacikan->load('details');
            }

            // Process Produk
            if (count($itemsProduk) > 0) {
                $prefixResiPO = 'PO-' . $todayYmd . '1';
                $lastResiPO = Transaksi::where('no_resi', 'like', $prefixResiPO . '%')
                                        ->orderBy('no_resi', 'desc')
                                        ->first();
                if ($lastResiPO) {
                    $lastSeq = (int) substr($lastResiPO->no_resi, -3);
                    $newSeq = $lastSeq + 1;
                } else {
                    $newSeq = 1;
                }
                $noResiPO = 'PO-' . $todayYmd . '1' . str_pad($newSeq, 3, '0', STR_PAD_LEFT);

                $transaksiProduk = Transaksi::create([
                    'order_id' => $orderId,
                    'tipe_transaksi' => 'Produk',
                    'no_resi' => $noResiPO,
                    'no_faktur' => null,
                    'data_pasien_id' => $validated['data_pasien_id'] ?? null,
                    'distributor_id' => $validated['distributor_id'] ?? null,
                    'nama_pasien_distributor' => $validated['nama_pasien_distributor'],
                    'alamat_pengiriman' => $validated['alamat_pengiriman'] ?? null,
                    'karyawan_id' => $karyawanId,
                    'tanggal_transaksi' => $validated['tanggal_transaksi'],
                    'catatan_pesanan' => $validated['catatan_pesanan'] ?? null,
                    'status' => 'Pending',
                    'total_keseluruhan' => 0,
                    'metode_pembayaran' => $validated['metode_pembayaran'] ?? 'Tunai'
                ]);

                $totalKeseluruhan = 0;
                $detailsInsert = [];

                foreach ($itemsProduk as $item) {
                    $itemClass = 'App\\Models\\' . $item['item_type'];
                    $modelItem = $itemClass::find($item['item_id']);
                    
                    if (!$modelItem) {
                        throw ValidationException::withMessages(['details' => 'Item tidak ditemukan']);
                    }

                    $harga = ($isDistributor && isset($modelItem->Harga_Distributor) && $modelItem->Harga_Distributor > 0) 
                             ? $modelItem->Harga_Distributor 
                             : $modelItem->Harga;
                    $namaItem = $modelItem->Nama_produk;
                    
                    $totalHarga = $harga * $item['qty'];
                    $totalKeseluruhan += $totalHarga;

                    $detailsInsert[] = [
                        'id' => \Illuminate\Support\Str::uuid()->toString(),
                        'transaksi_id' => $transaksiProduk->id,
                        'itemable_type' => $itemClass,
                        'itemable_id' => $item['item_id'],
                        'nama_item' => $namaItem,
                        'qty' => $item['qty'],
                        'harga' => $harga,
                        'total_harga' => $totalHarga,
                        'created_at' => $businessNow,
                        'updated_at' => $businessNow,
                    ];
                }

                \App\Models\TransaksiDetail::insert($detailsInsert);
                $transaksiProduk->update(['total_keseluruhan' => $totalKeseluruhan]);
                $createdTransaksis[] = $transaksiProduk->load('details');
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Transaksi berhasil dibuat',
                'data' => $createdTransaksis
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $transaksi = Transaksi::with(['pasien', 'karyawan', 'details.itemable'])->find($id);

        if (!$transaksi) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Transaksi tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $transaksi
        ]);
    }

    /**
     * Update the specified resource in storage (Edit oleh Gudang jika data tidak sesuai).
     */
    public function update(Request $request, $id)
    {
        $transaksi = Transaksi::find($id);

        if (!$transaksi) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Transaksi tidak ditemukan'
            ], 404);
        }

        if ($transaksi->status === 'Selesai') {
            return response()->json([
                'status' => 'error',
                'message' => 'Transaksi sudah selesai dan tidak bisa di edit'
            ], 403);
        }

        try {
            $validated = $request->validate([
                'details' => 'required|array|min:1',
                'details.*.item_type' => 'required|string|in:StokProduk,Treatment',
                'details.*.item_id' => 'required|integer',
                'details.*.qty' => 'required|integer|min:1',
            ]);

            if ($transaksi->distributor_id) {
                foreach ($validated['details'] as $detail) {
                    if ($detail['item_type'] !== 'StokProduk') {
                        throw ValidationException::withMessages([
                            'details' => 'Distributor hanya diperbolehkan membeli produk (StokProduk).'
                        ]);
                    }
                }
            }

            DB::beginTransaction();

            $transaksi->details()->delete();

            $totalKeseluruhan = 0;
            $detailsInsert = [];

            foreach ($validated['details'] as $item) {
                $itemClass = 'App\\Models\\' . $item['item_type'];
                $modelItem = $itemClass::find($item['item_id']);
                
                if (!$modelItem) {
                    throw ValidationException::withMessages(['details' => 'Item tidak ditemukan']);
                }

                $harga = ($transaksi->distributor_id && isset($modelItem->Harga_Distributor) && $modelItem->Harga_Distributor > 0)
                         ? $modelItem->Harga_Distributor
                         : $modelItem->Harga;
                $namaItem = $item['item_type'] === 'StokProduk' ? $modelItem->Nama_produk : $modelItem->Nama_treatment;
                
                $totalHarga = $harga * $item['qty'];
                $totalKeseluruhan += $totalHarga;

                $detailsInsert[] = [
                    'id' => \Illuminate\Support\Str::uuid()->toString(),
                    'transaksi_id' => $transaksi->id,
                    'itemable_type' => $itemClass,
                    'itemable_id' => $item['item_id'],
                    'nama_item' => $namaItem,
                    'qty' => $item['qty'],
                    'harga' => $harga,
                    'total_harga' => $totalHarga,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            \App\Models\TransaksiDetail::insert($detailsInsert);

            $oldTotal = $transaksi->total_keseluruhan;
            $newTotal = $totalKeseluruhan;

            if ($transaksi->distributor_id) {
                $distributor = \App\Models\Distributor::find($transaksi->distributor_id);
                if ($distributor) {
                    $diff = $newTotal - $oldTotal;
                    if ($diff > 0) {
                        if ($distributor->sisa_deposit < $diff) {
                            throw ValidationException::withMessages([
                                'details' => 'Saldo deposit distributor tidak mencukupi untuk perubahan jumlah barang ini. Sisa deposit saat ini: Rp ' . number_format($distributor->sisa_deposit, 0, ',', '.')
                            ]);
                        }
                        $distributor->sisa_deposit -= $diff;
                    } else {
                        $distributor->sisa_deposit += abs($diff);
                    }
                    $distributor->save();
                }
            }

            $transaksi->update(['total_keseluruhan' => $totalKeseluruhan]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Data Transaksi berhasil diperbarui',
                'data' => $transaksi->load('details')
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Gudang Klik Simpan -> Selesaikan Pesanan, Generate No Resi, dan Kurangi Stok.
     */
    public function approve(Request $request, $id)
    {
        $transaksi = Transaksi::with('details')->find($id);

        if (!$transaksi) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Transaksi tidak ditemukan'
            ], 404);
        }

        if ($transaksi->status === 'Selesai') {
            return response()->json([
                'status' => 'error',
                'message' => 'Transaksi ini sudah diselesaikan sebelumnya.'
            ], 400);
        }

        DB::beginTransaction();

        try {
            // Tangkap dan proses payload details jika dikirim dari frontend (Gudang edit jumlah / hapus barang)
            if ($request->has('details') && is_array($request->details)) {
                $sentDetails = collect($request->details);
                $sentIds = $sentDetails->pluck('id')->filter()->toArray();

                // Hapus record transaksi_details yang tidak ada di array details payload
                if (!empty($sentIds)) {
                    $transaksi->details()->whereNotIn('id', $sentIds)->delete();
                } else {
                    $transaksi->details()->delete();
                }

                $totalKeseluruhan = 0;
                
                // Timpa/update qty dan subtotal pada data transaksi_details lama
                $updatedDetails = $transaksi->details()->get();
                foreach ($updatedDetails as $detail) {
                    $payloadItem = $sentDetails->firstWhere('id', $detail->id);
                    if ($payloadItem) {
                        $oldQty = $detail->qty;
                        $newQty = $payloadItem['qty'] ?? $detail->qty;

                        $detail->qty = $newQty;
                        
                        if (isset($payloadItem['itemable_id'])) {
                            if ($transaksi->distributor_id && isset($payloadItem['itemable_type']) && $payloadItem['itemable_type'] !== 'App\\Models\\StokProduk') {
                                throw new \Exception('Distributor hanya diperbolehkan membeli produk (StokProduk).');
                            }
                            $detail->itemable_id = $payloadItem['itemable_id'];
                            $detail->itemable_type = $payloadItem['itemable_type'] ?? $detail->itemable_type;
                            $detail->nama_item = $payloadItem['nama_item'] ?? $detail->nama_item;
                            $detail->harga = $payloadItem['harga'] ?? $detail->harga;
                        }

                        $detail->total_harga = isset($payloadItem['subtotal']) ? $payloadItem['subtotal'] : ($detail->harga * $detail->qty);
                        $detail->save();
                        
                        $totalKeseluruhan += $detail->total_harga;
                    }
                }
                
                $oldTotal = $transaksi->total_keseluruhan;
                $newTotal = $totalKeseluruhan;

                if ($transaksi->distributor_id) {
                    $distributor = \App\Models\Distributor::find($transaksi->distributor_id);
                    if ($distributor) {
                        $diff = $newTotal - $oldTotal;
                        if ($diff > 0) {
                            if ($distributor->sisa_deposit < $diff) {
                                throw new \Exception('Saldo deposit distributor tidak mencukupi untuk perubahan jumlah barang ini. Sisa deposit saat ini: Rp ' . number_format($distributor->sisa_deposit, 0, ',', '.'));
                            }
                            $distributor->sisa_deposit -= $diff;
                        } else {
                            $distributor->sisa_deposit += abs($diff);
                        }
                        $distributor->save();
                    }
                }

                // Hitung ulang total harga induk
                $transaksi->update(['total_keseluruhan' => $totalKeseluruhan]);
                
                // Refresh relasi details karena ada perubahan
                $transaksi->load('details');
            }

            // Auto generate No Faktur PB-YYMMDD1xxx (hanya untuk Stok Produk)
            $todayYmd = ShiftsDateAfterFivePM::getBusinessDate()->format('ymd');
            $prefixFakturProduk = 'PB-' . $todayYmd . '1';
            $lastFaktur = Transaksi::where('no_faktur', 'like', $prefixFakturProduk . '%')
                                   ->orderBy('no_faktur', 'desc')
                                   ->first();
            if ($lastFaktur) {
                $lastSeq = (int) substr($lastFaktur->no_faktur, -3);
                $newSeq = $lastSeq + 1;
            } else {
                $newSeq = 1;
            }
            $noFaktur = 'PB-' . $todayYmd . '1' . str_pad($newSeq, 3, '0', STR_PAD_LEFT);

            // Update Transaksi
            $updateData = [
                'no_faktur' => $noFaktur,
                'status' => 'Selesai'
            ];
            
            if ($request->has('alamat_pengiriman')) {
                $updateData['alamat_pengiriman'] = $request->alamat_pengiriman;
            }

            $transaksi->update($updateData);

            // Kurangi stok produk secara riil saat disetujui (ACC PO) oleh Gudang
            foreach ($transaksi->details as $detail) {
                if ($detail->itemable_type === 'App\Models\StokProduk') {
                    $produk = StokProduk::find($detail->itemable_id);
                    if ($produk) {
                        $produk->Stok -= $detail->qty;
                        $produk->save();
                    }
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Transaksi berhasil diselesaikan. No Faktur di-generate dan stok telah dikurangi.',
                'data' => $transaksi->load('details.itemable')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
    }
}
