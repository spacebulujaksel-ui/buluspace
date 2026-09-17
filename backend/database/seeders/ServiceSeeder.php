<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['name' => 'Forehead', 'description' => 'Pembersihan bulu area dahi', 'price' => 37000, 'duration_minutes' => 10, 'category' => 'face', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Eyebrows', 'description' => 'Merapikan bentuk alis sesuai kontur wajah', 'price' => 52000, 'duration_minutes' => 15, 'category' => 'face', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Chin', 'description' => 'Menghilangkan bulu dagu halus', 'price' => 32000, 'duration_minutes' => 10, 'category' => 'face', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Upper Lip', 'description' => 'Pembersihan bulu area atas bibir', 'price' => 32000, 'duration_minutes' => 10, 'category' => 'face', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Cheek', 'description' => 'Membersihkan bulu halus area pipi', 'price' => 37000, 'duration_minutes' => 10, 'category' => 'face', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Underarms', 'description' => 'Pembersihan bulu ketiak hingga ke akar', 'price' => 52000, 'duration_minutes' => 15, 'category' => 'arms', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Half Arms', 'description' => 'Waxing lengan bawah atau atas', 'price' => 74000, 'duration_minutes' => 20, 'category' => 'arms', 'wax_type' => 'Organic Soft Honey'],
            ['name' => 'Full Arms', 'description' => 'Waxing lengan menyeluruh', 'price' => 85000, 'duration_minutes' => 30, 'category' => 'arms', 'wax_type' => 'Organic Soft Honey'],
            ['name' => 'Chest', 'description' => 'Membersihkan bulu area dada', 'price' => 63000, 'duration_minutes' => 20, 'category' => 'upper', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Stomach', 'description' => 'Waxing bulu area perut', 'price' => 74000, 'duration_minutes' => 20, 'category' => 'upper', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Full Front', 'description' => 'Dada, perut hingga paha', 'price' => 85000, 'duration_minutes' => 35, 'category' => 'upper', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Full Back', 'description' => 'Pembersihan bulu punggung menyeluruh', 'price' => 91000, 'duration_minutes' => 35, 'category' => 'upper', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Half Legs', 'description' => 'Dari lutut ke bawah', 'price' => 85000, 'duration_minutes' => 25, 'category' => 'legs', 'wax_type' => 'Organic Soft Honey'],
            ['name' => 'Full Legs', 'description' => 'Paha hingga pergelangan kaki', 'price' => 96000, 'duration_minutes' => 45, 'category' => 'legs', 'wax_type' => 'Organic Soft Honey'],
            ['name' => 'Basic Bikini', 'description' => 'Merapikan bulu area bikini line', 'price' => 63000, 'duration_minutes' => 20, 'category' => 'intimate', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Brazilian', 'description' => 'Perawatan intim menyeluruh', 'price' => 85000, 'duration_minutes' => 30, 'category' => 'intimate', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Buttocks', 'description' => 'Membersihkan bulu area bokong', 'price' => 63000, 'duration_minutes' => 20, 'category' => 'intimate', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Clean Girl', 'description' => 'Eyebrows + Upper Lip + Forehead', 'price' => 107000, 'duration_minutes' => 35, 'category' => 'package', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Feel Smooth', 'description' => 'Full Legs + Full Arms', 'price' => 168000, 'duration_minutes' => 75, 'category' => 'package', 'wax_type' => 'Organic Soft Honey'],
            ['name' => 'Bali Ready', 'description' => 'Underarms + Half Legs + Brazilian', 'price' => 195000, 'duration_minutes' => 70, 'category' => 'package', 'wax_type' => 'Gentle Film Hard Wax'],
        ];

        foreach ($services as $s) {
            Service::create($s);
        }
    }
}