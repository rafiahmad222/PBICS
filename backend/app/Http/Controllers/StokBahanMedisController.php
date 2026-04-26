<?php

namespace App\Http\Controllers;

use App\Models\StokBahanMedis;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class StokBahanMedisController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $stokBahanMedis = StokBahanMedis::all();
        return response()->json([
            'status' => 'success',
            'data' => $stokBahanMedis
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'Nama_bahan_medis' => 'required|string|max:100',
                'Kategori' => 'required|string|max:100',
                'Stok' => 'required|integer',
                'Batas_minimal_stok' => 'required|integer',
            ]);

            $stokBahanMedis = StokBahanMedis::create($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Data Stok Bahan Medis berhasil ditambahkan',
                'data' => $stokBahanMedis
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
        $stokBahanMedis = StokBahanMedis::find($id);

        if (!$stokBahanMedis) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Stok Bahan Medis tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $stokBahanMedis
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $stokBahanMedis = StokBahanMedis::find($id);

        if (!$stokBahanMedis) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Stok Bahan Medis tidak ditemukan'
            ], 404);
        }

        try {
            $validated = $request->validate([
                'Nama_bahan_medis' => 'sometimes|required|string|max:100',
                'Kategori' => 'sometimes|required|string|max:100',
                'Stok' => 'sometimes|required|integer',
                'Batas_minimal_stok' => 'sometimes|required|integer',
            ]);

            $stokBahanMedis->update($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Data Stok Bahan Medis berhasil diperbarui',
                'data' => $stokBahanMedis
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'errors' => $e->errors()
            ], 422);
        }
    }
}
