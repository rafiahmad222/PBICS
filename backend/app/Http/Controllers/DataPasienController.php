<?php

namespace App\Http\Controllers;

use App\Models\DataPasien;
use Illuminate\Http\Request;
use App\Models\Kec;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class DataPasienController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $pasiens = DataPasien::select(
            'id',
            'Nama_pasien',
            'kode_Customer',
            'no_member',
            'no_RM',
        )->latest()->paginate(10);

        return response()->json([
            'message' => 'Data pasien berhasil diambil',
            'data' => $pasiens
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'no_member' => 'nullable|string|max:50',
                'Tipe_member' => 'required|in:Member,Non Member',
                'Nama_pasien' => 'required|string|max:255',
                'no_Identitas' => 'required|string|max:100',
                'Tempat_Lahir' => 'required|string|max:100',
                'Tanggal_Lahir' => 'required|date',
                'Jenis_Kelamin' => 'required|in:Laki-laki,Perempuan',
                'Email' => 'nullable|email',
                'no_Telp' => 'required|string|max:20',
                'Alamat' => 'nullable|string',
                'KabKota_id' => 'required|exists:KabKota,id',
                'Kec_id' => 'required|exists:Kec,id',
            ]);

            // 🔥 AUTO GENERATE KODE CUSTOMER
            $bulan = date('m');
            $tahun = date('Y');

            $lastPasien = DataPasien::whereYear('created_at', $tahun)
                ->whereMonth('created_at', $bulan)
                ->orderBy('kode_Customer', 'desc')
                ->first();

            $lastNumber = $lastPasien ? (int) substr($lastPasien->kode_Customer, -4) : 0;
            $newNumber = $lastNumber + 1;

            $kodeCustomer = $tahun . "-" . $bulan . "-" . str_pad($newNumber, 4, '0', STR_PAD_LEFT);

            $validated['kode_Customer'] = $kodeCustomer;

            // 🔥 AUTO GENERATE NO RM
            $lastPasien = DataPasien::whereYear('created_at', date('Y'))
                ->latest('created_at')
                ->first();

            if ($lastPasien) {
                $lastMiddle = (int) substr($lastPasien->no_RM, 0, 2);
                $lastRight = (int) substr($lastPasien->no_RM, 3, 2);
                $lastLast = (int) substr($lastPasien->no_RM, 6, 2);

                $counter = ($lastMiddle * 10000) + ($lastRight * 100) + $lastLast + 1;
            } else {
                $counter = 1;
            }

            $format1 = intdiv($counter, 10000) % 100;
            $format2 = intdiv($counter, 100) % 100;
            $format3 = $counter % 100;

            $noRM = str_pad($format1, 2, '0', STR_PAD_LEFT) . "-" .
                str_pad($format2, 2, '0', STR_PAD_LEFT) . "-" .
                str_pad($format3, 2, '0', STR_PAD_LEFT);

            $validated['no_RM'] = $noRM;

            $validated['Tipe_member'] = $validated['Tipe_member'] ?? 'Non Member';

            $validated['Jenis_Kelamin'] = $validated['Jenis_Kelamin'] === 'Laki-laki' ? 'L' : 'P';

            $pasien = DataPasien::create($validated);

            return response()->json([
                'message' => 'Data pasien berhasil dibuat',
                'data' => $pasien
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
        $pasien = DataPasien::find($id);

        if (!$pasien) {
            return response()->json([
                'message' => 'Data pasien tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'message' => 'Detail pasien berhasil diambil',
            'data' => $pasien
        ]);
    }
    
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $dataPasien = DataPasien::find($id);

        if (!$dataPasien) {
            return response()->json([
                'message' => 'Data pasien tidak ditemukan',
            ], 404);
        }

        try {
            $validated = $request->validate([
                'no_member' => 'nullable|string|max:50',
                'Tipe_member' => 'required|in:Member,Non Member',
                'Nama_pasien' => 'required|string|max:255',
                'no_Identitas' => 'required|string|max:100',
                'Tempat_Lahir' => 'required|string|max:100',
                'Tanggal_Lahir' => 'required|date',
                'Jenis_Kelamin' => 'required|in:Laki-laki,Perempuan',
                'Email' => 'nullable|email',
                'no_Telp' => 'required|string|max:20',
                'Alamat' => 'nullable|string',
                'KabKota_id' => 'required|exists:KabKota,id',
                'Kec_id' => 'required|exists:Kec,id',
            ]);

            $validated['Tipe_member'] = $validated['Tipe_member'] ?? $dataPasien->Tipe_member;
            $validated['Jenis_Kelamin'] = $validated['Jenis_Kelamin'] === 'Laki-laki' ? 'L' : 'P';

            $dataPasien->update($validated);

            return response()->json([
                'message' => 'Data pasien berhasil diperbarui',
                'data' => $dataPasien
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
    public function destroy(DataPasien $dataPasien)
    {
        //
    }

    public function getKecamatan($kabKotaId)
    {
        $kecamatan = Kec::where('kab_kota_id', $kabKotaId)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json($kecamatan);
    }
}
