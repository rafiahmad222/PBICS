<?php

namespace App\Http\Controllers;

use App\Models\KabKota;
use App\Models\Kec;

class WilayahController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function getKabKota()
    {
        $kabKotas = KabKota::select(
            'id',
            'name'
        )->get();

        return response()->json([
            'message' => 'Data kabupaten/kota berhasil diambil',
            'data' => $kabKotas
        ]);
    }
    /**
     * Display a listing of the resource.
     */ 
    public function getKecByKabKota($kabKotaId)
    {
        $kecs = Kec::where('KabKota_id', $kabKotaId)->select(
            'id',
            'name'
        )->get();

        return response()->json([
            'message' => 'Data kecamatan berhasil diambil',
            'data' => $kecs
        ]);
    }
}
