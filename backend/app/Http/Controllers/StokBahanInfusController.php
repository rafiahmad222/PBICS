<?php

namespace App\Http\Controllers;

use App\Models\StokBahanInfus;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class StokBahanInfusController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $stokBahanInfus = StokBahanInfus::all();
        return response()->json([
            'status' => 'success',
            'data' => $stokBahanInfus
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'Nama_bahan_Infus' => 'required|string|max:100',
                'Kategori' => 'required|string|max:100',
                'Stok' => 'required|integer',
                'Batas_minimal_stok_bahan_infus' => 'required|integer',
            ]);

            $stokBahanInfus = StokBahanInfus::create($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Data Stok Bahan Infus berhasil ditambahkan',
                'data' => $stokBahanInfus
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
        $stokBahanInfus = StokBahanInfus::find($id);

        if (!$stokBahanInfus) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Stok Bahan Infus tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $stokBahanInfus
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $stokBahanInfus = StokBahanInfus::find($id);

        if (!$stokBahanInfus) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Stok Bahan Infus tidak ditemukan'
            ], 404);
        }

        try {
            $validated = $request->validate([
                'Nama_bahan_Infus' => 'sometimes|required|string|max:100',
                'Kategori' => 'sometimes|required|string|max:100',
                'Stok' => 'sometimes|required|integer',
                'Batas_minimal_stok_bahan_infus' => 'sometimes|required|integer',
            ]);

            $stokBahanInfus->update($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Data Stok Bahan Infus berhasil diperbarui',
                'data' => $stokBahanInfus
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
        $stokBahanInfus = StokBahanInfus::find($id);

        if (!$stokBahanInfus) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Stok Bahan Infus tidak ditemukan'
            ], 404);
        }

        $stokBahanInfus->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Data Stok Bahan Infus berhasil dihapus'
        ]);
    }
}
