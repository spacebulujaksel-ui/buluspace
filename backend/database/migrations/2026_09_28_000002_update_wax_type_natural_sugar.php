<?php

use App\Models\Service;
use Illuminate\Database\Migrations\Migration;

/**
 * wax_type untuk 6 layanan face/paket yang deskripsinya "Threading ..." masih
 * 'Gentle Film Hard Wax'. Label itu hanya tampil di panel admin (halaman customer
 * tidak merender wax_type), jadi tampilannya kontradiktif di Manage > Layanan.
 * Sembilan layanan waxing lainnya memakai produk sugar wax.
 */
return new class extends Migration
{
    private const NATURAL_SUGAR = [
        'Underarms', 'Chest', 'Stomach', 'Full Front', 'Full Back',
        'Basic Bikini', 'Brazilian', 'Buttocks', 'Bali Ready',
    ];

    private const THREADING = [
        'Cheek', 'Forehead', 'Eyebrows', 'Chin', 'Upper Lip', 'Clean Girl',
    ];

    public function up(): void
    {
        Service::whereIn('name', self::NATURAL_SUGAR)->update(['wax_type' => 'Natural Sugar']);
        Service::whereIn('name', self::THREADING)->update(['wax_type' => 'Threading']);
    }

    public function down(): void
    {
        Service::whereIn('name', array_merge(self::NATURAL_SUGAR, self::THREADING))
            ->update(['wax_type' => 'Gentle Film Hard Wax']);
    }
};
