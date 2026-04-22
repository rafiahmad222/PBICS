<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckDivisi
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $divisi): Response
    {
        if (!$request->user() || $request->user()->Divisi !== $divisi) {
            return response()->json([
                'message' => 'Akses ditolak! Fitur ini hanya untuk divisi ' . $divisi
            ], 403);
        }

        return $next($request);
    }
}
