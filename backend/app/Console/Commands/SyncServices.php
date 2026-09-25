<?php

namespace App\Console\Commands;

use App\Models\Service;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;

class SyncServices extends Command
{
    protected $signature = 'app:sync-services {--dry-run : Tampilkan rencana tanpa mengubah data}';

    protected $description = 'Sinkronkan daftar layanan sesuai roster resmi (update durasi/kategori/deskripsi, harga dipertahankan).';

    private const ROSTER = [
        ['name' => 'Cheek', 'category' => 'face', 'duration_minutes' => 10, 'wax_type' => 'Gentle Film Hard Wax', 'description' => 'Threading bulu halus di area pipi', 'price' => 37000],
        ['name' => 'Forehead', 'category' => 'face', 'duration_minutes' => 10, 'wax_type' => 'Gentle Film Hard Wax', 'description' => 'Threading bulu halus area dahi'],
        ['name' => 'Eyebrows', 'category' => 'face', 'duration_minutes' => 15, 'wax_type' => 'Gentle Film Hard Wax', 'description' => 'Threading bentuk alis. Untuk pertama kali bisa ±30 menit'],
        ['name' => 'Chin', 'category' => 'face', 'duration_minutes' => 10, 'wax_type' => 'Gentle Film Hard Wax', 'description' => 'Threading bulu halus area dagu'],
        ['name' => 'Upper Lip', 'category' => 'face', 'duration_minutes' => 10, 'wax_type' => 'Gentle Film Hard Wax', 'description' => 'Threading bulu halus area atas bibir'],
        ['name' => 'Underarms', 'category' => 'arms', 'duration_minutes' => 15, 'wax_type' => 'Gentle Film Hard Wax', 'description' => 'Waxing bulu ketiak sepenuhnya'],
        ['name' => 'Half Arms', 'category' => 'arms', 'duration_minutes' => 15, 'wax_type' => 'Organic Soft Honey', 'description' => 'Waxing lengan bawah hingga ujung tangan'],
        ['name' => 'Full Arms', 'category' => 'arms', 'duration_minutes' => 30, 'wax_type' => 'Organic Soft Honey', 'description' => 'Waxing lengan menyeluruh dari bahu hingga ujung tangan'],
        ['name' => 'Chest', 'category' => 'upper', 'duration_minutes' => 15, 'wax_type' => 'Gentle Film Hard Wax', 'description' => 'Waxing bulu area dada'],
        ['name' => 'Stomach', 'category' => 'upper', 'duration_minutes' => 15, 'wax_type' => 'Gentle Film Hard Wax', 'description' => 'Waxing bulu area perut'],
        ['name' => 'Full Front', 'category' => 'upper', 'duration_minutes' => 30, 'wax_type' => 'Gentle Film Hard Wax', 'description' => 'Waxing bulu area dada & perut'],
        ['name' => 'Full Back', 'category' => 'upper', 'duration_minutes' => 30, 'wax_type' => 'Gentle Film Hard Wax', 'description' => 'Waxing bulu area punggung'],
        ['name' => 'Half Legs', 'category' => 'legs', 'duration_minutes' => 15, 'wax_type' => 'Organic Soft Honey', 'description' => 'Waxing area lutut hingga ujung kaki'],
        ['name' => 'Full Legs', 'category' => 'legs', 'duration_minutes' => 30, 'wax_type' => 'Organic Soft Honey', 'description' => 'Waxing area paha hingga ujung kaki. Untuk pria, cakupan area hanya ¾ kaki', 'last_order_time' => '18:00'],
        ['name' => 'Basic Bikini', 'category' => 'intimate', 'duration_minutes' => 15, 'wax_type' => 'Gentle Film Hard Wax', 'description' => 'Waxing bulu area bikini line'],
        ['name' => 'Brazilian', 'category' => 'intimate', 'duration_minutes' => 30, 'wax_type' => 'Gentle Film Hard Wax', 'description' => 'Waxing area intim menyeluruh'],
        ['name' => 'Buttocks', 'category' => 'intimate', 'duration_minutes' => 15, 'wax_type' => 'Gentle Film Hard Wax', 'description' => 'Waxing bulu area bokong'],
        ['name' => 'Clean Girl', 'category' => 'package', 'duration_minutes' => 45, 'wax_type' => 'Gentle Film Hard Wax', 'description' => 'Waxing Eyebrows + Upper Lip + Forehead'],
        ['name' => 'Feel Smooth', 'category' => 'package', 'duration_minutes' => 60, 'wax_type' => 'Organic Soft Honey', 'description' => 'Waxing Full Legs + Full Arms'],
        ['name' => 'Bali Ready', 'category' => 'package', 'duration_minutes' => 45, 'wax_type' => 'Gentle Film Hard Wax', 'description' => 'Waxing Underarms + Half Legs + Brazilian'],
    ];

    private function normalize(string $value): string
    {
        return strtolower(preg_replace('/\s+/', ' ', trim($value)));
    }

    public function handle(): int
    {
        $dry = (bool) $this->option('dry-run');

        $this->info($dry ? 'MODE DRY-RUN (tidak ada data yang diubah).' : 'Menerapkan sinkronisasi layanan...');

        $seeded = collect();
        foreach (self::ROSTER as $service) {
            $normalized = $this->normalize($service['name']);
            $existing = Service::all()->first(fn (Service $s) => $this->normalize($s->name) === $normalized);

            if ($existing) {
                $this->line(sprintf('  %s: "%s" → kategori %s, durasi %d menit (harga %s dipertahankan)',
                    $dry ? '[rencana] update' : 'update', $service['name'], strtoupper($service['category']), $service['duration_minutes'],
                    number_format((float) $existing->price, 0, ',', '.')));
                if (!$dry) {
                    $updateData = [
                        'name' => $service['name'],
                        'category' => $service['category'],
                        'duration_minutes' => $service['duration_minutes'],
                        'description' => $service['description'],
                        'wax_type' => $service['wax_type'],
                        'last_order_time' => $service['last_order_time'] ?? $existing->last_order_time,
                        'status' => 'Active',
                    ];
                    if ((float) $existing->price === 0.0 && isset($service['price'])) {
                        $updateData['price'] = $service['price'];
                    }
                    $existing->update($updateData);
                }
            } else {
                $this->line(sprintf('  %s: "%s" → tambah layanan baru harga Rp%s (diisi via admin jika 0)',
                    $dry ? '[rencana] create' : 'create', $service['name'],
                    number_format((float) ($service['price'] ?? 0), 0, ',', '.')));
                if (!$dry) {
                    Service::create([
                        'name' => $service['name'],
                        'category' => $service['category'],
                        'duration_minutes' => $service['duration_minutes'],
                        'description' => $service['description'],
                        'wax_type' => $service['wax_type'],
                        'last_order_time' => $service['last_order_time'] ?? null,
                        'price' => $service['price'] ?? 0,
                        'status' => 'Active',
                    ]);
                }
            }

            $seeded->push($normalized);
        }

        $inactive = Service::where('status', 'Active')->get()->filter(
            fn (Service $s) => !$seeded->contains($this->normalize($s->name))
        );

        if ($inactive->isNotEmpty()) {
            $this->warn('Layanan lama yang dinonaktifkan:');
            foreach ($inactive as $s) {
                $this->line(sprintf('  %s: "%s" (id %d)', $dry ? '[rencana] inactive' : 'inactive', $s->name, $s->id));
                if (!$dry) {
                    $s->update(['status' => 'Inactive']);
                }
            }
        }

        return 0;
    }
}