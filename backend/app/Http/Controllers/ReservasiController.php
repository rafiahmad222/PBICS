<?php

namespace App\Http\Controllers;

use App\Models\Reservasi;
use Illuminate\Http\Request;

class ReservasiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $reservasis = Reservasi::with(['pasien', 'karyawan', 'treatment', 'paketTreatment'])->latest()->get();
        return response()->json($reservasis);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'Tanggal_reservasi' => 'required|date',
            'Jam_reservasi' => 'required|date_format:H:i',
            'pasien_id' => 'nullable|exists:data_pasiens,id',
            'Nama_pasien' => 'required_without:pasien_id|string|max:255',
            'No_Telp' => 'required|string|max:50',
            'karyawan_id' => 'required|exists:data_karyawan,id',
            'treatment_id' => 'nullable|exists:treatments,id',
            'paket_treatment_id' => 'nullable|exists:paket_treatments,id',
            'Keterangan' => 'nullable|string|max:255',
        ]);

        if (empty($validatedData['treatment_id']) && empty($validatedData['paket_treatment_id'])) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => [
                    'treatment' => ['Pilih salah satu antara treatment atau paket treatment.']
                ]
            ], 422);
        }

        $reservasi = Reservasi::create($validatedData);

        return response()->json([
            'message' => 'Reservasi berhasil dibuat',
            'data' => $reservasi->load(['pasien', 'karyawan', 'treatment', 'paketTreatment'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $reservasi = Reservasi::with(['pasien', 'karyawan', 'treatment', 'paketTreatment'])->find($id);

        if (!$reservasi) {
            return response()->json(['message' => 'Reservasi tidak ditemukan'], 404);
        }

        return response()->json($reservasi);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $reservasi = Reservasi::find($id);

        if (!$reservasi) {
            return response()->json(['message' => 'Reservasi tidak ditemukan'], 404);
        }

        $validatedData = $request->validate([
            'Tanggal_reservasi' => 'sometimes|required|date',
            'Jam_reservasi' => 'sometimes|required|date_format:H:i',
            'pasien_id' => 'nullable|exists:data_pasiens,id',
            'Nama_pasien' => 'sometimes|required_without:pasien_id|string|max:255',
            'No_Telp' => 'sometimes|required|string|max:50',
            'karyawan_id' => 'sometimes|required|exists:data_karyawan,id',
            'treatment_id' => 'nullable|exists:treatments,id',
            'paket_treatment_id' => 'nullable|exists:paket_treatments,id',
            'Keterangan' => 'nullable|string|max:255',
        ]);

        if (array_key_exists('treatment_id', $validatedData) || array_key_exists('paket_treatment_id', $validatedData)) {
            $t_id = $validatedData['treatment_id'] ?? $reservasi->treatment_id;
            $pt_id = $validatedData['paket_treatment_id'] ?? $reservasi->paket_treatment_id;
            if (empty($t_id) && empty($pt_id)) {
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => [
                        'treatment' => ['Pilih salah satu antara treatment atau paket treatment.']
                    ]
                ], 422);
            }
        }

        $reservasi->update($validatedData);

        return response()->json([
            'message' => 'Reservasi berhasil diupdate',
            'data' => $reservasi->load(['pasien', 'karyawan', 'treatment', 'paketTreatment'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $reservasi = Reservasi::find($id);

        if (!$reservasi) {
            return response()->json(['message' => 'Reservasi tidak ditemukan'], 404);
        }

        $reservasi->delete();

        return response()->json([
            'message' => 'Reservasi berhasil dihapus'
        ]);
    }
}
