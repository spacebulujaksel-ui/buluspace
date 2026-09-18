<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Service;
use App\Models\Therapist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingCapacityTest extends TestCase
{
    use RefreshDatabase;

    private string $branch = 'Jakarta Barat';
    private Service $service;

    protected function setUp(): void
    {
        parent::setUp();

        Branch::create(['name' => $this->branch, 'rooms_count' => 2, 'sort_order' => 1]);
        foreach (['Ayu', 'Bella', 'Cinta', 'Dewi'] as $name) {
            Therapist::create(['name' => $name, 'phone' => '08'.$name, 'specialty' => null, 'experience_years' => 0, 'status' => 'Active']);
        }

        $this->service = Service::create(['name' => 'Brazilian', 'description' => null, 'price' => 200000, 'duration_minutes' => 60, 'category' => 'intimate', 'status' => 'Active']);
    }

    private function payload(string $time, ?int $therapistId = null): array
    {
        return [
            'customer_name' => 'Test Client',
            'customer_phone' => '081234567890',
            'customer_email' => 'client@example.com',
            'therapist_id' => $therapistId,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'start_time' => $time,
            'service_ids' => [$this->service->id],
            'location' => $this->branch,
        ];
    }

    public function test_capacity_two_allows_two_bookings_then_rejects_third(): void
    {
        $this->postJson('/api/bookings', $this->payload('13:00'))->assertCreated();
        $this->postJson('/api/bookings', $this->payload('13:00'))->assertCreated();

        $res = $this->postJson('/api/bookings', $this->payload('13:00'));
        $res->assertStatus(422);
        $this->assertTrue($res->json('full') === true);
        $this->assertCount(2, \App\Models\Appointment::where('location', $this->branch)->get());
    }

    public function test_blocking_one_room_reduces_capacity_to_one(): void
    {
        $branch = Branch::where('name', $this->branch)->first();

        \App\Models\BlockedSlot::create([
            'branch_id' => $branch->id,
            'room_number' => 1,
            'date' => now()->addDay()->format('Y-m-d'),
            'start_time' => '13:00',
            'end_time' => '14:00',
        ]);

        $this->postJson('/api/bookings', $this->payload('13:00'))->assertCreated();

        $res = $this->postJson('/api/bookings', $this->payload('13:00'));
        $res->assertStatus(422);
        $this->assertTrue($res->json('full') === true);
    }

    public function test_blocking_all_rooms_closes_the_slot(): void
    {
        $branch = Branch::where('name', $this->branch)->first();
        $date = now()->addDay()->format('Y-m-d');

        foreach ([1, 2] as $room) {
            \App\Models\BlockedSlot::create([
                'branch_id' => $branch->id,
                'room_number' => $room,
                'date' => $date,
                'start_time' => '13:00',
                'end_time' => '14:00',
            ]);
        }

        $res = $this->postJson('/api/bookings', $this->payload('13:00'));
        $res->assertStatus(422);
    }

    public function test_auto_assign_picks_an_active_therapist(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload('14:00', null));

        $res->assertCreated();
        $therapistId = $res->json('booking.therapist_id');
        $this->assertNotNull($therapistId);
        $this->assertSame('Active', Therapist::find($therapistId)->status);
    }

    public function test_specific_therapist_conflict_is_rejected(): void
    {
        $therapist = Therapist::first();

        $this->postJson('/api/bookings', $this->payload('15:00', $therapist->id))->assertCreated();

        // Same therapist, same slot: conflict (409)
        $this->postJson('/api/bookings', $this->payload('15:00', $therapist->id))->assertStatus(409);
    }
}