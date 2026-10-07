<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Branch;
use App\Models\Service;
use App\Models\Therapist;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminBookingServicesTest extends TestCase
{
    use RefreshDatabase;

    private Branch $branch;

    protected function setUp(): void
    {
        parent::setUp();

        $this->branch = Branch::create(['name' => 'Jakarta Barat', 'rooms_count' => 5, 'sort_order' => 1]);
        Therapist::create(['name' => 'Ayu', 'phone' => '08', 'specialty' => null, 'experience_years' => 0, 'status' => 'Active', 'branch_id' => $this->branch->id]);

        Service::create(['name' => 'Brazilian', 'description' => 'x', 'price' => 200000, 'duration_minutes' => 30, 'category' => 'intimate', 'status' => 'Active']);
        Service::create(['name' => 'Eyebrows', 'description' => 'x', 'price' => 47000, 'duration_minutes' => 15, 'category' => 'face', 'status' => 'Active']);
        Service::create(['name' => 'Underarms', 'description' => 'x', 'price' => 60000, 'duration_minutes' => 15, 'category' => 'arms', 'status' => 'Active']);
        Service::create(['name' => 'Full Legs', 'description' => 'x', 'price' => 120000, 'duration_minutes' => 30, 'category' => 'legs', 'status' => 'Active']);

        $admin = User::create([
            'name' => 'Admin Jakbar',
            'email' => 'adminjakbar@buluspace.com',
            'password' => 'adminjakbar123',
            'role' => 'Admin',
            'branch_id' => $this->branch->id,
        ]);
        Sanctum::actingAs($admin);
    }

    private function serviceIds(array $names): array
    {
        return Service::whereIn('name', $names)->pluck('id')->all();
    }

    private function makeBooking(string $status = 'Confirmed', string $start = '16:00', string $end = '16:45'): Appointment
    {
        $service = Service::where('name', 'Brazilian')->first();
        $appointment = Appointment::create([
            'booking_code' => 'BS-'.str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT),
            'therapist_id' => Therapist::first()->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'start_time' => $start,
            'end_time' => $end,
            'status' => $status,
            'customer_name' => 'Test',
            'customer_phone' => '081234567890',
            'customer_email' => 'test@example.com',
            'customer_gender' => 'Wanita',
            'location' => 'Jakarta Barat',
            'total_price' => $service->price,
        ]);
        $appointment->details()->create(['service_id' => $service->id, 'quantity' => 1, 'price' => $service->price]);

        return $appointment;
    }

    public function test_swap_services_within_slot_shifts_end_time_and_recalculates_price(): void
    {
        $booking = $this->makeBooking();

        // Slot 45 menit; diganti Full Legs (30) + Underarms (15) = 45 -> end time tetap.
        $res = $this->putJson('/api/admin/bookings/'.$booking->id.'/services', [
            'service_ids' => $this->serviceIds(['Full Legs', 'Underarms']),
        ]);

        $res->assertOk();
        $booking->refresh();

        $this->assertSame('16:45', $booking->end_time);
        $this->assertSame(180000.0, (float) $booking->total_price);
        $this->assertSame(2, $booking->details()->count());
    }

    public function test_shorter_duration_shifts_end_time_earlier(): void
    {
        $booking = $this->makeBooking();

        // Slot 45 menit; diganti Underarms (15) saja -> end time jadi 16:15.
        $res = $this->putJson('/api/admin/bookings/'.$booking->id.'/services', [
            'service_ids' => $this->serviceIds(['Underarms']),
        ]);

        $res->assertOk();
        $this->assertSame('16:15', $booking->fresh()->end_time);
        $this->assertSame(60000.0, (float) $booking->fresh()->total_price);
    }

    public function test_over_slot_duration_is_rejected(): void
    {
        $booking = $this->makeBooking();

        // Slot 45 menit; Full Legs (30) + Brazilian (30) = 60 -> 422.
        $res = $this->putJson('/api/admin/bookings/'.$booking->id.'/services', [
            'service_ids' => $this->serviceIds(['Full Legs', 'Brazilian']),
        ]);

        $res->assertStatus(422);
        $this->assertStringContainsString('melebihi slot', $res->json('message'));
        $this->assertSame(1, $booking->details()->count());
    }

    public function test_non_confirmed_booking_cannot_be_edited(): void
    {
        $booking = $this->makeBooking('Completed');

        $res = $this->putJson('/api/admin/bookings/'.$booking->id.'/services', [
            'service_ids' => $this->serviceIds(['Underarms']),
        ]);

        $res->assertStatus(422);
        $this->assertStringContainsString('Confirmed', $res->json('message'));
    }

    public function test_male_cannot_assign_intimate_services(): void
    {
        $booking = $this->makeBooking('Confirmed');
        $booking->update(['customer_gender' => 'Pria']);

        $res = $this->putJson('/api/admin/bookings/'.$booking->id.'/services', [
            'service_ids' => $this->serviceIds(['Brazilian']),
        ]);

        $res->assertStatus(422);
        $this->assertStringContainsString('intimate', strtolower($res->json('message')));
    }
}