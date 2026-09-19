<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Service;
use App\Models\Therapist;
use App\Models\TherapistLeave;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TherapistLeaveTest extends TestCase
{
    use RefreshDatabase;

    private Branch $branch;
    private array $therapists = [];
    private Service $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->branch = Branch::create(['name' => 'Jakarta Barat', 'rooms_count' => 5, 'sort_order' => 1]);
        foreach (['Ayu', 'Bella', 'Cinta'] as $name) {
            $this->therapists[] = Therapist::create(['name' => $name, 'specialty' => null, 'experience_years' => 0, 'status' => 'Active', 'branch_id' => $this->branch->id]);
        }

        $this->service = Service::create(['name' => 'Forehead', 'category' => 'face', 'duration_minutes' => 10, 'description' => 'Waxing bulu halus area dahi', 'wax_type' => 'x', 'price' => 37000, 'status' => 'Active']);
    }

    private function payload(?int $therapistId = null): array
    {
        return [
            'customer_name' => 'Test',
            'customer_phone' => '081234567890',
            'customer_email' => 'test@example.com',
            'customer_gender' => 'Wanita',
            'therapist_id' => $therapistId,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'start_time' => '13:00',
            'service_ids' => [$this->service->id],
            'location' => 'Jakarta Barat',
        ];
    }

    public function test_booking_specific_therapist_on_leave_is_rejected(): void
    {
        $onLeave = $this->therapists[0];
        TherapistLeave::create(['therapist_id' => $onLeave->id, 'start_date' => now()->addDay()->format('Y-m-d'), 'end_date' => now()->addDay()->format('Y-m-d')]);

        $res = $this->postJson('/api/bookings', $this->payload($onLeave->id));

        $res->assertStatus(422);
        $this->assertStringContainsString('sedang cuti', $res->json('message'));
    }

    public function test_auto_assign_skips_therapist_on_leave(): void
    {
        $onLeave = $this->therapists[0];
        TherapistLeave::create(['therapist_id' => $onLeave->id, 'start_date' => now()->addDay()->format('Y-m-d'), 'end_date' => now()->addDay()->format('Y-m-d')]);

        $res = $this->postJson('/api/bookings', $this->payload(null));

        $res->assertCreated();
        $this->assertNotSame($onLeave->id, $res->json('booking.therapist_id'));
    }

    public function test_availability_includes_on_leave_ids(): void
    {
        $onLeave = $this->therapists[0];
        TherapistLeave::create(['therapist_id' => $onLeave->id, 'start_date' => now()->addDay()->format('Y-m-d'), 'end_date' => now()->addDay()->format('Y-m-d')]);

        $res = $this->getJson('/api/availability?date='.now()->addDay()->format('Y-m-d').'&location=Jakarta Barat');

        $res->assertOk();
        $this->assertContains($onLeave->id, $res->json('on_leave_ids'));
    }

    public function test_leave_status_command_inactivates_on_leave_today(): void
    {
        $therapist = $this->therapists[0];
        TherapistLeave::create(['therapist_id' => $therapist->id, 'start_date' => now()->format('Y-m-d'), 'end_date' => now()->format('Y-m-d')]);

        $this->artisan('app:sync-therapist-leave-status')->assertExitCode(0);

        $this->assertSame('Inactive', $therapist->fresh()->status);
    }
}