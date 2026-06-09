<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use App\Models\TransaksiDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

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

    /**
     * Get summary statistics for the dashboard cards.
     */
    public function getSummaryStats(Request $request)
    {
        $now = Carbon::now();
        
        $currentMonthStart = $now->copy()->startOfMonth();
        $currentMonthEnd = $now->copy()->endOfMonth();
        
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
        $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

        $getStats = function($start, $end) {
            $transaksis = Transaksi::where('status', 'Selesai')
                ->whereBetween('tanggal_transaksi', [$start, $end])
                ->get();

            $revenue = $transaksis->sum('total_keseluruhan');
            $transactionsCount = $transaksis->count();

            return [
                'revenue' => $revenue,
                'transactions' => $transactionsCount
            ];
        };

        $currentStats = $getStats($currentMonthStart, $currentMonthEnd);
        $lastStats = $getStats($lastMonthStart, $lastMonthEnd);

        $calculateGrowth = function($current, $last) {
            if ($last > 0) {
                return (($current - $last) / $last) * 100;
            } elseif ($current > 0) {
                return 100;
            }
            return 0;
        };

        $revenueGrowth = $calculateGrowth($currentStats['revenue'], $lastStats['revenue']);
        $transactionsGrowth = $calculateGrowth($currentStats['transactions'], $lastStats['transactions']);

        // Sales sources (Klinik vs Reseller) specifically for 'Produk'
        $resellerSales = Transaksi::where('status', 'Selesai')
            ->where('tipe_transaksi', 'Produk')
            ->where('nama_pasien_distributor', 'LIKE', '%- DISTRIBUTOR%')
            ->whereBetween('tanggal_transaksi', [$currentMonthStart, $currentMonthEnd])
            ->sum('total_keseluruhan');

        $klinikSales = Transaksi::where('status', 'Selesai')
            ->where('tipe_transaksi', 'Produk')
            ->where(function($query) {
                $query->whereNull('nama_pasien_distributor')
                      ->orWhere('nama_pasien_distributor', 'NOT LIKE', '%- DISTRIBUTOR%');
            })
            ->whereBetween('tanggal_transaksi', [$currentMonthStart, $currentMonthEnd])
            ->sum('total_keseluruhan');

        $salesSources = [
            [
                'name' => 'Klinik (Kantor)',
                'value' => (float) $klinikSales,
                'color' => '#1B4D3E'
            ],
            [
                'name' => 'Reseller',
                'value' => (float) $resellerSales,
                'color' => '#829356'
            ]
        ];

        return response()->json([
            'status' => 'success',
            'data' => [
                'revenue' => [
                    'value' => $currentStats['revenue'],
                    'growth' => round($revenueGrowth, 1),
                    'trend' => $revenueGrowth >= 0 ? 'up' : 'down'
                ],
                'transactions' => [
                    'value' => $currentStats['transactions'],
                    'growth' => round($transactionsGrowth, 1),
                    'trend' => $transactionsGrowth >= 0 ? 'up' : 'down'
                ],
                'sales_sources' => $salesSources
            ]
        ]);
    }
}
