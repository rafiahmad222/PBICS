<?php

namespace App\Http\Controllers;

use App\Models\AntreanRacikan;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AntreanRacikanController extends Controller
{
    /**
     * Display a listing of the queue.
     */
    public function index(Request $request)
    {
        $query = AntreanRacikan::query();

        // Support query filter status (e.g. /api/antrean-racikan?status=Pending)
        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        // Sort by newest first (created_at DESC)
        $data = $query->orderBy('created_at', 'DESC')->get();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Store a newly created prescription queue in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'data_pasiens_id' => 'required|uuid',
            'nama_pasien' => 'required|string|max:150',
            'nama_dokter' => 'nullable|string|max:150',
            'racikan_text' => 'required|string',
            'status' => 'sometimes|required|in:Pending,Selesai',
        ]);

        $antreanRacikan = AntreanRacikan::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Antrean racikan berhasil ditambahkan',
            'data' => $antreanRacikan,
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified prescription.
     */
    public function show(AntreanRacikan $antreanRacikan)
    {
        return response()->json([
            'success' => true,
            'data' => $antreanRacikan,
        ]);
    }

    /**
     * Update the specified prescription in storage.
     */
    public function update(Request $request, AntreanRacikan $antreanRacikan)
    {
        $validated = $request->validate([
            'data_pasiens_id' => 'sometimes|required|uuid',
            'nama_pasien' => 'sometimes|required|string|max:150',
            'nama_dokter' => 'nullable|string|max:150',
            'racikan_text' => 'sometimes|required|string',
            'status' => 'sometimes|required|in:Pending,Selesai',
        ]);

        $antreanRacikan->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Antrean racikan berhasil diperbarui',
            'data' => $antreanRacikan,
        ]);
    }

    /**
     * Remove the specified prescription from storage.
     */
    public function destroy(AntreanRacikan $antreanRacikan)
    {
        $antreanRacikan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Antrean racikan berhasil dihapus',
        ]);
    }
}
