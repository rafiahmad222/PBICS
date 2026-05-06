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
            'message' => 'Seluruh Data Stok Produk berhasil ditampilkan',
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
                'Nama_produk' => 'required|string|max:100',
                'Kategori' => 'required|string|max:100',
                'Stok' => 'required|integer',
                'Batas_minimal_stok' => 'required|integer',
            ]);

            // AUTO GENERATE KODE PRODUK
            $lastProduk = StokProduk::orderBy('id', 'desc')->first();
            $lastNumber = $lastProduk ? (int) substr($lastProduk->Kode_Produk, 4) : 0;
            $newNumber = $lastNumber + 1;
            
            $validated['Kode_Produk'] = 'PRD-' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);

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
            'message' => 'Data Stok Produk berhasil ditampilkan',
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
                'Harga_Distributor' => 'sometimes|required|numeric',
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

    /**
     * Get next generated Kode Produk for frontend preview
     */
    public function getNextNumber()
    {
        $lastProduk = StokProduk::orderBy('id', 'desc')->first();
        $lastNumber = $lastProduk ? (int) substr($lastProduk->Kode_Produk, 4) : 0;
        $newNumber = $lastNumber + 1;
        
        $kodeProduk = 'PRD-' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);

        return response()->json([
            'status' => 'success',
            'Kode_Produk' => $kodeProduk
        ]);
    }
}
