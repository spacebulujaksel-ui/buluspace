<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Models\AppointmentDetail;
use App\Models\Promo;
use App\Models\Service;
use App\Models\Therapist;
use Illuminate\Console\Command;

class DedupeDuplicateRecords extends Command
{
    protected $signature = 'app:dedupe {--dry-run : Tampilkan rencana tanpa mengubah data}';

    protected $description = 'Hapus duplikat layanan, terapis, dan promo berdasarkan nama; pertahankan id terkecil.';

    private function normalize(string $value): string
    {
        return strtolower(preg_replace('/\s+/', ' ', trim($value)));
    }

    public function handle(): int
    {
        $dry = (bool) $this->option('dry-run');

        $this->info($dry ? 'MODE DRY-RUN (tidak ada data yang diubah).' : 'Menerapkan dedupe...');

        $changed = false;
        $changed = $this->dedupeServices($dry) || $changed;
        $changed = $this->dedupeTherapists($dry) || $changed;
        $changed = $this->dedupePromos($dry) || $changed;

        if (!$changed) {
            $this->info('Tidak ada duplikat ditemukan.');
        }

        return 0;
    }

    private function dedupeServices(bool $dry): bool
    {
        $groups = Service::all()
            ->groupBy(fn (Service $s) => $this->normalize($s->name))
            ->filter(fn ($g) => $g->count() > 1);

        if ($groups->isEmpty()) {
            return false;
        }

        $this->warn('Layanan (duplikat berdasarkan nama):');
        foreach ($groups as $name => $group) {
            $ids = $group->sortBy('id')->pluck('id')->values();
            $survivor = (int) $ids->first();
            $dups = $ids->slice(1)->map(fn ($id) => (int) $id);
            $refs = AppointmentDetail::whereIn('service_id', $dups->all())->count();

            $this->line(sprintf('  "%s" → simpan id %d, hapus id %s, %d referensi booking dipindah', $name, $survivor, $dups->implode(', '), $refs));

            if (!$dry) {
                AppointmentDetail::whereIn('service_id', $dups->all())->update(['service_id' => $survivor]);
                Service::whereIn('id', $dups->all())->delete();
            }
        }

        return true;
    }

    private function dedupeTherapists(bool $dry): bool
    {
        $groups = Therapist::all()
            ->groupBy(fn (Therapist $t) => $this->normalize($t->name))
            ->filter(fn ($g) => $g->count() > 1);

        if ($groups->isEmpty()) {
            return false;
        }

        $this->warn('Terapis (duplikat berdasarkan nama):');
        foreach ($groups as $name => $group) {
            $ids = $group->sortBy('id')->pluck('id')->values();
            $survivor = (int) $ids->first();
            $dups = $ids->slice(1)->map(fn ($id) => (int) $id);
            $refs = Appointment::whereIn('therapist_id', $dups->all())->count();

            $this->line(sprintf('  "%s" → simpan id %d, hapus id %s, %d booking dipindah', $name, $survivor, $dups->implode(', '), $refs));

            if (!$dry) {
                Appointment::whereIn('therapist_id', $dups->all())->update(['therapist_id' => $survivor]);
                Therapist::whereIn('id', $dups->all())->delete();
            }
        }

        return true;
    }

    private function dedupePromos(bool $dry): bool
    {
        $groups = Promo::all()
            ->groupBy(fn (Promo $p) => $this->normalize($p->title))
            ->filter(fn ($g) => $g->count() > 1);

        if ($groups->isEmpty()) {
            return false;
        }

        $this->warn('Promo (duplikat berdasarkan judul):');
        foreach ($groups as $title => $group) {
            $ids = $group->sortBy('id')->pluck('id')->values();
            $survivor = (int) $ids->first();
            $dups = $ids->slice(1)->map(fn ($id) => (int) $id);

            $this->line(sprintf('  "%s" → simpan id %d, hapus id %s', $title, $survivor, $dups->implode(', ')));

            if (!$dry) {
                Promo::whereIn('id', $dups->all())->delete();
            }
        }

        return true;
    }
}