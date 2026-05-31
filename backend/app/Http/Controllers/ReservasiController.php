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
        $reservasis = Reservasi::with(['pasien', 'karyawan', 'treatment', 'paketTreatment', 'treatments', 'paketTreatments', 'rekamMedis'])->latest()->get();
        return response()->json($reservasis);
    }

    /**
     * Store a newly created resource in storage.
     */ 
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            // Reservasi core
            'Tanggal_reservasi' => 'required|date',
            'Jam_reservasi' => 'required|date_format:H:i',
            'pasien_id' => 'nullable|exists:data_pasiens,id',
            'Nama_pasien' => 'required_without:pasien_id|string|max:255',
            'No_Telp' => 'required|string|max:50',
            'karyawan_id' => 'required|exists:data_karyawan,id',
            'treatment_id' => 'nullable|exists:treatments,id',
            'paket_treatment_id' => 'nullable|exists:paket_treatments,id',
            'Keterangan' => 'nullable|string|max:255',

            // Multi treatments & packages
            'treatment_ids' => 'nullable|array',
            'treatment_ids.*' => 'exists:treatments,id',
            'paket_treatment_ids' => 'nullable|array',
            'paket_treatment_ids.*' => 'exists:paket_treatments,id',

            // Patient creation flag & fields
            'register_pasien' => 'nullable|boolean',
            'no_member' => 'nullable|string|max:50',
            'Tipe_Member' => 'nullable|in:Member,Non Member',
            'no_Identitas' => 'required_if:register_pasien,true|nullable|string|max:100',
            'Tempat_Lahir' => 'required_if:register_pasien,true|nullable|string|max:100',
            'Tanggal_Lahir' => 'required_if:register_pasien,true|nullable|date',
            'Jenis_Kelamin' => 'required_if:register_pasien,true|nullable|in:Laki-laki,Perempuan',
            'Email' => 'nullable|email',
            'Alamat' => 'nullable|string',
            'KabKota_id' => 'required_if:register_pasien,true|nullable|exists:KabKota,id',
            'Kec_id' => 'required_if:register_pasien,true|nullable|exists:Kec,id',
        ]);

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $pasienId = $validatedData['pasien_id'] ?? null;
            $namaPasien = $validatedData['Nama_pasien'] ?? null;

            // 1. Check if we need to register patient
            if ($request->input('register_pasien') == true) {
                // Generate Kode Customer
                $bulan = date('m');
                $tahun = date('Y');
                $lastPasienKode = \App\Models\DataPasien::whereYear('created_at', $tahun)
                    ->whereMonth('created_at', $bulan)
                    ->orderBy('kode_Customer', 'desc')
                    ->first();
                $lastNumber = $lastPasienKode ? (int) substr($lastPasienKode->kode_Customer, -4) : 0;
                $newNumber = $lastNumber + 1;
                $kodeCustomer = $tahun . "-" . $bulan . "-" . str_pad($newNumber, 4, '0', STR_PAD_LEFT);

                // Generate No RM
                $lastPasienRm = \App\Models\DataPasien::whereYear('created_at', date('Y'))
                    ->latest('created_at')
                    ->first();
                if ($lastPasienRm) {
                    $lastMiddle = (int) substr($lastPasienRm->no_RM, 0, 2);
                    $lastRight = (int) substr($lastPasienRm->no_RM, 3, 2);
                    $lastLast = (int) substr($lastPasienRm->no_RM, 6, 2);
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

                $tipeMember = 'Non Member';
                if (!empty($validatedData['no_member'])) {
                    $tipeMember = 'Member';
                } elseif (!empty($validatedData['Tipe_Member'])) {
                    $tipeMember = $validatedData['Tipe_Member'];
                }

                $jenisKelamin = $validatedData['Jenis_Kelamin'] === 'Laki-laki' ? 'L' : 'P';

                $pasien = \App\Models\DataPasien::create([
                    'Nama_pasien' => $namaPasien,
                    'no_Telp' => $validatedData['No_Telp'],
                    'kode_Customer' => $kodeCustomer,
                    'no_RM' => $noRM,
                    'no_member' => $validatedData['no_member'] ?? null,
                    'Tipe_Member' => $tipeMember,
                    'no_Identitas' => $validatedData['no_Identitas'],
                    'Tempat_Lahir' => $validatedData['Tempat_Lahir'],
                    'Tanggal_Lahir' => $validatedData['Tanggal_Lahir'],
                    'Jenis_Kelamin' => $jenisKelamin,
                    'Email' => $validatedData['Email'] ?? null,
                    'Alamat' => $validatedData['Alamat'] ?? null,
                    'KabKota_id' => $validatedData['KabKota_id'],
                    'Kec_id' => $validatedData['Kec_id'],
                ]);

                $pasienId = $pasien->id;
                $namaPasien = $pasien->Nama_pasien;
            }

            // 2. Create Rekam Medis (only if we have a registered patient)
            $rekamMedisId = null;
            if ($pasienId) {
                $rekamMedis = \App\Models\RekamMedis::create([
                    'data_pasien_id' => $pasienId,
                    'tanggal_kunjungan' => $validatedData['Tanggal_reservasi'],
                    'tekanan_darah' => null,
                    'keluhan_pasien' => $validatedData['Keterangan'] ?? null,
                    'riwayat_penyakit' => null,
                    'perawatan_diklinik_sebelumnya' => null,
                    'diagnosa' => null,
                    'catatan_tindakan' => null,
                    'racikan' => null,
                ]);

                $rekamMedisId = $rekamMedis->id;

                // Sync treatments to rekam medis pivot if treatment_ids are provided
                if (!empty($validatedData['treatment_ids'])) {
                    $rekamMedis->treatments()->sync($validatedData['treatment_ids']);
                }
            }

            // 3. Create Reservasi
            $reservasiData = [
                'Tanggal_reservasi' => $validatedData['Tanggal_reservasi'],
                'Jam_reservasi' => $validatedData['Jam_reservasi'],
                'pasien_id' => $pasienId,
                'rekam_medis_id' => $rekamMedisId,
                'Nama_pasien' => $namaPasien,
                'No_Telp' => $validatedData['No_Telp'],
                'karyawan_id' => $validatedData['karyawan_id'],
                'treatment_id' => $validatedData['treatment_id'] ?? ($validatedData['treatment_ids'][0] ?? null),
                'paket_treatment_id' => $validatedData['paket_treatment_id'] ?? ($validatedData['paket_treatment_ids'][0] ?? null),
                'Keterangan' => $validatedData['Keterangan'],
            ];

            $reservasi = Reservasi::create($reservasiData);

            // Sync many-to-many treatments & packages to reservasi pivot
            if (!empty($validatedData['treatment_ids'])) {
                $reservasi->treatments()->sync($validatedData['treatment_ids']);
            }
            if (!empty($validatedData['paket_treatment_ids'])) {
                $reservasi->paketTreatments()->sync($validatedData['paket_treatment_ids']);
            }

            \Illuminate\Support\Facades\DB::commit();

            return response()->json([
                'message' => 'Reservasi berhasil dibuat',
                'data' => $reservasi->load(['pasien', 'karyawan', 'treatment', 'paketTreatment', 'treatments', 'paketTreatments', 'rekamMedis'])
            ], 201);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json([
                'message' => 'Terjadi kesalahan saat membuat reservasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $reservasi = Reservasi::with(['pasien', 'karyawan', 'treatment', 'paketTreatment', 'treatments', 'paketTreatments', 'rekamMedis'])->find($id);

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

            // Multi-treatments & packages
            'treatment_ids' => 'nullable|array',
            'treatment_ids.*' => 'exists:treatments,id',
            'paket_treatment_ids' => 'nullable|array',
            'paket_treatment_ids.*' => 'exists:paket_treatments,id',
        ]);

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            // Update patient id if changed
            $oldPasienId = $reservasi->pasien_id;
            $newPasienId = array_key_exists('pasien_id', $validatedData) ? $validatedData['pasien_id'] : $oldPasienId;

            // Handle fallback for treatment_id / paket_treatment_id if many-to-many arrays are not passed but single values are
            if ($request->has('treatment_id') && !$request->has('treatment_ids')) {
                $validatedData['treatment_ids'] = $validatedData['treatment_id'] ? [$validatedData['treatment_id']] : [];
            }
            if ($request->has('paket_treatment_id') && !$request->has('paket_treatment_ids')) {
                $validatedData['paket_treatment_ids'] = $validatedData['paket_treatment_id'] ? [$validatedData['paket_treatment_id']] : [];
            }

            // Sync single column treatment_id/paket_treatment_id fallback
            if (!empty($validatedData['treatment_ids'])) {
                $validatedData['treatment_id'] = $validatedData['treatment_ids'][0];
            }
            if (!empty($validatedData['paket_treatment_ids'])) {
                $validatedData['paket_treatment_id'] = $validatedData['paket_treatment_ids'][0];
            }

            $reservasi->update($validatedData);

            // Sync many-to-many treatments & packages for Reservasi
            if ($request->has('treatment_ids')) {
                $reservasi->treatments()->sync($validatedData['treatment_ids']);
            }
            if ($request->has('paket_treatment_ids')) {
                $reservasi->paketTreatments()->sync($validatedData['paket_treatment_ids']);
            }

            // Sync linked Rekam Medis
            $rekamMedis = $reservasi->rekamMedis;
            if ($newPasienId) {
                if (!$rekamMedis) {
                    // Create new Rekam Medis if it didn't exist before
                    $rekamMedis = \App\Models\RekamMedis::create([
                        'data_pasien_id' => $newPasienId,
                        'tanggal_kunjungan' => $validatedData['Tanggal_reservasi'] ?? $reservasi->Tanggal_reservasi,
                        'tekanan_darah' => null,
                        'keluhan_pasien' => $validatedData['Keterangan'] ?? $reservasi->Keterangan,
                    ]);
                    $reservasi->update(['rekam_medis_id' => $rekamMedis->id]);
                } else {
                    // Update existing rekam medis
                    $rekamMedisData = [];
                    if (array_key_exists('pasien_id', $validatedData)) {
                        $rekamMedisData['data_pasien_id'] = $newPasienId;
                    }
                    if (array_key_exists('Tanggal_reservasi', $validatedData)) {
                        $rekamMedisData['tanggal_kunjungan'] = $validatedData['Tanggal_reservasi'];
                    }
                    if (array_key_exists('Keterangan', $validatedData)) {
                        $rekamMedisData['keluhan_pasien'] = $validatedData['Keterangan'];
                    }
                    
                    if (!empty($rekamMedisData)) {
                        $rekamMedis->update($rekamMedisData);
                    }
                }

                // Sync treatments to rekam medis
                if ($request->has('treatment_ids')) {
                    $rekamMedis->treatments()->sync($validatedData['treatment_ids'] ?? []);
                }
            } else {
                // If patient_id is null (e.g. changed back to non-registered), delete linked Rekam Medis
                if ($rekamMedis) {
                    $reservasi->update(['rekam_medis_id' => null]);
                    $rekamMedis->delete();
                }
            }

            \Illuminate\Support\Facades\DB::commit();

            return response()->json([
                'message' => 'Reservasi berhasil diupdate',
                'data' => $reservasi->load(['pasien', 'karyawan', 'treatment', 'paketTreatment', 'treatments', 'paketTreatments', 'rekamMedis'])
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengupdate reservasi',
                'error' => $e->getMessage()
            ], 500);
        }
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

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $rekamMedis = $reservasi->rekamMedis;
            $reservasi->delete();
            if ($rekamMedis) {
                $rekamMedis->delete();
            }
            \Illuminate\Support\Facades\DB::commit();
            
            return response()->json([
                'message' => 'Reservasi berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json([
                'message' => 'Terjadi kesalahan saat menghapus reservasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
