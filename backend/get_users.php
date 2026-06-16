<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\DataKaryawan;

$users = User::all();
foreach ($users as $u) {
    $karyawan = DataKaryawan::find($u->id);
    $name = $karyawan ? $karyawan->NamaLengkap_karyawan : 'N/A';
    echo "ID: {$u->id} | Username: {$u->Username} | Role: {$u->role} | Karyawan: {$name}\n";
}
