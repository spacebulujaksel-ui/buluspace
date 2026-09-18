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

        $branch = Branch::create(['name' => $this->branch, 'rooms_count' => 2, 'sort_order' => 1]);
        foreach (['Ayu', 'Bella', 'Cinta', 'Dewi'] as $name) {
            Therapist::create(['name' => $name, 'phone' => '08'.$name, 'specialty' => null, 'experience_years' => 0, 'status' => 'Active', 'branch_id' => $branch->id]);
        }

        $this->service = Service::create(['name' => 'Brazilian', 'description' => null, 'price' => 200000, 'duration_minutes' => 60, 'category' => 'intimate', 'status' => 'Active']);
    }

    private function payload(string $time, ?int $therapistId = null, string $gender = 'Wanita'): array
    {
        return [
            'customer_name' => 'Test Client',
            'customer_phone' => '081234567890',
            'customer_email' => 'client@example.com',
            'customer_gender' => $gender,
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

    public function test_male_surcharge_per_treatment_is_added(): void
    {
        $second = Service::create(['name' => 'Underarm', 'description' => null, 'price' => 85000, 'duration_minutes' => 30, 'category' => 'body', 'status' => 'Active']);

        $payload = $this->payload('16:00', null, 'Pria');
        $payload['service_ids'] = [$this->service->id, $second->id];

        $res = $this->postJson('/api/bookings', $payload);
        $res->assertCreated();

        // 2 treatments + 2 x 7.000 surcharge
        $this->assertSame(200000.0 + 85000.0 + 14000.0, (float) $res->json('booking.total_price'));
        $this->assertSame('Pria', $res->json('booking.customer_gender'));
    }

    public function test_female_has_no_surcharge(): void
    {
        $this->postJson('/api/bookings', $this->payload('16:30', null, 'Wanita'))->assertCreated();

        $apt = \App\Models\Appointment::orderByDesc('id')->first();
        $this->assertSame(200000.0, (float) $apt->total_price);
        $this->assertSame('Wanita', $apt->customer_gender);
    }

    public function test_gender_is_required(): void
    {
        $this->postJson('/api/bookings', $this->payload('17:00', null, ''))->assertStatus(422);
    }

    public function test_booking_today_within_30_minutes_is_rejected(): void
    {
        $payload = $this->payload(now()->addMinutes(5)->format('H:i'));
        $payload['appointment_date'] = now()->format('Y-m-d');

        $this->postJson('/api/bookings', $payload)->assertStatus(422);
    }

    public function test_booking_today_after_30_minutes_is_accepted(): void
    {
        $payload = $this->payload(now()->addMinutes(40)->format('H:i'));
        $payload['appointment_date'] = now()->format('Y-m-d');

        $this->postJson('/api/bookings', $payload)->assertCreated();
    }

    public function test_auto_assign_only_picks_therapist_from_selected_branch(): void
    {
        $barat = Branch::where('name', 'Jakarta Barat')->first()->id;
        $selatan = Branch::create(['name' => 'Jakarta Selatan', 'rooms_count' => 3, 'sort_order' => 2])->id;
        Therapist::create(['name' => 'Ira', 'phone' => '08', 'specialty' => null, 'experience_years' => 0, 'status' => 'Active', 'branch_id' => $selatan]);

        $res = $this->postJson('/api/bookings', $this->payload('14:30', null));

        $res->assertCreated();
        $assigned = Therapist::find($res->json('booking.therapist_id'));
        $this->assertSame($barat, $assigned->branch_id);
        $this->assertSame('Active', $assigned->status);
    }

    public function test_public_therapists_include_branch_and_no_photo(): void
    {
        $res = $this->getJson('/api/therapists');

        $res->assertOk();
        $first = collect($res->json())->first();
        $this->assertArrayHasKey('branch_id', $first);
        $this->assertSame('Jakarta Barat', $first['branch']['name']);
        $this->assertArrayNotHasKey('photo', $first);
    }
}