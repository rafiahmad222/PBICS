<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Distributor;
use Illuminate\Support\Facades\Validator;

class DistributorController extends Controller
{
    public function index(Request $request)
    {
        $query = Distributor::query();

        $distributors = $query->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'Nama_Distributor' => $item->nama_distributor,
                'Tanggal_Lahir' => $item->tanggal_lahir,
                'Alamat' => $item->alamat,
                'No_Telp' => $item->no_telp,
                'Email' => $item->email,
                'Sisa_Deposit' => $item->sisa_deposit,
            ];
        });

        return response()->json([
            'message' => 'Data distributor berhasil diambil.',
            'data' => $distributors
        ], 200);
    }

    public function show($id)
    {
        $distributor = Distributor::find($id);

        if (!$distributor) {
            return response()->json([
                'message' => 'Data distributor tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'message' => 'Detail data distributor berhasil diambil.',
            'data' => [
                'id' => $distributor->id,
                'Nama_Distributor' => $distributor->nama_distributor,
                'Tanggal_Lahir' => $distributor->tanggal_lahir,
                'Alamat' => $distributor->alamat,
                'No_Telp' => $distributor->no_telp,
                'Email' => $distributor->email,
                'Distributor' => $distributor->distributor,
                'Sisa_Deposit' => $distributor->sisa_deposit,
            ]
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_distributor' => 'required|string|max:255',
            'tanggal_lahir' => 'required|date',
            'alamat' => 'required|string|max:255',
            'no_telp' => 'required|numeric|digits_between:10,13',
            'email' => 'required|string|email|max:255',
            'distributor' => 'required|string|max:20',
            'deposit_masuk' => 'required|numeric',
        ], [
            'required' => 'Data wajib diisi',
            'no_telp.numeric' => 'Nomor telepon hanya boleh berisi angka',
            'no_telp.digits_between' => 'Nomor telepon harus terdiri dari 10-13 karakter',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $distributor = Distributor::create([
            'nama_distributor' => $request->nama_distributor,
            'tanggal_lahir' => $request->tanggal_lahir,
            'alamat' => $request->alamat,
            'no_telp' => $request->no_telp,
            'email' => $request->email,
            'distributor' => $request->distributor,
            'deposit_masuk' => $request->deposit_masuk,
            'sisa_deposit' => $request->deposit_masuk, // Initial deposit sets the balance
        ]);

        return response()->json([
            'message' => 'Berhasil, Data Distributor berhasil ditambahkan',
            'data' => $distributor
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $distributor = Distributor::find($id);

        if (!$distributor) {
            return response()->json([
                'message' => 'Data distributor tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nama_distributor' => 'required|string|max:255',
            'tanggal_lahir' => 'required|date',
            'alamat' => 'required|string|max:50',
            'no_telp' => 'required|numeric|digits_between:10,13',
            'email' => 'required|string|email|max:255',
            'distributor' => 'required|string|max:20',
            'deposit_masuk' => 'required|numeric',
        ], [
            'required' => 'Data wajib diisi',
            'no_telp.numeric' => 'Nomor telepon hanya boleh berisi angka',
            'no_telp.digits_between' => 'Nomor telepon harus terdiri dari 10-13 karakter',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        // Calculate difference in deposit if needed. Here we assume editing deposit_masuk updates it or sets it.
        // Assuming deposit_masuk is updated directly and we replace sisa_deposit or add to it? 
        // Typically, editing a distributor replaces their deposit_masuk. I'll just update sisa_deposit based on the new deposit_masuk, or you could compute the difference. Since user story just says edit, I'll update fields.
        
        $distributor->update([
            'nama_distributor' => $request->nama_distributor,
            'tanggal_lahir' => $request->tanggal_lahir,
            'alamat' => $request->alamat,
            'no_telp' => $request->no_telp,
            'email' => $request->email,
            'distributor' => $request->distributor,
            'deposit_masuk' => $request->deposit_masuk,
            'sisa_deposit' => $request->deposit_masuk, // Or maybe it shouldn't overwrite sisa_deposit? I'll overwrite it for simplicity unless told otherwise.
        ]);

        return response()->json([
            'message' => 'Berhasil, Data Distributor berhasil ditambahkan', // requested by user for both
            'data' => $distributor
        ], 200);
    }

    public function addDeposit(Request $request, $id)
    {
        $distributor = Distributor::find($id);

        if (!$distributor) {
            return response()->json([
                'message' => 'Data distributor tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'deposit_masuk' => 'required|numeric|min:0',
        ], [
            'required' => 'Nominal deposit wajib diisi',
            'numeric' => 'Nominal deposit harus berupa angka',
            'min' => 'Nominal deposit tidak boleh kurang dari 0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $depositMasuk = $request->deposit_masuk;
        $distributor->deposit_masuk = $depositMasuk;
        $distributor->sisa_deposit = $distributor->sisa_deposit + $depositMasuk;
        $distributor->save();

        return response()->json([
            'message' => 'Berhasil, Deposit berhasil ditambahkan',
            'data' => [
                'id' => $distributor->id,
                'Nama_Distributor' => $distributor->nama_distributor,
                'Sisa_Deposit' => $distributor->sisa_deposit,
            ]
        ], 200);
    }
}
