<?php

namespace App\Http\Controllers;

use App\Models\PaketTreatment;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class PaketTreatmentController extends Controller
{
    /**
     * Get the next sequence number for Kode_paket
     */
    public function getNextNumber()
    {
        $lastPaket = PaketTreatment::orderBy('id', 'desc')->first();
        
        if (!$lastPaket) {
            $nextNumber = 'PTR-001';
        } else {
            $lastCode = $lastPaket->Kode_paket;
            $number = (int) substr($lastCode, 4);
            $nextNumber = 'PTR-' . str_pad($number + 1, 3, '0', STR_PAD_LEFT);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'next_number' => $nextNumber
            ]
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $paket = PaketTreatment::with('treatments')->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Data Paket Treatment berhasil diambil',
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
                'Nama_paket' => 'required|string|max:100',
                'Deskripsi' => 'nullable|string',
                'Harga_paket' => 'required|numeric',
                'treatments' => 'required|array|min:1',
                'treatments.*.treatment_id' => 'required|exists:treatments,id',
                'treatments.*.Jumlah' => 'required|integer|min:1',
            ], [
                'Nama_paket.required' => 'Nama paket wajib diisi.',
                'Harga_paket.required' => 'Harga paket wajib diisi.',
                'treatments.required' => 'Minimal satu treatment harus ditambahkan.',
                'treatments.min' => 'Minimal satu treatment harus ditambahkan.',
                'treatments.*.treatment_id.required' => 'Treatment wajib dipilih.',
                'treatments.*.treatment_id.exists' => 'Treatment yang dipilih tidak valid.',
                'treatments.*.Jumlah.required' => 'Jumlah treatment wajib diisi.',
                'treatments.*.Jumlah.min' => 'Jumlah treatment minimal 1.',
            ]);

            DB::beginTransaction();

            $lastPaket = PaketTreatment::orderBy('id', 'desc')->first();
            if (!$lastPaket) {
                $kodePaket = 'PTR-001';
            } else {
                $lastCode = $lastPaket->Kode_paket;
                $number = (int) substr($lastCode, 4);
                $kodePaket = 'PTR-' . str_pad($number + 1, 3, '0', STR_PAD_LEFT);
            }

            $paket = PaketTreatment::create([
                'Kode_paket' => $kodePaket,
                'Nama_paket' => $validated['Nama_paket'],
                'Deskripsi' => $validated['Deskripsi'] ?? null,
                'Harga_paket' => $validated['Harga_paket'],
            ]);

            $treatmentsSync = [];
            foreach ($validated['treatments'] as $treatment) {
                $treatmentsSync[$treatment['treatment_id']] = ['Jumlah' => $treatment['Jumlah']];
            }

            $paket->treatments()->sync($treatmentsSync);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Paket Treatment berhasil ditambahkan',
                'data' => $paket->load('treatments')
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
        $paket = PaketTreatment::with('treatments')->find($id);

        if (!$paket) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Paket Treatment tidak ditemukan'
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
        $paket = PaketTreatment::find($id);

        if (!$paket) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Paket Treatment tidak ditemukan'
            ], 404);
        }

        try {
            $validated = $request->validate([
                'Kode_paket' => 'sometimes|required|string|max:100|unique:paket_treatments,Kode_paket,' . $id,
                'Nama_paket' => 'sometimes|required|string|max:100',
                'Deskripsi' => 'nullable|string',
                'Harga_paket' => 'sometimes|required|numeric',
                'treatments' => 'sometimes|required|array|min:1',
                'treatments.*.treatment_id' => 'required_with:treatments|exists:treatments,id',
                'treatments.*.Jumlah' => 'required_with:treatments|integer|min:1',
            ]);

            DB::beginTransaction();

            $paket->update([
                'Kode_paket' => $validated['Kode_paket'] ?? $paket->Kode_paket,
                'Nama_paket' => $validated['Nama_paket'] ?? $paket->Nama_paket,
                'Deskripsi' => array_key_exists('Deskripsi', $validated) ? $validated['Deskripsi'] : $paket->Deskripsi,
                'Harga_paket' => $validated['Harga_paket'] ?? $paket->Harga_paket,
            ]);

            if (isset($validated['treatments'])) {
                $treatmentsSync = [];
                foreach ($validated['treatments'] as $treatment) {
                    $treatmentsSync[$treatment['treatment_id']] = ['Jumlah' => $treatment['Jumlah']];
                }
                $paket->treatments()->sync($treatmentsSync);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Data Paket Treatment berhasil diperbarui',
                'data' => $paket->load('treatments')
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
        $paket = PaketTreatment::find($id);

        if (!$paket) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Paket Treatment tidak ditemukan'
            ], 404);
        }

        $paket->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Data Paket Treatment berhasil dihapus'
        ]);
    }
}
