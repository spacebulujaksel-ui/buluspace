<?php

namespace App\Services;

use App\Models\Service;
use Illuminate\Support\Collection;

class BookingDuration
{
    // Paket memberi gratis SATU layanan 15 menit. Hanya layanan 15 menit yang boleh
    // diserap; 10 menit dan 30/45 menit selalu dihitung normal.
    public const PACKAGE_FREE_MINUTES = 15;
    public const BRAZILIAN_ABSORBED = ['Eyebrows', 'Underarms', 'Half Arms', 'Half Legs', 'Chest', 'Stomach', 'Buttocks'];
    public const FEEL_SMOOTH_ABSORBED = ['Eyebrows', 'Underarms', 'Chest', 'Stomach', 'Buttocks', 'Basic Bikini'];

    /** "15:30:00" -> 930 */
    public static function minutesOf(string $time): int
    {
        return (int) substr($time, 0, 2) * 60 + (int) substr($time, 3, 2);
    }

    /** 930 -> "15:30:00" */
    public static function timeOf(int $minutes): string
    {
        return sprintf('%02d:%02d:00', intdiv($minutes, 60), $minutes % 60);
    }

    /**
     * Total durasi satu booking: jumlah semua durasi layanan, dikurangi satu
     * layanan 15 menit kalau ada Brazilian/Feel Smooth (paket menggratiskan
     * SATU layanan 15 menit, bukan tiap add-on).
     */
    public static function totalMinutes(Collection $services): int
    {
        $names = $services->pluck('name');
        $absorbed = array_values(array_unique(array_merge(
            $names->contains('Brazilian') ? self::BRAZILIAN_ABSORBED : [],
            $names->contains('Feel Smooth') ? self::FEEL_SMOOTH_ABSORBED : [],
        )));

        $total = (int) $services->sum('duration_minutes');

        $hasFreeSlot = $services->contains(
            fn (Service $s) => in_array($s->name, $absorbed, true) && (int) $s->duration_minutes === self::PACKAGE_FREE_MINUTES
        );

        return $hasFreeSlot ? $total - self::PACKAGE_FREE_MINUTES : $total;
    }

    /** Puncak jumlah booking yang jalan bersamaan di menit $from..$to (resolusi per menit). */
    public static function peakOccupancy(Collection $dayBookings, int $from, int $to): int
    {
        $occupancy = [];
        foreach ($dayBookings as $apt) {
            $a = self::minutesOf($apt->start_time);
            $b = self::minutesOf($apt->end_time);
            for ($m = max($a, $from); $m < min($b, $to); $m++) {
                $occupancy[$m] = ($occupancy[$m] ?? 0) + 1;
            }
        }

        return $occupancy ? max($occupancy) : 0;
    }
}