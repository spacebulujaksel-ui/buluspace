<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\EmailSetting;
use Illuminate\Support\Facades\Mail;

class BookingMailer
{
    public const ADMIN_WA = '6281285356113';

    public static function toCustomer(Appointment $appointment, string $type): void
    {
        $setting = EmailSetting::where('type', $type)->first();
        if (!$setting || blank($appointment->customer_email)) {
            return;
        }

        try {
            Mail::html(
                self::render($setting, self::data($appointment)),
                fn ($m) => $m->to($appointment->customer_email)->subject($setting->subject)
            );
        } catch (\Throwable $e) {
            logger()->error('Email "'.$type.'" gagal: '.$e->getMessage());
        }
    }

    public static function toAdmin(Appointment $appointment): void
    {
        $setting = EmailSetting::where('type', 'admin_notification')->first();
        $adminEmail = EmailSetting::where('type', 'admin_email')->value('body');

        if (!$setting || blank($adminEmail)) {
            return;
        }

        try {
            Mail::html(
                self::render($setting, self::data($appointment, true)),
                fn ($m) => $m->to($adminEmail)->subject($setting->subject)
            );
        } catch (\Throwable $e) {
            logger()->error('Email admin_notification gagal: '.$e->getMessage());
        }
    }

    private static function data(Appointment $appointment, bool $full = false): array
    {
        $services = $appointment->details
            ->map(fn ($d) => $d->service?->name ?? 'Layanan #'.$d->service_id)
            ->filter()
            ->implode(', ');

        return [
            'customer_name' => $appointment->customer_name,
            'customer_phone' => $appointment->customer_phone,
            'customer_email' => $appointment->customer_email,
            'booking_code' => $appointment->booking_code,
            'date' => $appointment->appointment_date ? $appointment->appointment_date->format('d/m/Y') : '-',
            'time' => substr($appointment->start_time, 0, 5).' - '.substr($appointment->end_time, 0, 5).' WIB',
            'branch' => $appointment->location ?? '-',
            'therapist' => $appointment->therapist?->name ?? 'Menunggu penugasan',
            'services' => $services ?: '-',
            'total' => 'Rp '.number_format((float) $appointment->total_price, 0, ',', '.'),
            'admin_wa' => self::ADMIN_WA,
        ] + ($full ? [] : []);
    }

    private static function render(EmailSetting $setting, array $data): string
    {
        $text = $setting->body ?? '';

        foreach ($data as $key => $value) {
            $text = str_replace('{{'.$key.'}}', (string) ($value ?? ''), $text);
        }

        return nl2br(e($text));
    }
}