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
    public function handle(Request $request, Closure $next, ...$divisis): Response
    {
        if (!$request->user() || !in_array($request->user()->Divisi, $divisis)) {
            return response()->json([
                'message' => 'Akses ditolak! Fitur ini hanya untuk divisi ' . implode(', ', $divisis)
            ], 403);
        }

        return $next($request);
    }
}
