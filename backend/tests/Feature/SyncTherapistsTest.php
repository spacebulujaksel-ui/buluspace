<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Branch;
use App\Models\Therapist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SyncTherapistsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Branch::create(['name' => 'Jakarta Barat', 'rooms_count' => 2, 'sort_order' => 1]);
        Branch::create(['name' => 'Jakarta Selatan', 'rooms_count' => 5, 'sort_order' => 2]);
    }

    private function therapist(string $name, ?int $branchId = null): Therapist
    {
        return Therapist::create([
            'name' => $name,
            'phone' => '08'.random_int(1000000000, 9999999999),
            'specialty' => null,
            'experience_years' => 0,
            'status' => 'Active',
            'branch_id' => $branchId,
        ]);
    }

    private function appointment(Therapist $therapist): Appointment
    {
        return Appointment::create([
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
    }

    public function test_sync_creates_roster_repoints_and_deletes_old(): void
    {
        $old = $this->therapist('Sarah Lestari');
        $apt = $this->appointment($old);

        $this->artisan('app:sync-therapists')->assertExitCode(0);

        $this->assertSame(13, Therapist::count());
        $this->assertDatabaseMissing('therapists', ['id' => $old->id]);
        $this->assertTrue(Appointment::find($apt->id)->therapist_id !== $old->id);

        $barat = Branch::where('name', 'Jakarta Barat')->first()->id;
        $selatan = Branch::where('name', 'Jakarta Selatan')->first()->id;

        foreach (['Amanda', 'Silva', 'Silvia', 'Diah'] as $name) {
            $this->assertDatabaseHas('therapists', ['name' => $name, 'branch_id' => $barat, 'status' => 'Active']);
        }
        foreach (['Ira', 'Anisha', 'Nazua', 'Siti', 'Putri', 'Dwi', 'Kayla', 'Ros', 'Lya'] as $name) {
            $this->assertDatabaseHas('therapists', ['name' => $name, 'branch_id' => $selatan, 'status' => 'Active']);
        }
    }

    public function test_sync_dry_run_changes_nothing(): void
    {
        $old = $this->therapist('Sarah Lestari');

        $this->artisan('app:sync-therapists', ['--dry-run' => true])->assertExitCode(0);

        $this->assertSame(1, Therapist::count());
        $this->assertDatabaseHas('therapists', ['id' => $old->id]);
    }
}