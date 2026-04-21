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
    public function index()
    {
        $karyawan = DataKaryawan::paginate(10)->through(function ($item) {

            // Inisial nama (DJ, DS, dll)
            $inisial = collect(explode(' ', $item->NamaLengkap_karyawan))
                ->take(2)
                ->map(fn($nama) => strtoupper(substr($nama, 0, 1)))
                ->implode('');

            return [
                'id' => $item->id,
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
                'Divisi' => 'required|in:Dokter,Customer Service,Perawat,Staff Gudang,Kasir,Manager,HRD,Owner,Komisaris',
                'Jabatan' => 'required|in:Lead,Anggota Staff',
                'Cabang' => 'required|in:Jember,Lumajang',
                'Email' => 'required|email|unique:data_karyawan',
                'No_Telp' => 'required|string',
                'Username' => 'required|string|unique:data_karyawan',
                'Password' => 'required|string|min:6',
            ]);

            // Hash password sebelum disimpan
            $validated['Password'] = Hash::make($validated['Password']);

            // Buat data karyawan baru (UUID otomatis generate)
            $karyawan = DataKaryawan::create($validated);

            return response()->json([
                'message' => 'Data karyawan berhasil ditambahkan',
                'data' => [
                    'id' => $karyawan->id,
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
                'NamaLengkap_karyawan' => 'required|string',
                'Nomor_Identitas' => 'required|string|unique:data_karyawan,Nomor_Identitas,' . $id,
                'Tanggal_Lahir' => 'required|date',
                'Tempat_Lahir' => 'required|string',
                'Alamat' => 'nullable|string',
                'Divisi' => 'required|in:Dokter,Customer Service,Perawat,Staff Gudang,Kasir,Manager,HRD,Owner,Komisaris',
                'Jabatan' => 'required|in:Lead,Anggota Staff',
                'Cabang' => 'required|in:Jember,Lumajang',
                'Email' => 'required|email|unique:data_karyawan,Email,' . $id,
                'No_Telp' => 'required|string',
                'Username' => 'required|string|unique:data_karyawan,Username,' . $id,
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
}
