<?php

namespace App\Http\Controllers;

use App\Models\Treatment;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class TreatmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $treatments = Treatment::with('bahan')->get();
        return response()->json([
            'status' => 'success',
            'message' => 'Seluruh Data Treatment berhasil ditampilkan',
            'data' => $treatments
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'Nama_treatment' => 'required|string|max:100',
                'Kategori' => 'required|string|max:100',
                'Harga' => 'required|numeric',
                'bahan' => 'required|array|min:1',
                'bahan.*.bahan_id' => 'required|integer',
                'bahan.*.bahan_type' => 'required|string|in:StokProduk,StokBarangApotek,StokBahanTreatment,StokBahanMedis,StokBahanInfus',
                'bahan.*.Jumlah' => 'required|integer|min:1',
            ]);

            DB::beginTransaction();

            // AUTO GENERATE KODE TREATMENT
            $lastTreatment = Treatment::orderBy('id', 'desc')->first();
            $lastNumber = $lastTreatment ? (int) substr($lastTreatment->Kode_treatment, 4) : 0;
            $newNumber = $lastNumber + 1;
            
            $kodeTreatment = 'TRT-' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);

            $treatment = Treatment::create([
                'Kode_treatment' => $kodeTreatment,
                'Nama_treatment' => $validated['Nama_treatment'],
                'Kategori' => $validated['Kategori'],
                'Harga' => $validated['Harga'],
            ]);

            // Format data untuk tabel pivot polymorphic
            $bahanInsert = [];
            foreach ($validated['bahan'] as $item) {
                $bahanInsert[] = [
                    'bahan_id' => $item['bahan_id'],
                    'bahan_type' => 'App\\Models\\' . $item['bahan_type'],
                    'Jumlah' => $item['Jumlah'],
                ];
            }

            // Simpan relasi ke tabel treatment_bahans
            $treatment->bahan()->createMany($bahanInsert);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Data Treatment berhasil ditambahkan',
                'data' => $treatment->load('bahan')
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
    public function show($id)
    {
        $treatment = Treatment::with('bahan')->find($id);

        if (!$treatment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Treatment tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Data Treatment berhasil ditampilkan',
            'data' => $treatment
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $treatment = Treatment::find($id);

        if (!$treatment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Treatment tidak ditemukan'
            ], 404);
        }

        try {
            $validated = $request->validate([
                'Kode_treatment' => 'sometimes|required|string|max:100|unique:treatments,Kode_treatment,' . $id,
                'Nama_treatment' => 'sometimes|required|string|max:100',
                'Kategori' => 'sometimes|required|string|max:100',
                'Harga' => 'sometimes|required|numeric',
                'bahan' => 'sometimes|required|array|min:1',
                'bahan.*.bahan_id' => 'required_with:bahan|integer',
                'bahan.*.bahan_type' => 'required_with:bahan|string|in:StokProduk,StokBarangApotek,StokBahanTreatment,StokBahanMedis,StokBahanInfus',
                'bahan.*.Jumlah' => 'required_with:bahan|integer|min:1',
            ]);

            DB::beginTransaction();

            $treatment->update([
                'Kode_treatment' => $validated['Kode_treatment'] ?? $treatment->Kode_treatment,
                'Nama_treatment' => $validated['Nama_treatment'] ?? $treatment->Nama_treatment,
                'Kategori' => $validated['Kategori'] ?? $treatment->Kategori,
                'Harga' => $validated['Harga'] ?? $treatment->Harga,
            ]);

            // Jika ada update pada list bahan
            if (isset($validated['bahan'])) {
                $treatment->bahan()->delete();
                $bahanInsert = [];
                foreach ($validated['bahan'] as $item) {
                    $bahanInsert[] = [
                        'bahan_id' => $item['bahan_id'],
                        'bahan_type' => 'App\\Models\\' . $item['bahan_type'],
                        'Jumlah' => $item['Jumlah'],
                    ];
                }
                $treatment->bahan()->createMany($bahanInsert);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Data Treatment berhasil diperbarui',
                'data' => $treatment->load('bahan')
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
    public function destroy($id)
    {
        $treatment = Treatment::find($id);

        if (!$treatment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Treatment tidak ditemukan'
            ], 404);
        }

        $treatment->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Data Treatment berhasil dihapus'
        ]);
    }

    /**
     * Get next generated Kode Treatment for frontend preview
     */
    public function getNextNumber()
    {
        $lastTreatment = Treatment::orderBy('id', 'desc')->first();
        $lastNumber = $lastTreatment ? (int) substr($lastTreatment->Kode_treatment, 4) : 0;
        $newNumber = $lastNumber + 1;
        
        $kodeTreatment = 'TRT-' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);

        return response()->json([
            'status' => 'success',
            'Kode_treatment' => $kodeTreatment
        ]);
    }
}
