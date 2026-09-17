<?php

namespace Database\Seeders;

use App\Models\Branch;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        Branch::updateOrCreate(['name' => 'Jakarta Barat'], [
            'address' => 'Jl. Raya Kb. Jeruk No.8, Kb. Jeruk, Jakarta Barat 11530',
            'rooms_count' => 2,
            'sort_order' => 1,
        ]);
        Branch::updateOrCreate(['name' => 'Jakarta Selatan'], [
            'address' => 'Jl. H. Syahrin No.3c 6, Gandaria Utara, Kebayoran Baru, Jakarta Selatan 12140',
            'rooms_count' => 5,
            'sort_order' => 2,
        ]);
    }
}