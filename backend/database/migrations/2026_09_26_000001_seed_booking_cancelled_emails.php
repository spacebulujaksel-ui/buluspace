<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const DEFAULTS = [
        'booking_cancelled' => [
            'subject' => 'Booking Dibatalkan – Bulu Space | {{booking_code}}',
            'body' => "Halo Kak {{customer_name}},\n\nBooking treatment Kakak di Bulu Space sudah dibatalkan. Berikut detail pembatalannya:\n\nDETAIL BOOKING\nKode Booking : {{booking_code}}\nTanggal : {{date}}\nWaktu : {{time}}\nLokasi : {{branch}}\nTreatment : {{services}}\nStatus : DIBATALKAN\nAlasan : {{cancel_reason}}\n\nApabila Kakak ingin memilih jadwal lain, silakan booking kembali melalui website Bulu Space atau hubungi WhatsApp admin di {{admin_wa}}.\n\nTerima kasih,\nBulu Space",
        ],
        'booking_cancelled_by_studio' => [
            'subject' => 'Booking Anda Dibatalkan oleh Bulu Space | {{booking_code}}',
            'body' => "Halo Kak {{customer_name}},\n\nMohon maaf, booking treatment Kakak di Bulu Space dengan kode {{booking_code}} dibatalkan oleh pihak studio.\n\nDETAIL BOOKING\nKode Booking : {{booking_code}}\nTanggal : {{date}}\nWaktu : {{time}}\nLokasi : {{branch}}\nTreatment : {{services}}\nStatus : DIBATALKAN\nAlasan : {{cancel_reason}}\n\nJika Kakak berkenan, silakan book ulang dengan memilih jadwal lain melalui website Bulu Space. Untuk informasi lebih lanjut, hubungi WhatsApp admin di {{admin_wa}}.\n\nMohon maaf atas ketidaknyamanannya.\n\nSalam,\nBulu Space",
        ],
    ];

    public function up(): void
    {
        foreach (self::DEFAULTS as $type => $row) {
            DB::table('email_settings')->updateOrInsert(['type' => $type], $row);
        }
    }

    public function down(): void
    {
        DB::table('email_settings')->whereIn('type', array_keys(self::DEFAULTS))->delete();
    }
};
