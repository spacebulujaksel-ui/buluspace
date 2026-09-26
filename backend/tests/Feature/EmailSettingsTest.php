<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Branch;
use App\Models\EmailSetting;
use App\Models\Service;
use App\Models\Therapist;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EmailSettingsTest extends TestCase
{
    use RefreshDatabase;

    private function booking(string $date, string $start): Appointment
    {
        $branch = Branch::create(['name' => 'Jakarta Barat', 'rooms_count' => 2, 'sort_order' => 1]);
        $therapist = Therapist::create(['name' => 'Ayu', 'phone' => '08', 'specialty' => null, 'experience_years' => 0, 'status' => 'Active', 'branch_id' => $branch->id]);
        $service = Service::create(['name' => 'Underarms', 'category' => 'arms', 'duration_minutes' => 15, 'description' => 'x', 'wax_type' => 'x', 'price' => 50000, 'status' => 'Active']);

        $appointment = Appointment::create([
            'booking_code' => 'BS-'.random_int(100000, 999999),
            'therapist_id' => $therapist->id,
            'appointment_date' => $date,
            'start_time' => $start,
            'end_time' => '14:00',
            'status' => 'Pending',
            'customer_name' => 'Test',
            'customer_phone' => '081234567890',
            'customer_email' => 'customer@example.com',
            'customer_gender' => 'Wanita',
            'location' => 'Jakarta Barat',
            'total_price' => 50000,
        ]);

        $appointment->details()->create([
            'service_id' => $service->id,
            'quantity' => 1,
            'price' => 50000,
        ]);

        return $appointment;
    }

    public function test_h1_reminder_marks_booking_for_tomorrow(): void
    {
        $frozen = \Illuminate\Support\Carbon::parse('2026-01-15 07:30:00', 'Asia/Jakarta');
        \Illuminate\Support\Carbon::setTestNow($frozen);

        $appointment = $this->booking($frozen->copy()->addDay()->format('Y-m-d'), '13:00');

        $this->artisan('app:send-h1-reminders')->assertExitCode(0);

        $this->assertNotNull($appointment->fresh()->reminder_1_sent_at);
        \Illuminate\Support\Carbon::setTestNow();
    }

    public function test_h1_reminder_skips_outside_07_wib(): void
    {
        $frozen = \Illuminate\Support\Carbon::parse('2026-01-15 14:30:00', 'Asia/Jakarta');
        \Illuminate\Support\Carbon::setTestNow($frozen);

        $appointment = $this->booking($frozen->copy()->addDay()->format('Y-m-d'), '13:00');

        $this->artisan('app:send-h1-reminders')->assertExitCode(0);

        $this->assertNull($appointment->fresh()->reminder_1_sent_at);
        \Illuminate\Support\Carbon::setTestNow();
    }

    public function test_hour_reminder_marks_within_two_hours_and_does_not_double_send(): void
    {
        $now = now('Asia/Jakarta');
        $appointment = $this->booking($now->format('Y-m-d'), $now->addMinutes(20)->format('H:i'));

        $this->artisan('app:send-hour-reminders')->assertExitCode(0);
        $this->artisan('app:send-hour-reminders')->assertExitCode(0);

        $this->assertNotNull($appointment->fresh()->reminder_2_sent_at);
        $this->assertSame(1, Appointment::whereNotNull('reminder_2_sent_at')->count());
    }

    public function test_email_settings_defaults_are_seeded(): void
    {
        foreach (['booking_confirmation', 'admin_notification', 'reminder_h1', 'reminder_hours', 'aftercare', 'booking_cancelled', 'booking_cancelled_by_studio'] as $type) {
            $this->assertDatabaseHas('email_settings', ['type' => $type]);
        }
        $this->assertSame('spacebulujaksel@gmail.com', EmailSetting::where('type', 'admin_email')->value('body'));
        $this->assertStringContainsString('logo-bulu.png', EmailSetting::where('type', 'brand_logo_url')->value('body'));
    }

    public function test_email_settings_update_ignores_templates_missing_from_payload(): void
    {
        $this->actingAsAdmin();

        $this->putJson('/api/admin/email-settings', [
            'templates' => ['booking_confirmation' => ['subject' => 'Subjek Baru', 'body' => 'Isi baru']],
            'admin_email' => 'admin@buluspace.com',
        ])->assertOk();

        $this->assertSame('Subjek Baru', EmailSetting::where('type', 'booking_confirmation')->value('subject'));
        $this->assertSame(
            'Booking Dibatalkan – Bulu Space | {{booking_code}}',
            EmailSetting::where('type', 'booking_cancelled')->value('subject'),
        );
    }

    public function test_customer_cancel_sends_cancellation_email(): void
    {
        $appointment = $this->booking('2026-01-20', '13:00');

        $this->postJson('/api/bookings/'.$appointment->booking_code.'/cancel', [
            'reason' => 'Berubah rencana',
            'customer_phone' => '081234567890',
        ])->assertOk();

        $this->assertSame('Cancelled', $appointment->fresh()->status);
        $this->assertStringContainsString('Berubah rencana', $this->lastEmailBody());
        $this->assertStringNotContainsString('{{cancel_reason}}', $this->lastEmailBody());
    }

    public function test_admin_cancel_sends_studio_email_only_when_status_changes(): void
    {
        $appointment = $this->booking('2026-01-20', '13:00');
        $this->actingAsAdmin();

        $url = '/api/admin/bookings/'.$appointment->id.'/status';

        $this->putJson($url, ['status' => 'Cancelled', 'cancel_reason' => 'Studio penuh'])->assertOk();

        $this->assertSame('Cancelled', $appointment->fresh()->status);
        $this->assertStringContainsString('Studio penuh', $this->lastEmailBody());
        $this->assertStringContainsString(
            'Booking Anda Dibatalkan oleh Bulu Space',
            $this->lastEmailSubject(),
        );

        $sentBefore = count($this->sentEmails());

        $this->putJson($url, ['status' => 'Cancelled'])->assertOk();

        $this->assertCount($sentBefore, $this->sentEmails());
    }

    private function actingAsAdmin(): User
    {
        $admin = User::create([
            'name' => 'Admin Jakbar',
            'email' => 'adminjakbar@buluspace.com',
            'password' => 'adminjakbar123',
            'role' => 'Admin',
            'branch_id' => Branch::where('name', 'Jakarta Barat')->value('id'),
        ]);

        Sanctum::actingAs($admin);

        return $admin;
    }

    private function sentEmails(): array
    {
        return Mail::mailer('array')->getSymfonyTransport()->messages()->all();
    }

    private function lastEmailBody(): string
    {
        $emails = $this->sentEmails();
        $this->assertNotEmpty($emails, 'Tidak ada email terkirim.');

        return (string) $emails[array_key_last($emails)]->getOriginalMessage()->getHtmlBody();
    }

    private function lastEmailSubject(): string
    {
        $emails = $this->sentEmails();

        return (string) $emails[array_key_last($emails)]->getOriginalMessage()->getSubject();
    }

    public function test_email_settings_can_be_updated(): void
    {
        EmailSetting::where('type', 'booking_confirmation')->update(['subject' => 'Subjek Baru', 'body' => 'Isi baru']);

        $this->assertSame('Subjek Baru', EmailSetting::where('type', 'booking_confirmation')->value('subject'));
    }
}