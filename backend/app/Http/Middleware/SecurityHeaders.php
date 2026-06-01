<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Content Security Policy sangat ketat untuk murni REST API.
        // default-src 'none': Memblokir pemuatan semua aset secara default.
        // frame-ancestors 'none': Memblokir respon agar tidak bisa di-embed di iframe manapun (mencegah Clickjacking).
        // sandbox: Mengisolasi halaman agar tidak bisa menjalankan script, popup, dll., jika diakses langsung di browser.
        $csp = "default-src 'none'; frame-ancestors 'none'; sandbox;";

        // Tambahkan CSP Header
        $response->headers->set('Content-Security-Policy', $csp);
        
        // Header keamanan tambahan untuk REST API
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'no-referrer');
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), interest-cohort=()');

        return $response;
    }
}
