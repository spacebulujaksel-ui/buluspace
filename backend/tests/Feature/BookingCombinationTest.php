<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Service;
use App\Models\Therapist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingCombinationTest extends TestCase
{
    use RefreshDatabase;

    private array $services = [];

    protected function setUp(): void
    {
        parent::setUp();

        $branch = Branch::create(['name' => 'Jakarta Barat', 'rooms_count' => 5, 'sort_order' => 1]);
        foreach (['Ayu', 'Bella', 'Cinta', 'Dewi'] as $name) {
            Therapist::create(['name' => $name, 'phone' => '08'.$name, 'specialty' => null, 'experience_years' => 0, 'status' => 'Active', 'branch_id' => $branch->id]);
        }

        $make = fn (string $name, string $category, int $duration, float $price = 50000) => Service::create([
            'name' => $name, 'category' => $category, 'duration_minutes' => $duration,
            'description' => $name, 'wax_type' => 'x', 'price' => $price, 'status' => 'Active',
        ]);

        $this->services = [
            'brazilian' => $make('Brazilian', 'intimate', 30),
            'full_legs' => $make('Full Legs', 'legs', 30),
            'full_arms' => $make('Full Arms', 'arms', 30),
            'half_arms' => $make('Half Arms', 'arms', 20),
            'half_legs' => $make('Half Legs', 'legs', 25),
            'full_front' => $make('Full Front', 'upper', 30),
            'full_back' => $make('Full Back', 'upper', 30),
            'forehead' => $make('Forehead', 'face', 10),
            'cheek' => $make('Cheek', 'face', 10),
            'underarms' => $make('Underarms', 'arms', 15),
            'feel_smooth' => $make('Feel Smooth', 'package', 60),
            'clean_girl' => $make('Clean Girl', 'package', 45),
        ];
        $this->services['full_legs']->update(['last_order_time' => '18:00']);
    }

    private function payload(array $serviceIds, string $gender = 'Wanita', string $startTime = '13:00'): array
    {
        return [
            'customer_name' => 'Test',
            'customer_phone' => '081234567890',
            'customer_email' => 'test@example.com',
            'customer_gender' => $gender,
            'therapist_id' => null,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'start_time' => $startTime,
            'service_ids' => $serviceIds,
            'location' => 'Jakarta Barat',
        ];
    }

    private function ids(array $keys): array
    {
        return collect($keys)->map(fn ($k) => $this->services[$k]->id)->all();
    }

    public function test_brazilian_can_combine_with_short_treatments(): void
    {
        $this->postJson('/api/bookings', $this->payload($this->ids(['brazilian', 'forehead'])))->assertCreated();
    }

    public function test_brazilian_can_combine_with_half_arms(): void
    {
        $this->postJson('/api/bookings', $this->payload($this->ids(['brazilian', 'half_arms'])))->assertCreated();
    }

    public function test_brazilian_absorbs_short_addons(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['brazilian', 'half_legs', 'forehead'])));

        $res->assertCreated();
        $this->assertSame(30, $this->durationMinutes($res->json('booking')));
    }

    public function test_brazilian_absorbs_single_short_addon(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['brazilian', 'forehead'])));

        $res->assertCreated();
        $this->assertSame(30, $this->durationMinutes($res->json('booking')));
    }

    public function test_brazilian_absorbs_underarms(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['brazilian', 'underarms'])));

        $res->assertCreated();
        $this->assertSame(30, $this->durationMinutes($res->json('booking')));
    }

    public function test_brazilian_plus_full_legs_adds_duration(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['brazilian', 'full_legs'])));

        $res->assertCreated();
        $this->assertSame(60, $this->durationMinutes($res->json('booking')));
    }

    public function test_brazilian_absorbs_short_addon_when_combined_with_long(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['brazilian', 'full_legs', 'forehead'])));

        $res->assertCreated();
        $this->assertSame(60, $this->durationMinutes($res->json('booking')));
    }

    public function test_brazilian_plus_clean_girl_adds_duration(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['brazilian', 'clean_girl'])));

        $res->assertCreated();
        $this->assertSame(75, $this->durationMinutes($res->json('booking')));
    }

    public function test_brazilian_can_combine_with_full_legs(): void
    {
        $this->postJson('/api/bookings', $this->payload($this->ids(['brazilian', 'full_legs'])))->assertCreated();
    }

    public function test_feel_smooth_can_combine_with_allowed_treatments(): void
    {
        $this->postJson('/api/bookings', $this->payload($this->ids(['feel_smooth', 'forehead', 'underarms', 'cheek'])))->assertCreated();
    }

    public function test_feel_smooth_can_combine_with_long_treatment(): void
    {
        $this->postJson('/api/bookings', $this->payload($this->ids(['feel_smooth', 'full_arms'])))->assertCreated();
    }

    public function test_feel_smooth_can_combine_with_half_arms(): void
    {
        $this->postJson('/api/bookings', $this->payload($this->ids(['feel_smooth', 'half_arms'])))->assertCreated();
    }

    public function test_feel_smooth_absorbs_short_addons(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['feel_smooth', 'forehead', 'underarms'])));

        $res->assertCreated();
        $this->assertSame(60, $this->durationMinutes($res->json('booking')));
    }

    public function test_feel_smooth_absorbs_underarms(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['feel_smooth', 'underarms'])));

        $res->assertCreated();
        $this->assertSame(60, $this->durationMinutes($res->json('booking')));
    }

    public function test_feel_smooth_half_arms_adds_duration(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['feel_smooth', 'half_arms'])));

        $res->assertCreated();
        $this->assertSame(80, $this->durationMinutes($res->json('booking')));
    }

    public function test_feel_smooth_plus_full_arms_adds_duration(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['feel_smooth', 'full_arms'])));

        $res->assertCreated();
        $this->assertSame(90, $this->durationMinutes($res->json('booking')));
    }

    public function test_feel_smooth_plus_brazilian_total_duration_is_90_minutes(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['feel_smooth', 'brazilian'])));

        $res->assertCreated();
        $this->assertSame(90, $this->durationMinutes($res->json('booking')));
    }

    public function test_feel_smooth_plus_brazilian_absorbs_underarms(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['feel_smooth', 'brazilian', 'underarms'])));

        $res->assertCreated();
        $this->assertSame(90, $this->durationMinutes($res->json('booking')));
    }

    public function test_feel_smooth_plus_brazilian_absorbs_half_arms(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['feel_smooth', 'brazilian', 'half_arms'])));

        $res->assertCreated();
        $this->assertSame(90, $this->durationMinutes($res->json('booking')));
    }

    public function test_package_can_be_combined(): void
    {
        $this->postJson('/api/bookings', $this->payload($this->ids(['clean_girl', 'forehead'])))->assertCreated();
    }

    public function test_full_legs_can_combine_with_other_treatments(): void
    {
        $this->postJson('/api/bookings', $this->payload($this->ids(['full_legs', 'forehead'])))->assertCreated();
    }

    public function test_full_back_can_combine_with_other_treatments(): void
    {
        $this->postJson('/api/bookings', $this->payload($this->ids(['full_back', 'forehead'])))->assertCreated();
    }

    public function test_full_front_and_back_can_combine_together_with_others(): void
    {
        $this->postJson('/api/bookings', $this->payload($this->ids(['full_front', 'full_back', 'forehead'])))->assertCreated();
    }

    public function test_normal_singles_can_combine_freely(): void
    {
        $this->postJson('/api/bookings', $this->payload($this->ids(['forehead', 'underarms'])))->assertCreated();
    }

    public function test_regular_combination_duration_is_sum_of_treatments(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['forehead', 'full_legs'])));

        $res->assertCreated();
        $appointment = $res->json('booking');
        $startMin = (int) substr($appointment['start_time'], 0, 2) * 60 + (int) substr($appointment['start_time'], 3, 2);
        $endMin = (int) substr($appointment['end_time'], 0, 2) * 60 + (int) substr($appointment['end_time'], 3, 2);
        $this->assertSame(40, $endMin - $startMin);
    }

    public function test_male_cannot_book_intimate_services(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['brazilian']), 'Pria'));

        $res->assertStatus(422);
        $this->assertStringContainsString('Layanan intimate hanya untuk wanita.', $res->json('message'));
    }

    public function test_female_can_book_intimate_services(): void
    {
        $this->postJson('/api/bookings', $this->payload($this->ids(['brazilian']), 'Wanita'))->assertCreated();
    }

    public function test_brazilian_can_combine_with_underarms(): void
    {
        $this->postJson('/api/bookings', $this->payload($this->ids(['brazilian', 'underarms'])))->assertCreated();
    }

    public function test_booking_past_closing_time_is_rejected(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['forehead']), 'Wanita', '18:55'));

        $res->assertStatus(422);
        $this->assertStringContainsString('melewati jam tutup', $res->json('message'));
    }

    public function test_booking_at_exact_closing_cutoff_is_accepted(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['forehead']), 'Wanita', '18:50'));

        $res->assertCreated();
        $this->assertSame('19:00', $res->json('booking.end_time'));
    }

    public function test_full_legs_static_cutoff_18_00_is_respected(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['full_legs']), 'Wanita', '18:30'));

        $res->assertStatus(422);
        $this->assertStringContainsString('melewati jam tutup', $res->json('message'));
    }

    public function test_full_legs_booking_at_static_cutoff_18_00_is_accepted(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['full_legs']), 'Wanita', '18:00'));

        $res->assertCreated();
        $this->assertSame('18:30', $res->json('booking.end_time'));
    }

    private function durationMinutes(array $appointment): int
    {
        $startMin = (int) substr($appointment['start_time'], 0, 2) * 60 + (int) substr($appointment['start_time'], 3, 2);
        $endMin = (int) substr($appointment['end_time'], 0, 2) * 60 + (int) substr($appointment['end_time'], 3, 2);

        return $endMin - $startMin;
    }
}