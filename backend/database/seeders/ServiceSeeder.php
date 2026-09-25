<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['name' => 'Forehead', 'description' => 'Threading bulu halus area dahi', 'price' => 37000, 'duration_minutes' => 10, 'category' => 'face', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Eyebrows', 'description' => 'Threading bentuk alis. Untuk pertama kali bisa ±30 menit', 'price' => 52000, 'duration_minutes' => 15, 'category' => 'face', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Chin', 'description' => 'Threading bulu halus area dagu', 'price' => 32000, 'duration_minutes' => 10, 'category' => 'face', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Upper Lip', 'description' => 'Threading bulu halus area atas bibir', 'price' => 32000, 'duration_minutes' => 10, 'category' => 'face', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Cheek', 'description' => 'Threading bulu halus di area pipi', 'price' => 37000, 'duration_minutes' => 10, 'category' => 'face', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Underarms', 'description' => 'Pembersihan bulu ketiak hingga ke akar', 'price' => 52000, 'duration_minutes' => 15, 'category' => 'arms', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Half Arms', 'description' => 'Waxing lengan bawah hingga ujung tangan', 'price' => 74000, 'duration_minutes' => 15, 'category' => 'arms', 'wax_type' => 'Organic Soft Honey'],
            ['name' => 'Full Arms', 'description' => 'Waxing lengan menyeluruh dari bahu hingga ujung tangan', 'price' => 85000, 'duration_minutes' => 30, 'category' => 'arms', 'wax_type' => 'Organic Soft Honey'],
            ['name' => 'Chest', 'description' => 'Membersihkan bulu area dada', 'price' => 63000, 'duration_minutes' => 15, 'category' => 'upper', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Stomach', 'description' => 'Waxing bulu area perut', 'price' => 74000, 'duration_minutes' => 15, 'category' => 'upper', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Full Front', 'description' => 'Dada, perut hingga paha', 'price' => 85000, 'duration_minutes' => 30, 'category' => 'upper', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Full Back', 'description' => 'Pembersihan bulu punggung menyeluruh', 'price' => 91000, 'duration_minutes' => 30, 'category' => 'upper', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Half Legs', 'description' => 'Dari lutut ke bawah', 'price' => 85000, 'duration_minutes' => 15, 'category' => 'legs', 'wax_type' => 'Organic Soft Honey'],
            ['name' => 'Full Legs', 'description' => 'Paha hingga pergelangan kaki. Untuk pria, cakupan area hanya ¾ kaki', 'price' => 96000, 'duration_minutes' => 30, 'category' => 'legs', 'wax_type' => 'Organic Soft Honey'],
            ['name' => 'Basic Bikini', 'description' => 'Merapikan bulu area bikini line', 'price' => 63000, 'duration_minutes' => 15, 'category' => 'intimate', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Brazilian', 'description' => 'Perawatan intim menyeluruh', 'price' => 85000, 'duration_minutes' => 30, 'category' => 'intimate', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Buttocks', 'description' => 'Membersihkan bulu area bokong', 'price' => 63000, 'duration_minutes' => 15, 'category' => 'intimate', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Clean Girl', 'description' => 'Threading Eyebrows + Upper Lip + Forehead', 'price' => 107000, 'duration_minutes' => 45, 'category' => 'package', 'wax_type' => 'Gentle Film Hard Wax'],
            ['name' => 'Feel Smooth', 'description' => 'Full Legs + Full Arms', 'price' => 168000, 'duration_minutes' => 60, 'category' => 'package', 'wax_type' => 'Organic Soft Honey'],
            ['name' => 'Bali Ready', 'description' => 'Underarms + Half Legs + Brazilian', 'price' => 195000, 'duration_minutes' => 45, 'category' => 'package', 'wax_type' => 'Gentle Film Hard Wax'],
        ];

        foreach ($services as $s) {
            Service::create($s);
        }
    }
}