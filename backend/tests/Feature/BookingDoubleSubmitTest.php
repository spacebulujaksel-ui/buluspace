<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Branch;
use App\Models\Service;
use App\Models\Therapist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingDoubleSubmitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $branch = Branch::create(['name' => 'Jakarta Barat', 'rooms_count' => 5, 'sort_order' => 1]);
        foreach (['Ayu', 'Bella', 'Cinta', 'Dewi'] as $name) {
            Therapist::create(['name' => $name, 'phone' => '08'.$name, 'specialty' => null, 'experience_years' => 0, 'status' => 'Active', 'branch_id' => $branch->id]);
        }
        Service::create(['name' => 'Eyebrows', 'description' => null, 'price' => 47000, 'duration_minutes' => 15, 'category' => 'face', 'status' => 'Active']);
        Service::create(['name' => 'Brazilian', 'description' => null, 'price' => 90000, 'duration_minutes' => 30, 'category' => 'intimate', 'status' => 'Active']);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'customer_name' => 'Hanum Yulika',
            'customer_phone' => '0812999888777',
            'customer_email' => 'hanum@example.com',
            'customer_gender' => 'Wanita',
            'therapist_id' => null,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'start_time' => '16:00',
            'service_ids' => Service::orderBy('id')->pluck('id')->all(),
            'location' => 'Jakarta Barat',
        ], $overrides);
    }

    public function test_identical_resubmit_returns_the_same_booking_not_a_second_row(): void
    {
        $first = $this->postJson('/api/bookings', $this->payload());
        $first->assertCreated();

        // Retry timeout: payload identik, klien klik lagi.
        $second = $this->postJson('/api/bookings', $this->payload());
        $second->assertOk();
        $second->assertJsonPath('booking.booking_code', $first->json('booking.booking_code'));

        $this->assertSame(1, Appointment::count());
    }

    public function test_different_time_is_a_new_booking(): void
    {
        $this->postJson('/api/bookings', $this->payload(['start_time' => '16:00']))->assertCreated();
        $this->postJson('/api/bookings', $this->payload(['start_time' => '17:00']))->assertCreated();

        $this->assertSame(2, Appointment::count());
    }

    public function test_different_customer_same_slot_is_allowed(): void
    {
        $this->postJson('/api/bookings', $this->payload())->assertCreated();
        $this->postJson('/api/bookings', $this->payload([
            'customer_name' => 'Orang Lain',
            'customer_phone' => '081111111111',
            'customer_email' => 'lain@example.com',
        ]))->assertCreated();

        $this->assertSame(2, Appointment::count());
    }

    public function test_rebooking_allowed_after_previous_one_cancelled(): void
    {
        $first = $this->postJson('/api/bookings', $this->payload());
        $first->assertCreated();

        Appointment::where('booking_code', $first->json('booking.booking_code'))->update(['status' => 'Cancelled']);

        $this->postJson('/api/bookings', $this->payload())->assertCreated();
        $this->assertSame(2, Appointment::count());
    }

    public function test_same_customer_different_services_same_slot_is_allowed(): void
    {
        $eyebrows = Service::where('name', 'Eyebrows')->value('id');
        $brazilian = Service::where('name', 'Brazilian')->value('id');

        $this->postJson('/api/bookings', $this->payload(['service_ids' => [$eyebrows]]))->assertCreated();
        $this->postJson('/api/bookings', $this->payload(['service_ids' => [$brazilian]]))->assertCreated();

        $this->assertSame(2, Appointment::count());
    }
}
