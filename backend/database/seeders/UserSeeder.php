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
            ['name' => 'admin jakbar', 'email' => 'adminjakbar@buluspace.com', 'phone' => '081212121213', 'password' => 'adminjakbar123', 'role' => 'Admin'],
            ['name' => 'admin jaksel', 'email' => 'adminjaksel@buluspace.com', 'phone' => '085432584744', 'password' => 'adminjaksel123', 'role' => 'Admin'],
            ['name' => 'Andi', 'email' => 'andi@gmail.com', 'phone' => '085163274684', 'password' => 'andi123', 'role' => 'Customer'],
            ['name' => 'Budi', 'email' => 'budi@gmail.com', 'phone' => '081232547985', 'password' => 'budi333', 'role' => 'Customer'],
            ['name' => 'Clarissa Maharani', 'email' => 'clarissa@mail.com', 'phone' => '081298765432', 'password' => 'clarissa123', 'role' => 'Customer'],
            ['name' => 'Dina Anggraeni', 'email' => 'dina@mail.com', 'phone' => '082154321098', 'password' => 'dina123', 'role' => 'Customer'],
        ];

        $barat = Branch::where('name', 'Jakarta Barat')->first();
        $selatan = Branch::where('name', 'Jakarta Selatan')->first();

        foreach ($users as $u) {
            $branchId = match ($u['email']) {
                'adminjakbar@buluspace.com' => $barat?->id,
                'adminjaksel@buluspace.com' => $selatan?->id,
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