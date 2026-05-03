<?php

namespace App\Http\Controllers;

use App\Models\StokBahanTreatment;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class StokBahanTreatmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $stokBahans = StokBahanTreatment::all();
        return response()->json([
            'status' => 'success',
            'data' => $stokBahans
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'Nama_produk' => 'required|string|max:100',
                'Kategori' => 'required|string|max:100',
                'Harga' => 'required|numeric',
                'Stok' => 'required|integer',
                'Batas_minimal_stok' => 'required|integer',
            ]);

            // AUTO GENERATE KODE PRODUK TREATMENT
            $lastBahan = StokBahanTreatment::orderBy('id', 'desc')->first();
            $lastNumber = $lastBahan ? (int) substr($lastBahan->Kode_Produk, 4) : 0;
            $newNumber = $lastNumber + 1;
            
            $validated['Kode_Produk'] = 'TRT-' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);

            $stokBahan = StokBahanTreatment::create($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Data Stok Bahan Treatment berhasil ditambahkan',
                'data' => $stokBahan
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $stokBahan = StokBahanTreatment::find($id);

        if (!$stokBahan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Stok Bahan Treatment tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $stokBahan
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $stokBahan = StokBahanTreatment::find($id);

        if (!$stokBahan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Stok Bahan Treatment tidak ditemukan'
            ], 404);
        }

        try {
            $validated = $request->validate([
                'Kode_Produk' => 'sometimes|required|string|max:225|unique:stok_bahan_treatments,Kode_Produk,' . $id,
                'Nama_produk' => 'sometimes|required|string|max:100',
                'Kategori' => 'sometimes|required|string|max:100',
                'Harga' => 'sometimes|required|numeric',
                'Stok' => 'sometimes|required|integer',
                'Batas_minimal_stok' => 'sometimes|required|integer',
            ]);

            $stokBahan->update($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Data Stok Bahan Treatment berhasil diperbarui',
                'data' => $stokBahan
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $stokBahan = StokBahanTreatment::find($id);

        if (!$stokBahan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Stok Bahan Treatment tidak ditemukan'
            ], 404);
        }

        $stokBahan->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Data Stok Bahan Treatment berhasil dihapus'
        ]);
    }

    /**
     * Get next generated Kode Produk for frontend preview
     */
    public function getNextNumber()
    {
        $lastBahan = StokBahanTreatment::orderBy('id', 'desc')->first();
        $lastNumber = $lastBahan ? (int) substr($lastBahan->Kode_Produk, 4) : 0;
        $newNumber = $lastNumber + 1;
        
        $kodeProduk = 'TRT-' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);

        return response()->json([
            'status' => 'success',
            'Kode_Produk' => $kodeProduk
        ]);
    }
}
