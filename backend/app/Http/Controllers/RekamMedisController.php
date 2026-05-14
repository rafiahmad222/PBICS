<?php

namespace App\Http\Controllers;

use App\Models\RekamMedis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class RekamMedisController extends Controller
{
    public function index()
    {
        $data = RekamMedis::with(['pasien', 'dokter', 'treatments', 'reseps'])->get();
        return response()->json($data, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'data_pasien_id' => 'required|exists:data_pasiens,id',
            'tanggal_kunjungan' => 'required|date',
            'dokter_id' => 'nullable|exists:data_karyawan,id',
            'tekanan_darah' => 'required|string|max:100',
            'riwayat_penyakit' => 'nullable|string|max:255',
            'keluhan_pasien' => 'required|string|max:300',
            'perawatan_diklinik_sebelumnya' => 'nullable|string|max:255',
            'diagnosa' => 'nullable|string|max:255',
            'catatan_tindakan' => 'nullable|string|max:500',
            'racikan' => 'nullable|string|max:255',
            'gambar_sebelum' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'gambar_sesudah' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            
            'treatments' => 'nullable|array',
            'treatments.*' => 'exists:treatments,id',

            'reseps' => 'nullable|array',
            'reseps.*.stok_produk_id' => 'required|exists:stok_produks,id',
            'reseps.*.jumlah' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $data = $request->except(['gambar_sebelum', 'gambar_sesudah', 'treatments', 'reseps']);

            if ($request->hasFile('gambar_sebelum')) {
                $data['gambar_sebelum'] = $request->file('gambar_sebelum')->store('rekam_medis', 'public');
            }

            if ($request->hasFile('gambar_sesudah')) {
                $data['gambar_sesudah'] = $request->file('gambar_sesudah')->store('rekam_medis', 'public');
            }

            $rekamMedis = RekamMedis::create($data);

            if ($request->has('treatments')) {
                $rekamMedis->treatments()->sync($request->treatments);
            }

            if ($request->has('reseps')) {
                $resepsData = [];
                foreach ($request->reseps as $resep) {
                    $resepsData[$resep['stok_produk_id']] = [
                        'jumlah' => $resep['jumlah'],
                    ];
                }
                $rekamMedis->reseps()->sync($resepsData);
            }

            DB::commit();

            return response()->json([
                'message' => 'Rekam Medis berhasil ditambahkan',
                'data' => $rekamMedis->load(['pasien', 'dokter', 'treatments', 'reseps'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $rekamMedis = RekamMedis::with(['pasien', 'dokter', 'treatments', 'reseps'])->find($id);
        if (!$rekamMedis) {
            return response()->json(['message' => 'Rekam Medis tidak ditemukan'], 404);
        }
        return response()->json($rekamMedis, 200);
    }

    public function update(Request $request, $id)
    {
        $rekamMedis = RekamMedis::find($id);
        if (!$rekamMedis) {
            return response()->json(['message' => 'Rekam Medis tidak ditemukan'], 404);
        }

        $request->validate([
            'data_pasien_id' => 'required|exists:data_pasiens,id',
            'tanggal_kunjungan' => 'required|date',
            'dokter_id' => 'nullable|exists:data_karyawan,id',
            'tekanan_darah' => 'required|string|max:100',
            'riwayat_penyakit' => 'nullable|string|max:255',
            'keluhan_pasien' => 'required|string|max:300',
            'perawatan_diklinik_sebelumnya' => 'nullable|string|max:255',
            'diagnosa' => 'nullable|string|max:255',
            'catatan_tindakan' => 'nullable|string|max:500',
            'racikan' => 'nullable|string|max:255',
            'gambar_sebelum' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'gambar_sesudah' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            
            'treatments' => 'nullable|array',
            'treatments.*' => 'exists:treatments,id',

            'reseps' => 'nullable|array',
            'reseps.*.stok_produk_id' => 'required|exists:stok_produks,id',
            'reseps.*.jumlah' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $data = $request->except(['gambar_sebelum', 'gambar_sesudah', 'treatments', 'reseps']);

            if ($request->hasFile('gambar_sebelum')) {
                if ($rekamMedis->gambar_sebelum) {
                    Storage::disk('public')->delete($rekamMedis->gambar_sebelum);
                }
                $data['gambar_sebelum'] = $request->file('gambar_sebelum')->store('rekam_medis', 'public');
            }

            if ($request->hasFile('gambar_sesudah')) {
                if ($rekamMedis->gambar_sesudah) {
                    Storage::disk('public')->delete($rekamMedis->gambar_sesudah);
                }
                $data['gambar_sesudah'] = $request->file('gambar_sesudah')->store('rekam_medis', 'public');
            }

            $rekamMedis->update($data);

            if ($request->has('treatments')) {
                $rekamMedis->treatments()->sync($request->treatments);
            }

            if ($request->has('reseps')) {
                $resepsData = [];
                foreach ($request->reseps as $resep) {
                    $resepsData[$resep['stok_produk_id']] = [
                        'jumlah' => $resep['jumlah'],
                    ];
                }
                $rekamMedis->reseps()->sync($resepsData);
            }

            DB::commit();

            return response()->json([
                'message' => 'Rekam Medis berhasil diupdate',
                'data' => $rekamMedis->load(['pasien', 'dokter', 'treatments', 'reseps'])
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan', 'error' => $e->getMessage()], 500);
        }
    }
}
