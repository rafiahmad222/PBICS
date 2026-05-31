<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use Illuminate\Http\Request;

class LaporanPenjualanController extends Controller
{
    /**
     * Menampilkan seluruh data Laporan Penjualan (hanya transaksi yang 'Selesai')
     */
    public function index(Request $request)
    {
        $query = Transaksi::with(['pasien', 'karyawan'])
            ->where('status', 'Selesai');

        // Filter berdasarkan tanggal transaksi (Mulai dari)
        if ($request->filled('start_date')) {
            $query->whereDate('tanggal_transaksi', '>=', $request->start_date);
        }

        // Filter berdasarkan tanggal transaksi (Sampai dengan)
        if ($request->filled('end_date')) {
            $query->whereDate('tanggal_transaksi', '<=', $request->end_date);
        }

        // Filter berdasarkan tipe transaksi (Produk, Treatment, Racikan)
        if ($request->filled('tipe_transaksi')) {
            $query->where('tipe_transaksi', $request->tipe_transaksi);
        }

        // Pencarian berdasarkan No Faktur atau Nama Pasien/Distributor
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('no_faktur', 'like', "%{$search}%")
                  ->orWhere('nama_pasien_distributor', 'like', "%{$search}%");
            });
        }

        $transaksis = $query->orderBy('tanggal_transaksi', 'desc')
                            ->orderBy('created_at', 'desc')
                            ->get();

        $formatted = $transaksis->map(function ($transaksi) {
            return [
                'id' => $transaksi->id,
                'Tanggal_Transaksi' => $transaksi->tanggal_transaksi,
                'no_Faktur' => $transaksi->no_faktur,
                'Nama_pasien_atau_Distributor' => $transaksi->nama_pasien_distributor,
                'Total_Harga' => (float) $transaksi->total_keseluruhan,
            ];
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Laporan Penjualan berhasil ditampilkan',
            'data' => $formatted
        ]);
    }

    /**
     * Menampilkan detail data dari salah satu Laporan Penjualan
     */
    public function show($id)
    {
        $transaksi = Transaksi::with(['pasien', 'karyawan', 'details'])
            ->where('status', 'Selesai')
            ->find($id);

        if (!$transaksi) {
            return response()->json([
                'status' => 'error',
                'message' => 'Laporan Penjualan tidak ditemukan atau belum selesai'
            ], 404);
        }

        $formatted = [
            'id' => $transaksi->id,
            'No_Faktur' => $transaksi->no_faktur,
            'Nama_Customer' => $transaksi->nama_pasien_distributor,
            'No_RM' => $transaksi->pasien ? $transaksi->pasien->no_RM : '-',
            'Alamat_Pengiriman' => $transaksi->alamat_pengiriman ?? '-',
            'Tanggal_Transaksi' => $transaksi->tanggal_transaksi,
            'Nama_Kasir_atau_MOS' => $transaksi->karyawan ? $transaksi->karyawan->NamaLengkap_karyawan : '-',
            'Catatan_Pesanan' => $transaksi->catatan_pesanan ?? '-',
            'details' => $transaksi->details->map(function ($detail) {
                return [
                    'Nama_Produk' => $detail->nama_item,
                    'Qty' => (int) $detail->qty,
                    'Harga' => (float) $detail->harga,
                    'Total_Harga' => (float) $detail->total_harga,
                ];
            }),
            'Total_Harga_Keseluruhan' => (float) $transaksi->total_keseluruhan,
        ];

        return response()->json([
            'status' => 'success',
            'message' => 'Detail Laporan Penjualan berhasil ditampilkan',
            'data' => $formatted
        ]);
    }
}
