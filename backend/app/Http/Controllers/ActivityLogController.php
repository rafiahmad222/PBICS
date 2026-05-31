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

        $query = ActivityLog::with('user');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('module', 'LIKE', "%{$search}%")
                  ->orWhere('details', 'LIKE', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('NamaLengkap_karyawan', 'LIKE', "%{$search}%");
                  });
            });
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json($logs);
    }
}
