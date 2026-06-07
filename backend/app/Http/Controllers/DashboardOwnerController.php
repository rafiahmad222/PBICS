<?php

namespace App\Http\Controllers;

use App\Models\TransaksiDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardOwnerController extends Controller
{
    /**
     * Get the top selling products, treatments, and racikan from completed transactions.
     */
    public function getTopSellingItems(Request $request)
    {
        $limit = (int) $request->input('limit', 5);
        if ($limit <= 0 || $limit > 50) {
            $limit = 5;
        }

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Helper function to query top selling items of a specific morph type
        $getTopSelling = function ($itemableType) use ($startDate, $endDate, $limit) {
            $query = TransaksiDetail::where('itemable_type', $itemableType)
                ->whereHas('transaksi', function ($q) use ($startDate, $endDate) {
                    $q->where('status', 'Selesai');
                    if ($startDate) {
                        $q->whereDate('tanggal_transaksi', '>=', $startDate);
                    }
                    if ($endDate) {
                        $q->whereDate('tanggal_transaksi', '<=', $endDate);
                    }
                });

            return $query->select(
                    'itemable_id',
                    'nama_item',
                    'harga',
                    DB::raw('SUM(qty) as total_terjual'),
                    DB::raw('SUM(total_harga) as total_pendapatan')
                )
                ->groupBy('itemable_id', 'nama_item', 'harga')
                ->orderByDesc('total_terjual')
                ->limit($limit)
                ->with('itemable')
                ->get();
        };

        // Query top sold products, treatments, and racikan
        $topProductsRaw = $getTopSelling('App\Models\StokProduk');
        $topTreatmentsRaw = $getTopSelling('App\Models\Treatment');
        $topRacikanRaw = $getTopSelling('App\Models\StokRacikan');

        // Format the results
        $topProducts = $topProductsRaw->map(function ($detail) {
            $product = $detail->itemable;
            return [
                'id' => $detail->itemable_id,
                'nama_item' => $product ? $product->Nama_produk : $detail->nama_item,
                'kode' => $product ? $product->Kode_Produk : null,
                'stok' => $product ? (int) $product->Stok : 0,
                'harga' => $product ? (float) $product->Harga : (float) $detail->harga,
                'total_terjual' => (int) $detail->total_terjual,
                'total_pendapatan' => (float) $detail->total_pendapatan,
            ];
        });

        $topTreatments = $topTreatmentsRaw->map(function ($detail) {
            $treatment = $detail->itemable;
            return [
                'id' => $detail->itemable_id,
                'nama_item' => $treatment ? $treatment->Nama_treatment : $detail->nama_item,
                'kode' => $treatment ? $treatment->Kode_treatment : null,
                'harga' => $treatment ? (float) $treatment->Harga : (float) $detail->harga,
                'status' => $treatment ? $treatment->status : 'Available',
                'total_terjual' => (int) $detail->total_terjual,
                'total_pendapatan' => (float) $detail->total_pendapatan,
            ];
        });

        $topRacikan = $topRacikanRaw->map(function ($detail) {
            $racikan = $detail->itemable;
            return [
                'id' => $detail->itemable_id,
                'nama_item' => $racikan ? $racikan->nama_obat_racik : $detail->nama_item,
                'deskripsi_racikan' => $racikan ? $racikan->deskripsi_racikan : null,
                'harga' => $racikan ? (float) $racikan->harga : (float) $detail->harga,
                'total_terjual' => (int) $detail->total_terjual,
                'total_pendapatan' => (float) $detail->total_pendapatan,
            ];
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Data penjualan terlaris berhasil ditampilkan',
            'data' => [
                'produk' => $topProducts,
                'treatment' => $topTreatments,
                'racikan' => $topRacikan
            ]
        ]);
    }
}
