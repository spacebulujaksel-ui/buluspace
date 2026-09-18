<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Models\Branch;
use App\Models\Therapist;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;

class SyncTherapists extends Command
{
    protected $signature = 'app:sync-therapists {--dry-run : Tampilkan rencana tanpa mengubah data}';

    protected $description = 'Sinkronkan daftar terapis per cabang (roster resmi), repoint booking dari terapis lama lalu hapus.';

    private const ROSTER = [
        'Jakarta Barat' => ['Amanda', 'Silva', 'Silvia', 'Diah'],
        'Jakarta Selatan' => ['Ira', 'Anisha', 'Nazua', 'Siti', 'Putri', 'Dwi', 'Kayla', 'Ros', 'Lya'],
    ];

    private function normalize(string $value): string
    {
        return strtolower(preg_replace('/\s+/', ' ', trim($value)));
    }

    public function handle(): int
    {
        $dry = (bool) $this->option('dry-run');

        $this->info($dry ? 'MODE DRY-RUN (tidak ada data yang diubah).' : 'Menerapkan sinkronisasi terapis...');

        $result = $this->upsertRoster($dry);
        $changed = $this->removeOldTherapists($result['newIds'], $result['byBranch'], $dry);

        if (!$dry && !$changed && $result['newIds']->isEmpty()) {
            $this->info('Tidak ada perubahan.');
        }

        return 0;
    }

    private function upsertRoster(bool $dry): array
    {
        $newIds = collect();
        $byBranch = [];

        foreach (self::ROSTER as $branchName => $names) {
            $branch = Branch::where('name', $branchName)->first();
            if (!$branch) {
                $this->warn("  Cabang '{$branchName}' tidak ditemukan, dilewati.");
                continue;
            }

            foreach ($names as $name) {
                $existing = Therapist::all()
                    ->first(fn (Therapist $t) => $this->normalize($t->name) === $this->normalize($name));

                if ($existing) {
                    $this->line(sprintf('  %s: "%s" → branch %s (id %d)', $dry ? '[rencana] update' : 'update', $name, $branch->name, $existing->id));
                    if (!$dry) {
                        $existing->update(['name' => $name, 'branch_id' => $branch->id, 'status' => 'Active']);
                    }
                    $id = $existing->id;
                } else {
                    $this->line(sprintf('  %s: "%s" → tambah terapis baru di %s', $dry ? '[rencana] create' : 'create', $name, $branch->name));
                    if (!$dry) {
                        $t = Therapist::create([
                            'name' => $name,
                            'phone' => null,
                            'specialty' => '',
                            'experience_years' => 0,
                            'branch_id' => $branch->id,
                            'status' => 'Active',
                        ]);
                        $id = $t->id;
                    } else {
                        $id = null;
                    }
                }

                if ($id !== null) {
                    $newIds->push((int) $id);
                    $byBranch[$branch->name][] = (int) $id;
                }
            }
        }

        return ['newIds' => $newIds->unique()->values(), 'byBranch' => $byBranch];
    }

    private function removeOldTherapists(Collection $newIds, array $byBranch, bool $dry): bool
    {
        if ($newIds->isEmpty()) {
            return false;
        }

        $old = Therapist::whereNotIn('id', $newIds->all())->get();
        if ($old->isEmpty()) {
            return false;
        }

        $fallbackId = $newIds->first();
        $changed = true;

        $this->warn('Terapis lama (dihapus, booking direpoint):');
        foreach ($old as $therapist) {
            $replacementIds = $therapist->branch_id ? ($byBranch[$therapist->branch?->name] ?? []) : [];
            $replacement = $replacementIds[0] ?? $fallbackId;

            $refs = Appointment::where('therapist_id', $therapist->id)->count();
            $this->line(sprintf('  "%s" (id %d) → %d booking pindah ke terapis id %d, lalu hapus', $therapist->name, $therapist->id, $refs, $replacement));

            if (!$dry) {
                Appointment::where('therapist_id', $therapist->id)->update(['therapist_id' => $replacement]);
                $therapist->delete();
            }
        }

        return $changed;
    }
}