<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Service;
use App\Models\Therapist;
use App\Models\TherapistOffDay;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class TherapistOffDayTest extends TestCase
{
    use RefreshDatabase;

    private Branch $branch;
    private Therapist $offDay;
    private Therapist $other;
    private Service $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->branch = Branch::create(['name' => 'Jakarta Barat', 'rooms_count' => 5, 'sort_order' => 1]);
        $this->offDay = Therapist::create(['name' => 'Ayu', 'specialty' => null, 'experience_years' => 0, 'status' => 'Active', 'branch_id' => $this->branch->id]);
        $this->other = Therapist::create(['name' => 'Bella', 'specialty' => null, 'experience_years' => 0, 'status' => 'Active', 'branch_id' => $this->branch->id]);

        $this->service = Service::create(['name' => 'Forehead', 'category' => 'face', 'duration_minutes' => 10, 'description' => 'Waxing bulu halus area dahi', 'wax_type' => 'x', 'price' => 37000, 'status' => 'Active']);
    }

    private function payload(?int $therapistId, string $date): array
    {
        return [
            'customer_name' => 'Test',
            'customer_phone' => '081234567890',
            'customer_email' => 'test@example.com',
            'customer_gender' => 'Wanita',
            'therapist_id' => $therapistId,
            'appointment_date' => $date,
            'start_time' => '13:00',
            'service_ids' => [$this->service->id],
            'location' => 'Jakarta Barat',
        ];
    }

    private function monday(): string
    {
        return Carbon::parse('next monday')->format('Y-m-d');
    }

    private function tuesday(): string
    {
        return Carbon::parse('next tuesday')->format('Y-m-d');
    }

    public function test_booking_specific_therapist_on_off_day_is_rejected(): void
    {
        TherapistOffDay::create(['therapist_id' => $this->offDay->id, 'day_of_week_iso' => 1]);

        $res = $this->postJson('/api/bookings', $this->payload($this->offDay->id, $this->monday()));

        $res->assertStatus(422);
        $this->assertStringContainsString('libur rutin', $res->json('message'));
    }

    public function test_auto_assign_skips_therapist_on_off_day(): void
    {
        TherapistOffDay::create(['therapist_id' => $this->offDay->id, 'day_of_week_iso' => 1]);

        $res = $this->postJson('/api/bookings', $this->payload(null, $this->monday()));

        $res->assertCreated();
        $this->assertSame($this->other->id, $res->json('booking.therapist_id'));
    }

    public function test_availability_includes_off_day_ids(): void
    {
        TherapistOffDay::create(['therapist_id' => $this->offDay->id, 'day_of_week_iso' => 1]);

        $res = $this->getJson('/api/availability?date='.$this->monday().'&location=Jakarta Barat');

        $res->assertOk();
        $this->assertContains($this->offDay->id, $res->json('off_day_ids'));
    }

    public function test_same_therapist_is_bookable_on_other_weekday(): void
    {
        TherapistOffDay::create(['therapist_id' => $this->offDay->id, 'day_of_week_iso' => 1]);

        $res = $this->postJson('/api/bookings', $this->payload($this->offDay->id, $this->tuesday()));

        $res->assertCreated();
        $this->assertSame($this->offDay->id, $res->json('booking.therapist_id'));
    }
}