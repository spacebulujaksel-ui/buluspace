<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\EmailSetting;
use Illuminate\Support\Facades\Mail;

class BookingMailer
{
    public const ADMIN_WA = '6285691717248';

    private const WA_BY_BRANCH = [
        'Jakarta Barat' => '6285691717248',
        'Jakarta Selatan' => '6285811331147',
    ];

    private static function waForBranch(?string $branch): string
    {
        return self::WA_BY_BRANCH[$branch] ?? self::ADMIN_WA;
    }

    public static function toCustomer(Appointment $appointment, string $type): bool
    {
        $setting = EmailSetting::where('type', $type)->first();
        if (!$setting || blank($appointment->customer_email)) {
            return false;
        }

        try {
            Mail::html(
                self::render($setting, self::data($appointment)),
                fn ($m) => $m->to($appointment->customer_email)->subject($setting->subject)
            );

            return true;
        } catch (\Throwable $e) {
            logger()->error('Email "'.$type.'" gagal ('.$appointment->booking_code.'): '.$e->getMessage());

            return false;
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
            'therapist' => $appointment->therapist_display ?? 'Menunggu penugasan',
            'services' => $services ?: '-',
            'total' => 'Rp '.number_format((float) $appointment->total_price, 0, ',', '.'),
            'cancel_reason' => $appointment->cancel_reason ?: 'Dibatalkan tanpa alasan.',
            'admin_wa' => self::waForBranch($appointment->location),
        ] + ($full ? [] : []);
    }

    private static function render(EmailSetting $setting, array $data): string
    {
        $text = $setting->body ?? '';

        foreach ($data as $key => $value) {
            $text = str_replace('{{'.$key.'}}', (string) ($value ?? ''), $text);
        }

        return self::wrap(nl2br(e($text)));
    }

    private static function wrap(string $bodyHtml): string
    {
        $logo = EmailSetting::where('type', 'brand_logo_url')->value('body');
        $logoHtml = '';

        if ($logo) {
            $logoUrl = e(trim($logo));
            $logoHtml = '<div style="padding-bottom:14px;">'
                .'<img src="'.$logoUrl.'" alt="Bulu Space" style="height:44px;width:auto;max-width:180px;"/>'
                .'</div>'
                .'<div style="height:3px;background:#FAC9D2;border-radius:2px;margin-bottom:20px;"></div>';
        }

        return '<div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;font-size:14px;line-height:1.6;">'
            .'<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:28px 24px;">'
            .$logoHtml
            .$bodyHtml
            .'<p style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;">'
            .'Dikirim otomatis oleh Bulu Space — balas email ini hanya jika diperlukan.</p>'
            .'</td></tr></table></div>';
    }
}