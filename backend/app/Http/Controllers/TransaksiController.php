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

class TransaksiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Transaksi::with(['pasien', 'karyawan', 'details.itemable']);

        // Filter berdasarkan status jika ada
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
                'nama_pasien_distributor' => 'required|string|max:255',
                'alamat_pengiriman' => 'nullable|string|max:255',
                'tanggal_transaksi' => 'required|date',
                'catatan_pesanan' => 'nullable|string|max:100',
                
                'details' => 'required|array|min:1',
                'details.*.item_type' => 'required|string|in:StokProduk,Treatment',
                'details.*.item_id' => 'required|integer',
                'details.*.qty' => 'required|integer|min:1',
            ]);

            DB::beginTransaction();

            // Auto generate No Faktur PB-yy-mm-dd/001
            $today = Carbon::now()->format('y-m-d');
            $lastTransaksi = Transaksi::whereDate('created_at', Carbon::today())
                                      ->orderBy('no_faktur', 'desc')
                                      ->first();
            if ($lastTransaksi) {
                $parts = explode('/', $lastTransaksi->no_faktur);
                $lastNumber = isset($parts[1]) ? (int)$parts[1] : 0;
                $newNumber = $lastNumber + 1;
            } else {
                $newNumber = 1;
            }
            $noFaktur = 'PB-' . $today . '/' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);

            // Fetch Karyawan dari auth pengguna yang sedang login
            // karena ada requirement "Nama karyawan dari data karyawan yang sedang melakukan transaksi"
            $karyawanId = Auth::id(); 
            if (!$karyawanId) {
                // fallback if not using sanctum properly in testing
                $karyawanId = \App\Models\DataKaryawan::first()->id ?? null;
            }

            $transaksi = Transaksi::create([
                'no_faktur' => $noFaktur,
                'data_pasien_id' => $validated['data_pasien_id'] ?? null,
                'nama_pasien_distributor' => $validated['nama_pasien_distributor'],
                'alamat_pengiriman' => $validated['alamat_pengiriman'] ?? null,
                'karyawan_id' => $karyawanId,
                'tanggal_transaksi' => $validated['tanggal_transaksi'],
                'catatan_pesanan' => $validated['catatan_pesanan'] ?? null,
                'status' => 'Pending',
                'total_keseluruhan' => 0
            ]);

            $totalKeseluruhan = 0;
            $detailsInsert = [];

            foreach ($validated['details'] as $item) {
                $itemClass = 'App\\Models\\' . $item['item_type'];
                $modelItem = $itemClass::find($item['item_id']);
                
                if (!$modelItem) {
                    throw ValidationException::withMessages(['details' => 'Item tidak ditemukan']);
                }

                // Field harga pada StokProduk / Treatment
                $harga = $modelItem->Harga;
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
            
            $transaksi->update(['total_keseluruhan' => $totalKeseluruhan]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'PO Produk berhasil dibuat (Pending)',
                'data' => $transaksi->load('details')
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
                'message' => 'Transaksi sudah Selesai dan tidak bisa diedit'
            ], 403);
        }

        try {
            $validated = $request->validate([
                'details' => 'required|array|min:1',
                'details.*.item_type' => 'required|string|in:StokProduk,Treatment',
                'details.*.item_id' => 'required|integer',
                'details.*.qty' => 'required|integer|min:1',
            ]);

            DB::beginTransaction();

            // Hapus detail lama dan masukkan yang baru
            $transaksi->details()->delete();

            $totalKeseluruhan = 0;
            $detailsInsert = [];

            foreach ($validated['details'] as $item) {
                $itemClass = 'App\\Models\\' . $item['item_type'];
                $modelItem = $itemClass::find($item['item_id']);
                
                if (!$modelItem) {
                    throw ValidationException::withMessages(['details' => 'Item tidak ditemukan']);
                }

                $harga = $modelItem->Harga;
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
    public function approve($id)
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
            // Auto generate No Resi PO-yy-mm-dd/001
            $today = Carbon::now()->format('y-m-d');
            $lastResi = Transaksi::whereNotNull('no_resi')
                                 ->whereDate('updated_at', Carbon::today())
                                 ->orderBy('no_resi', 'desc')
                                 ->first();
            if ($lastResi) {
                $parts = explode('/', $lastResi->no_resi);
                $lastNumber = isset($parts[1]) ? (int)$parts[1] : 0;
                $newNumber = $lastNumber + 1;
            } else {
                $newNumber = 1;
            }
            $noResi = 'PO-' . $today . '/' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);

            // Update Transaksi
            $transaksi->update([
                'no_resi' => $noResi,
                'status' => 'Selesai'
            ]);

            // Pengurangan Stok
            foreach ($transaksi->details as $detail) {
                if ($detail->itemable_type === 'App\Models\StokProduk') {
                    $produk = StokProduk::find($detail->itemable_id);
                    if ($produk) {
                        $produk->Stok -= $detail->qty;
                        $produk->save();
                    }
                } elseif ($detail->itemable_type === 'App\Models\Treatment') {
                    $treatment = Treatment::with('bahan')->find($detail->itemable_id);
                    if ($treatment && $treatment->bahan) {
                        foreach ($treatment->bahan as $bahanRelation) {
                            $bahanModelClass = $bahanRelation->bahan_type;
                            $bahan = $bahanModelClass::find($bahanRelation->bahan_id);
                            if ($bahan) {
                                // Kurangi stok bahan: qty transaksi * jumlah bahan per treatment
                                $pengurangan = $detail->qty * $bahanRelation->Jumlah;
                                $bahan->Stok -= $pengurangan;
                                $bahan->save();
                            }
                        }
                    }
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Transaksi berhasil diselesaikan. No Resi di-generate dan stok telah dikurangi.',
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
