<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailSetting;
use Illuminate\Http\Request;

class EmailSettingController extends Controller
{
    private const TEMPLATES = [
        'booking_confirmation',
        'admin_notification',
        'reminder_h1',
        'reminder_hours',
        'aftercare',
        'booking_cancelled',
        'booking_cancelled_by_studio',
    ];

    public function index()
    {
        $settings = EmailSetting::whereIn('type', self::TEMPLATES)->get()->keyBy('type');
        $adminEmail = EmailSetting::where('type', 'admin_email')->value('body');
        $brandLogoUrl = EmailSetting::where('type', 'brand_logo_url')->value('body');

        $templates = collect(self::TEMPLATES)->mapWithKeys(fn (string $type) => [
            $type => [
                'subject' => $settings[$type]->subject ?? '',
                'body' => (string) ($settings[$type]->body ?? ''),
            ],
        ]);

        return response()->json([
            'templates' => $templates,
            'admin_email' => (string) ($adminEmail ?? ''),
            'brand_logo_url' => (string) ($brandLogoUrl ?? ''),
            'admin_wa' => \App\Services\BookingMailer::ADMIN_WA,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'templates' => 'required|array',
            'templates.*.subject' => 'required|string|max:200',
            'templates.*.body' => 'required|string',
            'admin_email' => 'required|email',
            'brand_logo_url' => 'nullable|string|max:500',
        ]);

        foreach (self::TEMPLATES as $type) {
            if (!isset($validated['templates'][$type])) {
                continue;
            }

            EmailSetting::updateOrCreate(['type' => $type], [
                'subject' => $validated['templates'][$type]['subject'],
                'body' => $validated['templates'][$type]['body'],
            ]);
        }

        EmailSetting::updateOrCreate(['type' => 'admin_email'], [
            'subject' => '',
            'body' => $validated['admin_email'],
        ]);

        EmailSetting::updateOrCreate(['type' => 'brand_logo_url'], [
            'subject' => '',
            'body' => trim($validated['brand_logo_url'] ?? ''),
        ]);

        return response()->json(['message' => 'Pengaturan email diperbarui.']);
    }
}