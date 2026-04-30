<?php

namespace App\Http\Controllers;

use App\Models\DataKaryawan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class DataKaryawanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = DataKaryawan::query();

        if ($request->has('search') && $request->search != '') {
            $query->where('NamaLengkap_karyawan', 'like', '%' . $request->search . '%');
        }

        $karyawan = $query->paginate(10)->through(function ($item) {

            // Inisial nama (DJ, DS, dll)
            $inisial = collect(explode(' ', $item->NamaLengkap_karyawan))
                ->take(2)
                ->map(fn($nama) => strtoupper(substr($nama, 0, 1)))
                ->implode('');

            return [
                'id' => $item->id,
                'kode_karyawan' => $item->kode_karyawan,
                'nama_lengkap' => $item->NamaLengkap_karyawan,
                'inisial' => $inisial,
                'email' => $item->Email,
                'no_telp' => $item->No_Telp,
                'jabatan' => strtoupper($item->Jabatan . ' - ' . $item->Divisi),
                'cabang' => $item->Cabang,
            ];
        });

        return response()->json([
            'message' => 'Data karyawan berhasil diambil',
            'data' => $karyawan
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Validasi input
            $validated = $request->validate([
                'NamaLengkap_karyawan' => 'required|string',
                'Nomor_Identitas' => 'required|string|unique:data_karyawan',
                'Tempat_Lahir' => 'required|string',
                'Tanggal_Lahir' => 'required|date',
                'Alamat' => 'nullable|string',
                'Divisi' => 'required|in:Super Admin,Owner,Dokter,Customer Service,HRD,Supervisor Treatment,Supervisor Produk,Gudang Umum,Staff OB,Staff Satpam,Apoteker,Asisten Apoteker,Asisten Supervisor Treatment',
                'Jabatan' => 'required|in:Lead,Anggota Staff',
                'Cabang' => 'required|in:Jember,Lumajang',
                'Email' => 'required|email|unique:data_karyawan',
                'No_Telp' => 'required|string',
                'Username' => 'required|string|unique:data_karyawan',
                'Password' => 'required|string|min:6',
                'Tanggal_bergabung' => 'nullable|date',
            ]);

            // Generate kode_karyawan
            $divisi = $validated['Divisi'];
            $jabatan = $validated['Jabatan'];

            if ($divisi === 'Owner') {
                $prefix = 'OWN';
            } elseif ($divisi === 'Super Admin') {
                $prefix = 'SAD';
            } elseif ($jabatan === 'Lead') {
                $prefix = 'LD';
            } else {
                $prefix = 'STF';
            }

            $lastKaryawan = DataKaryawan::where('kode_karyawan', 'like', $prefix . '-%')
                ->orderBy('kode_karyawan', 'desc')
                ->first();

            if ($lastKaryawan) {
                $lastNumber = (int) substr($lastKaryawan->kode_karyawan, 4);
                $newNumber = $lastNumber + 1;
            } else {
                $newNumber = 1;
            }

            $validated['kode_karyawan'] = $prefix . '-' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);

            // Hash password sebelum disimpan
            $validated['Password'] = Hash::make($validated['Password']);

            $validated['Tanggal_bergabung'] = $validated['Tanggal_bergabung'] ?? date('Y-m-d');

            // Buat data karyawan baru (UUID otomatis generate)
            $karyawan = DataKaryawan::create($validated);

            return response()->json([
                'message' => 'Data karyawan berhasil ditambahkan',
                'data' => [
                    'id' => $karyawan->id,
                    'kode_karyawan' => $karyawan->kode_karyawan,
                    'nama_lengkap' => $karyawan->NamaLengkap_karyawan,
                    'email' => $karyawan->Email,
                ]
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
        $karyawan = DataKaryawan::find($id);

        if (!$karyawan) {
            return response()->json([
                'message' => 'Data karyawan tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'message' => 'Detail karyawan berhasil diambil',
            'data' => $karyawan
        ]);
    }
    
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $karyawan = DataKaryawan::find($id);

        if (!$karyawan) {
            return response()->json([
                'message' => 'Data karyawan tidak ditemukan',
            ], 404);
        }

        try {
            // Validasi input
            $validated = $request->validate([
                'NamaLengkap_karyawan' => 'sometimes|required|string',
                'Nomor_Identitas' => 'sometimes|required|string|unique:data_karyawan,Nomor_Identitas,' . $id,
                'Tanggal_Lahir' => 'sometimes|required|date',
                'Tempat_Lahir' => 'sometimes|required|string',
                'Alamat' => 'sometimes|nullable|string',
                'Divisi' => 'sometimes|required|in:Super Admin,Owner,Dokter,Customer Service,HRD,Supervisor Treatment,Supervisor Produk,Gudang Umum,Staff OB,Staff Satpam,Apoteker,Asisten Apoteker,Asisten Supervisor Treatment',
                'Jabatan' => 'sometimes|required|in:Lead,Anggota Staff',
                'Cabang' => 'sometimes|required|in:Jember,Lumajang',
                'Email' => 'sometimes|required|email|unique:data_karyawan,Email,' . $id,
                'No_Telp' => 'sometimes|required|string',
                'Username' => 'sometimes|required|string|unique:data_karyawan,Username,' . $id,
                'Tanggal_bergabung' => 'sometimes|nullable|date',
            ]);

            // Update data karyawan
            $karyawan->update($validated);

            return response()->json([
                'message' => 'Data karyawan berhasil diupdate',
                'data' => $karyawan
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function updatePassword(Request $request, $id)
    {
        $karyawan = DataKaryawan::find($id);

        if (!$karyawan) {
            return response()->json([
                'message' => 'Data karyawan tidak ditemukan',
            ], 404);
        }

        try {
            $validated = $request->validate([
                'Password' => 'required|string|min:6',
            ]);

            // update hanya password
            $karyawan->Password = Hash::make($validated['Password']);
            $karyawan->save();

            return response()->json([
                'message' => 'Password karyawan berhasil diupdate',
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
    public function destroy($id)
    {
        $karyawan = DataKaryawan::find($id);

        if (!$karyawan) {
            return response()->json([
                'message' => 'Data karyawan tidak ditemukan',
            ], 404);
        }

        $karyawan->delete();

        return response()->json([
            'message' => 'Data karyawan berhasil dihapus',
        ]);
    }
}
