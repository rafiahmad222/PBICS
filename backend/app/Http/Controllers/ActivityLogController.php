<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\ActivityLog;

class ActivityLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $date = $request->input('date');

        $query = ActivityLog::with('karyawan');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('module', 'LIKE', "%{$search}%")
                  ->orWhere('details', 'LIKE', "%{$search}%")
                  ->orWhereHas('karyawan', function ($karyawanQuery) use ($search) {
                      $karyawanQuery->where('NamaLengkap_karyawan', 'LIKE', "%{$search}%");
                  });
            });
        }

        if ($date) {
            $query->whereDate('created_at', $date);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json($logs);
    }
}
