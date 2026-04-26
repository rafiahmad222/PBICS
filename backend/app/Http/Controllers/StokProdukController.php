<?php

namespace App\Http\Controllers;

use App\Models\StokProduk;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class StokProdukController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $stokProduks = StokProduk::all();
        return response()->json([
            'status' => 'success',
            'data' => $stokProduks
        ]);
    }
    
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'Kode_Produk' => 'required|string|max:225|unique:stok_produks,Kode_Produk',
                'Nama_produk' => 'required|string|max:100',
                'Kategori' => 'required|string|max:100',
                'Harga' => 'required|numeric',
                'Stok' => 'required|integer',
                'Batas_minimal_stok' => 'required|integer',
            ]);

            $stokProduk = StokProduk::create($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Data Stok Produk berhasil ditambahkan',
                'data' => $stokProduk
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
        $stokProduk = StokProduk::find($id);

        if (!$stokProduk) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Stok Produk tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $stokProduk
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $stokProduk = StokProduk::find($id);

        if (!$stokProduk) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Stok Produk tidak ditemukan'
            ], 404);
        }

        try {
            $validated = $request->validate([
                'Kode_Produk' => 'sometimes|required|string|max:225|unique:stok_produks,Kode_Produk,' . $id,
                'Nama_produk' => 'sometimes|required|string|max:100',
                'Kategori' => 'sometimes|required|string|max:100',
                'Harga' => 'sometimes|required|numeric',
                'Stok' => 'sometimes|required|integer',
                'Batas_minimal_stok' => 'sometimes|required|integer',
            ]);

            $stokProduk->update($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Data Stok Produk berhasil diperbarui',
                'data' => $stokProduk
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'errors' => $e->errors()
            ], 422);
        }
    }
}
