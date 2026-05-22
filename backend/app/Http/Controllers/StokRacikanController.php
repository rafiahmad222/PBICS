<?php

namespace App\Http\Controllers;

use App\Models\StokRacikan;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class StokRacikanController extends Controller
{
    /**
     * Display a listing of all stok racikan.
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => StokRacikan::all(),
        ]);
    }

    /**
     * Store a newly created stok racikan in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_obat_racik' => 'required|string|max:100',
            'deskripsi_racikan' => 'required|string|max:255',
            'harga' => 'required|numeric|min:0',
        ]);

        $stokRacikan = StokRacikan::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Stok racikan berhasil dibuat',
            'data' => $stokRacikan,
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified stok racikan.
     */
    public function show(StokRacikan $stokRacikan)
    {
        return response()->json([
            'success' => true,
            'data' => $stokRacikan,
        ]);
    }

    /**
     * Update the specified stok racikan in storage.
     */
    public function update(Request $request, StokRacikan $stokRacikan)
    {
        $validated = $request->validate([
            'nama_obat_racik' => 'sometimes|required|string|max:100',
            'deskripsi_racikan' => 'sometimes|required|string|max:255',
            'harga' => 'sometimes|required|numeric|min:0',
        ]);

        $stokRacikan->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Stok racikan berhasil diperbarui',
            'data' => $stokRacikan,
        ]);
    }

    /**
     * Remove the specified stok racikan from storage.
     */
    public function destroy(StokRacikan $stokRacikan)
    {
        $stokRacikan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Stok racikan berhasil dihapus',
        ]);
    }
}
