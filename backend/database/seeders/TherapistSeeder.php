<?php

namespace Database\Seeders;

use App\Models\Therapist;
use Illuminate\Database\Seeder;

class TherapistSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['name' => 'Sarah Lestari', 'phone' => '085232324444', 'specialty' => 'Senior Master Aesthetician · Brazilian Expert', 'experience_years' => 6, 'status' => 'Active'],
            ['name' => 'Amanda Mayang', 'phone' => '085910554448', 'specialty' => 'Gentle Care & Precision Specialist', 'experience_years' => 4, 'status' => 'Active'],
            ['name' => 'Jessica Putri', 'phone' => '084855541112', 'specialty' => 'Body Waxing Lead', 'experience_years' => 3, 'status' => 'Inactive'],
            ['name' => 'Nadia Bella', 'phone' => '085777889900', 'specialty' => 'Facial Wax & Brow Architect', 'experience_years' => 4, 'status' => 'Active'],
            ['name' => 'Rina Kusumaningrum', 'phone' => '085244556677', 'specialty' => 'Intimate & Body Waxing Lead', 'experience_years' => 5, 'status' => 'Active'],
        ];

        foreach ($data as $d) {
            Therapist::create($d);
        }
    }
}