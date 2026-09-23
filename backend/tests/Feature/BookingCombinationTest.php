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
            'full_front' => $make('Full Front', 'upper', 30),
            'full_back' => $make('Full Back', 'upper', 30),
            'forehead' => $make('Forehead', 'face', 10),
            'cheek' => $make('Cheek', 'face', 10),
            'underarms' => $make('Underarms', 'arms', 15),
            'feel_smooth' => $make('Feel Smooth', 'package', 60),
            'clean_girl' => $make('Clean Girl', 'package', 45),
        ];
    }

    private function payload(array $serviceIds, string $gender = 'Wanita'): array
    {
        return [
            'customer_name' => 'Test',
            'customer_phone' => '081234567890',
            'customer_email' => 'test@example.com',
            'customer_gender' => $gender,
            'therapist_id' => null,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'start_time' => '13:00',
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

    public function test_brazilian_cannot_combine_with_full_treatment(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['brazilian', 'full_legs'])));

        $res->assertStatus(422);
        $this->assertStringContainsString('Brazilian tidak bisa digabung dengan Full Legs', $res->json('message'));
    }

    public function test_feel_smooth_can_combine_with_allowed_treatments(): void
    {
        $this->postJson('/api/bookings', $this->payload($this->ids(['feel_smooth', 'forehead', 'underarms', 'cheek'])))->assertCreated();
    }

    public function test_feel_smooth_cannot_combine_with_long_treatment(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['feel_smooth', 'full_arms'])));

        $res->assertStatus(422);
        $this->assertStringContainsString('Feel Smooth hanya bisa digabung dengan Eyebrows, Upper Lip, Chin, Cheek, Forehead, Underarms, Chest, Stomach, Buttocks,', $res->json('message'));
    }

    public function test_feel_smooth_cannot_combine_with_half_arms_even_if_15_minutes(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['feel_smooth', 'half_arms'])));

        $res->assertStatus(422);
        $this->assertStringContainsString('Feel Smooth hanya bisa digabung dengan Eyebrows, Upper Lip, Chin, Cheek, Forehead, Underarms, Chest, Stomach, Buttocks,', $res->json('message'));
    }

    public function test_feel_smooth_total_duration_is_60_minutes(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['feel_smooth', 'forehead', 'underarms'])));

        $res->assertCreated();
        $appointment = $res->json('booking');
        $start = $appointment['start_time'];
        $end = $appointment['end_time'];
        $startMin = (int) substr($start, 0, 2) * 60 + (int) substr($start, 3, 2);
        $endMin = (int) substr($end, 0, 2) * 60 + (int) substr($end, 3, 2);
        $this->assertSame(60, $endMin - $startMin);
    }

    public function test_package_must_be_ordered_alone(): void
    {
        $res = $this->postJson('/api/bookings', $this->payload($this->ids(['clean_girl', 'forehead'])));

        $res->assertStatus(422);
        $this->assertStringContainsString('Clean Girl hanya bisa dipilih sendiri', $res->json('message'));
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
}