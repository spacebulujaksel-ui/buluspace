<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'Admin Utama', 'email' => 'admin@buluspace.com', 'phone' => '081212121213', 'password' => 'admin123', 'role' => 'Admin'],
            ['name' => 'Citra', 'email' => 'citraut@gmail.com', 'phone' => '085432584744', 'password' => 'citra221', 'role' => 'Admin'],
            ['name' => 'Andi', 'email' => 'andi@gmail.com', 'phone' => '085163274684', 'password' => 'andi123', 'role' => 'Customer'],
            ['name' => 'Budi', 'email' => 'budi@gmail.com', 'phone' => '081232547985', 'password' => 'budi333', 'role' => 'Customer'],
            ['name' => 'Clarissa Maharani', 'email' => 'clarissa@mail.com', 'phone' => '081298765432', 'password' => 'clarissa123', 'role' => 'Customer'],
            ['name' => 'Dina Anggraeni', 'email' => 'dina@mail.com', 'phone' => '082154321098', 'password' => 'dina123', 'role' => 'Customer'],
        ];

        $barat = Branch::where('name', 'Jakarta Barat')->first();
        $selatan = Branch::where('name', 'Jakarta Selatan')->first();

        foreach ($users as $u) {
            $branchId = match ($u['email']) {
                'admin@buluspace.com' => $barat?->id,
                'citraut@gmail.com' => $selatan?->id,
                default => null,
            };

            User::updateOrCreate(
                ['email' => $u['email']],
                [
                    'name' => $u['name'],
                    'phone' => $u['phone'],
                    'password' => bcrypt($u['password']),
                    'role' => $u['role'],
                    'branch_id' => $branchId,
                ],
            );
        }
    }
}