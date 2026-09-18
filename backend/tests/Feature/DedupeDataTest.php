<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\AppointmentDetail;
use App\Models\Promo;
use App\Models\Service;
use App\Models\Therapist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DedupeDataTest extends TestCase
{
    use RefreshDatabase;

    private function service(string $name): Service
    {
        return Service::create([
            'name' => $name,
            'description' => null,
            'price' => 50000,
            'duration_minutes' => 30,
            'category' => 'body',
            'wax_type' => null,
            'status' => 'Active',
        ]);
    }

    private function therapist(string $name): Therapist
    {
        return Therapist::create([
            'name' => $name,
            'phone' => '08'.random_int(1000000000, 9999999999),
            'specialty' => null,
            'experience_years' => 0,
            'status' => 'Active',
        ]);
    }

    private function appointment(Therapist $therapist, ?int $serviceId = null): Appointment
    {
        $apt = Appointment::create([
            'booking_code' => 'BS-'.random_int(100000, 999999),
            'therapist_id' => $therapist->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'start_time' => '10:00',
            'end_time' => '11:00',
            'status' => 'Pending',
            'customer_name' => 'Test',
            'customer_phone' => '081234567890',
            'customer_email' => 'test@example.com',
            'customer_gender' => 'Wanita',
            'total_price' => 50000,
        ]);

        if ($serviceId !== null) {
            AppointmentDetail::create([
                'appointment_id' => $apt->id,
                'service_id' => $serviceId,
                'quantity' => 1,
                'price' => 50000,
            ]);
        }

        return $apt;
    }

    private function promo(string $title): Promo
    {
        return Promo::create([
            'tag' => 'TAG',
            'title' => $title,
            'cta_text' => 'BOOK NOW',
            'accent_color' => '#F472B6',
            'is_active' => true,
            'sort_order' => 0,
        ]);
    }

    public function test_dedupe_services_keeps_lowest_id_and_repoints_details(): void
    {
        $keep = $this->service('Brazilian');
        $dup = $this->service('  BRAZILIAN  ');
        $therapist = $this->therapist('Ayu');
        $apt = $this->appointment($therapist, $dup->id);

        $this->artisan('app:dedupe')->assertExitCode(0);

        $this->assertSame(1, Service::count());
        $this->assertDatabaseHas('services', ['id' => $keep->id]);
        $this->assertDatabaseMissing('services', ['id' => $dup->id]);
        $this->assertSame($keep->id, AppointmentDetail::find($apt->details()->first()->id)->service_id);
    }

    public function test_dedupe_dry_run_changes_nothing(): void
    {
        $this->service('Brazilian');
        $this->service('brazilian ');

        $this->artisan('app:dedupe', ['--dry-run' => true])->assertExitCode(0);

        $this->assertSame(2, Service::count());
    }

    public function test_dedupe_therapists_keeps_lowest_id_and_repoints_appointments(): void
    {
        $keep = $this->therapist('Ayu');
        $dup = $this->therapist(' ayu ');
        $apt = $this->appointment($dup);

        $this->artisan('app:dedupe')->assertExitCode(0);

        $this->assertSame(1, Therapist::count());
        $this->assertDatabaseHas('therapists', ['id' => $keep->id]);
        $this->assertDatabaseMissing('therapists', ['id' => $dup->id]);
        $this->assertSame($keep->id, Appointment::find($apt->id)->therapist_id);
    }

    public function test_dedupe_promos_keeps_lowest_id(): void
    {
        $keep = $this->promo('First Time Waxing di Bulu Space?');
        $dup = $this->promo('  first time waxing di bulu space? ');

        $this->artisan('app:dedupe')->assertExitCode(0);

        $this->assertSame(1, Promo::count());
        $this->assertDatabaseHas('promos', ['id' => $keep->id]);
        $this->assertDatabaseMissing('promos', ['id' => $dup->id]);
    }
}