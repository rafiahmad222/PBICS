<?php

namespace Tests\Feature;

use Tests\TestCase;

class SecurityHeadersTest extends TestCase
{
    /**
     * Test that global security headers are present in responses.
     */
    public function test_security_headers_are_present(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);

        // Periksa keberadaan header keamanan yang telah dipasang
        $response->assertHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; sandbox;");
        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('Referrer-Policy', 'no-referrer');
        $response->assertHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), interest-cohort=()');
    }
}
