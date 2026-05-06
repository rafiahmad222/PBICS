<?php

namespace App\Http\Controllers;

use App\Models\PaketBundling;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class PaketBundlingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Ambil data paket bundling beserta produk-produknya
        $paket = PaketBundling::get();

        return response()->json([
            'status' => 'success',
            'message' => 'Data Paket Bundling berhasil diambil',
            'data' => $paket
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'Kode_paket' => 'required|string|max:225|unique:paket_bundlings',
                'Nama_paket' => 'required|string|max:100',
                'Deskripsi' => 'nullable|string',
                'Harga_paket' => 'required|numeric',
                'Harga_Distributor_paket' => 'nullable|numeric',
                'produks' => 'required|array|min:1',
                'produks.*.stok_produk_id' => 'required|exists:stok_produks,id',
                'produks.*.Jumlah' => 'required|integer|min:1',
            ], [
                'Kode_paket.required' => 'Kode paket wajib diisi.',
                'Kode_paket.unique' => 'Kode paket sudah digunakan.',
                'Nama_paket.required' => 'Nama paket wajib diisi.',
                'Harga_paket.required' => 'Harga paket wajib diisi.',
                'Harga_paket.numeric' => 'Harga paket harus berupa angka.',
                'produks.required' => 'Minimal satu produk harus ditambahkan.',
                'produks.min' => 'Minimal satu produk harus ditambahkan.',
                'produks.*.stok_produk_id.required' => 'Produk wajib dipilih.',
                'produks.*.stok_produk_id.exists' => 'Produk yang dipilih tidak valid atau tidak ditemukan pada data stok.',
                'produks.*.Jumlah.required' => 'Jumlah produk wajib diisi.',
                'produks.*.Jumlah.integer' => 'Jumlah produk harus berupa angka bulat.',
                'produks.*.Jumlah.min' => 'Jumlah produk minimal 1.',
            ]);

            DB::beginTransaction();

            $paket = PaketBundling::create([
                'Kode_paket' => $validated['Kode_paket'],
                'Nama_paket' => $validated['Nama_paket'],
                'Deskripsi' => $validated['Deskripsi'] ?? null,
                'Harga_paket' => $validated['Harga_paket'],
                'Harga_Distributor_paket' => $validated['Harga_Distributor_paket'] ?? null,
            ]);

            // Format data untuk sync pivot table
            $produksSync = [];
            foreach ($validated['produks'] as $produk) {
                $produksSync[$produk['stok_produk_id']] = ['Jumlah' => $produk['Jumlah']];
            }

            // Simpan relasi ke tabel pivot
            $paket->produks()->sync($produksSync);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Paket Bundling berhasil ditambahkan',
                'data' => $paket->load('produks')
            ], 201);

        } catch (ValidationException $e) {
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
    public function show(string $id)
    {
        $paket = PaketBundling::with('produks')->find($id);

        if (!$paket) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Paket Bundling tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $paket
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $paket = PaketBundling::find($id);

        if (!$paket) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Paket Bundling tidak ditemukan'
            ], 404);
        }

        try {
            $validated = $request->validate([
                'Kode_paket' => 'sometimes|required|string|max:225|unique:paket_bundlings,Kode_paket,' . $id,
                'Nama_paket' => 'sometimes|required|string|max:100',
                'Deskripsi' => 'nullable|string',
                'Harga_paket' => 'sometimes|required|numeric',
                'Harga_Distributor_paket' => 'nullable|numeric',
                'produks' => 'sometimes|required|array|min:1',
                'produks.*.stok_produk_id' => 'required_with:produks|exists:stok_produks,id',
                'produks.*.Jumlah' => 'required_with:produks|integer|min:1',
            ], [
                'Kode_paket.required' => 'Kode paket wajib diisi.',
                'Kode_paket.unique' => 'Kode paket sudah digunakan.',
                'Nama_paket.required' => 'Nama paket wajib diisi.',
                'Harga_paket.required' => 'Harga paket wajib diisi.',
                'Harga_paket.numeric' => 'Harga paket harus berupa angka.',
                'produks.required' => 'Minimal satu produk harus ditambahkan.',
                'produks.min' => 'Minimal satu produk harus ditambahkan.',
                'produks.*.stok_produk_id.required_with' => 'Produk wajib dipilih.',
                'produks.*.stok_produk_id.exists' => 'Produk yang dipilih tidak valid atau tidak ditemukan pada data stok.',
                'produks.*.Jumlah.required_with' => 'Jumlah produk wajib diisi.',
                'produks.*.Jumlah.integer' => 'Jumlah produk harus berupa angka bulat.',
                'produks.*.Jumlah.min' => 'Jumlah produk minimal 1.',
            ]);

            DB::beginTransaction();

            $paket->update([
                'Kode_paket' => $validated['Kode_paket'] ?? $paket->Kode_paket,
                'Nama_paket' => $validated['Nama_paket'] ?? $paket->Nama_paket,
                'Deskripsi' => array_key_exists('Deskripsi', $validated) ? $validated['Deskripsi'] : $paket->Deskripsi,
                'Harga_paket' => $validated['Harga_paket'] ?? $paket->Harga_paket,
                'Harga_Distributor_paket' => array_key_exists('Harga_Distributor_paket', $validated) ? $validated['Harga_Distributor_paket'] : $paket->Harga_Distributor_paket,
            ]);

            // Jika ada update pada list produk
            if (isset($validated['produks'])) {
                $produksSync = [];
                foreach ($validated['produks'] as $produk) {
                    $produksSync[$produk['stok_produk_id']] = ['Jumlah' => $produk['Jumlah']];
                }
                $paket->produks()->sync($produksSync);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Data Paket Bundling berhasil diperbarui',
                'data' => $paket->load('produks')
            ]);

        } catch (ValidationException $e) {
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
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $paket = PaketBundling::find($id);

        if (!$paket) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Paket Bundling tidak ditemukan'
            ], 404);
        }

        $paket->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Data Paket Bundling berhasil dihapus'
        ]);
    }
}
