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

    public function test_rekomendasi_booking_does_not_block_specific_therapist(): void
    {
        $therapist = Therapist::first();
        $date = now()->addDay()->format('Y-m-d');

        \App\Models\Appointment::create([
            'booking_code' => 'BS-AUTO1',
            'therapist_id' => $therapist->id,
            'appointment_date' => $date,
            'start_time' => '15:00',
            'end_time' => '16:00',
            'status' => 'Confirmed',
            'customer_name' => 'Auto Assign',
            'customer_phone' => '081',
            'location' => $this->branch,
            'total_price' => 200000,
            'is_auto_assign' => true,
        ]);

        // Customer yang eksplisit memilih terapis yang sama di jam yang sama TETAP boleh.
        $this->postJson('/api/bookings', $this->payload('15:00', $therapist->id))->assertCreated();
    }

    public function test_male_surcharge_per_treatment_is_added(): void
    {
        $first = Service::create(['name' => 'Forehead', 'description' => null, 'price' => 37000, 'duration_minutes' => 10, 'category' => 'face', 'status' => 'Active']);
        $second = Service::create(['name' => 'Underarm', 'description' => null, 'price' => 85000, 'duration_minutes' => 30, 'category' => 'body', 'status' => 'Active']);

        $payload = $this->payload('16:00', null, 'Pria');
        $payload['service_ids'] = [$first->id, $second->id];

        $res = $this->postJson('/api/bookings', $payload);
        $res->assertCreated();

        // 2 treatments + 2 x 7.000 surcharge
        $this->assertSame(37000.0 + 85000.0 + 14000.0, (float) $res->json('booking.total_price'));
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

    private function fiveRoomsSevenTherapists(): void
    {
        $branch = Branch::where('name', $this->branch)->first();
        $branch->update(['rooms_count' => 5]);
        foreach (['Elsa', 'Fajar', 'Gita'] as $name) {
            Therapist::create(['name' => $name, 'phone' => '08'.$name, 'specialty' => null, 'experience_years' => 0, 'status' => 'Active', 'branch_id' => $branch->id]);
        }
    }

    private function seedExistingBooking(string $start, string $end, int $therapistIndex): void
    {
        $therapists = Therapist::where('branch_id', Branch::where('name', $this->branch)->first()->id)->orderBy('id')->get();

        \App\Models\Appointment::create([
            'booking_code' => 'BS-'.str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT),
            'therapist_id' => $therapists[$therapistIndex]->id,
            'appointment_date' => now()->addDay()->format('Y-m-d'),
            'start_time' => $start,
            'end_time' => $end,
            'status' => 'Confirmed',
            'customer_name' => 'Existing',
            'customer_phone' => '081234567890',
            'customer_email' => 'existing@example.com',
            'customer_gender' => 'Wanita',
            'location' => $this->branch,
            'total_price' => 200000,
            'is_auto_assign' => true,
        ]);
    }

    public function test_sequential_bookings_leave_room_free_for_the_whole_hour(): void
    {
        $this->fiveRoomsSevenTherapists();

        // Kasus 3 Okt: 14:00-14:30 satu sesi lalu 14:30-15:00 empat sesi = 5 booking di
        // dalam window, tapi tidak pernah 5 bersamaan -> room masih muat untuk 1 jam.
        $this->seedExistingBooking('14:00', '14:30', 0);
        for ($i = 1; $i < 5; $i++) {
            $this->seedExistingBooking('14:30', '15:00', $i);
        }

        $this->postJson('/api/bookings', $this->payload('14:00'))->assertCreated();
    }

    public function test_full_hour_is_rejected_when_five_bookings_run_in_parallel(): void
    {
        $this->fiveRoomsSevenTherapists();

        for ($i = 0; $i < 5; $i++) {
            $this->seedExistingBooking('14:00', '15:00', $i);
        }

        $res = $this->postJson('/api/bookings', $this->payload('14:00'));

        $res->assertStatus(422);
        $this->assertTrue($res->json('full') === true);
    }

    public function test_blocked_room_counts_against_peak_not_booking_count(): void
    {
        $this->fiveRoomsSevenTherapists();
        $branch = Branch::where('name', $this->branch)->first();

        \App\Models\BlockedSlot::create([
            'branch_id' => $branch->id,
            'room_number' => 1,
            'date' => now()->addDay()->format('Y-m-d'),
            'start_time' => '14:00',
            'end_time' => '15:00',
        ]);

        // 4 booking berurutan (puncak 4) + 1 ruang diblokir = 4 ruang tersedia -> muat.
        $this->seedExistingBooking('14:00', '14:30', 0);
        for ($i = 1; $i < 4; $i++) {
            $this->seedExistingBooking('14:30', '15:00', $i);
        }

        $this->postJson('/api/bookings', $this->payload('14:00'))->assertCreated();
    }

    public function test_room_is_free_but_all_therapists_busy_rejects_with_therapist_message(): void
    {
        $this->fiveRoomsSevenTherapists();

        // 7 terapis semuanya sibuk di window, puncak hanya 4 dari 5 ruang.
        for ($i = 0; $i < 4; $i++) {
            $this->seedExistingBooking('14:00', '14:30', $i);
        }
        for ($i = 4; $i < 7; $i++) {
            $this->seedExistingBooking('14:30', '15:00', $i);
        }

        $res = $this->postJson('/api/bookings', $this->payload('14:00'));

        $res->assertStatus(422);
        $this->assertStringContainsString('terapis', strtolower($res->json('message')));
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