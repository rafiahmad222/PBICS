<?php

namespace App\Http\Controllers;

use App\Models\StokBarangApotek;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class StokBarangApotekController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $stokBarangApotek = StokBarangApotek::all();
        return response()->json([
            'status' => 'success',
            'data' => $stokBarangApotek
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'Nama_barang_apotek' => 'required|string|max:100',
                'Kategori' => 'required|string|max:100',
                'Stok' => 'required|integer',
                'Batas_minimal_stok' => 'required|integer',
            ]);

            $stokBarangApotek = StokBarangApotek::create($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Data Stok Barang Apotek berhasil ditambahkan',
                'data' => $stokBarangApotek
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
        $stokBarangApotek = StokBarangApotek::find($id);

        if (!$stokBarangApotek) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Stok Barang Apotek tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $stokBarangApotek
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $stokBarangApotek = StokBarangApotek::find($id);

        if (!$stokBarangApotek) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Stok Barang Apotek tidak ditemukan'
            ], 404);
        }

        try {
            $validated = $request->validate([
                'Nama_barang_apotek' => 'sometimes|required|string|max:100',
                'Kategori' => 'sometimes|required|string|max:100',
                'Stok' => 'sometimes|required|integer',
                'Batas_minimal_stok' => 'sometimes|required|integer',
            ]);

            $stokBarangApotek->update($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Data Stok Barang Apotek berhasil diperbarui',
                'data' => $stokBarangApotek
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'errors' => $e->errors()
            ], 422);
        }
    }
}
