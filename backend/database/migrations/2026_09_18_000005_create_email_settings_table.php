<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_settings', function (Blueprint $table) {
            $table->id();
            $table->string('type', 40)->unique();
            $table->string('subject', 200)->default('');
            $table->text('body')->nullable();
            $table->timestamps();
        });

        $defaults = [
            'booking_confirmation' => [
                'subject' => 'Booking Berhasil - Bulu Space',
                'body' => implode("\n", [
                    'Halo {{customer_name}},',
                    '',
                    'Terima kasih sudah memesan treatment di Bulu Space. Booking Anda telah tercatat:',
                    '',
                    'Kode Booking: {{booking_code}}',
                    'Tanggal: {{date}}',
                    'Jam: {{time}}',
                    'Lokasi: {{branch}}',
                    'Terapis: {{therapist}}',
                    'Treatment: {{services}}',
                    'Total Estimasi: {{total}}',
                    '',
                    'Mohon datang 10-15 menit sebelum jadwal. Konfirmasi atau ubah jadwal bisa melalui WhatsApp admin di {{admin_wa}}.',
                    '',
                    'Terima kasih,',
                    'Bulu Space',
                ]),
            ],
            'admin_notification' => [
                'subject' => 'Booking Baru #{{booking_code}}',
                'body' => implode("\n", [
                    'Ada booking baru masuk:',
                    '',
                    'Kode: {{booking_code}}',
                    'Nama: {{customer_name}}',
                    'No. HP: {{customer_phone}}',
                    'Email: {{customer_email}}',
                    'Tanggal: {{date}}',
                    'Jam: {{time}}',
                    'Lokasi: {{branch}}',
                    'Terapis: {{therapist}}',
                    'Treatment: {{services}}',
                    'Total: {{total}}',
                ]),
            ],
            'reminder_h1' => [
                'subject' => 'Pengingat Treatment Besok - Bulu Space',
                'body' => implode("\n", [
                    'Halo {{customer_name}},',
                    '',
                    'Pengingat: besok Anda dijadwalkan treatment di Bulu Space.',
                    '',
                    'Kode Booking: {{booking_code}}',
                    'Tanggal: {{date}}',
                    'Jam: {{time}}',
                    'Lokasi: {{branch}}',
                    '',
                    'Jika ada perubahan kuota, silakan hubungi kami via WhatsApp {{admin_wa}}.',
                    '',
                    'Bulu Space',
                ]),
            ],
            'reminder_hours' => [
                'subject' => 'Treatment Anda Dalam Beberapa Jam - Bulu Space',
                'body' => implode("\n", [
                    'Halo {{customer_name}},',
                    '',
                    'Treatment Anda akan dimulai tidak lama lagi.',
                    '',
                    'Kode Booking: {{booking_code}}',
                    'Jam: {{time}}',
                    'Lokasi: {{branch}}',
                    '',
                    'Mohon datang 10-15 menit sebelum jadwal. Hubungi kami jika ada kendala: {{admin_wa}}',
                    '',
                    'Bulu Space',
                ]),
            ],
            'aftercare' => [
                'subject' => 'Terima Kasih & Tata Cara Perawatan - Bulu Space',
                'body' => implode("\n", [
                    'Halo {{customer_name}},',
                    '',
                    'Terima kasih telah melakukan treatment di Bulu Space! Agar hasil tahan lama dan aman, berikut tata cara perawatan setelah waxing:',
                    '',
                    '1. Hindari paparan sinar matahari langsung pada area yang di-wax setidaknya 24 jam.',
                    '2. Jangan berolahraga berat atau berkeringat berlebih dalam 24 jam.',
                    '3. Kenakan pakaian longgar agar kulit bisa bernapas.',
                    '4. Jangan menyentuh atau menggaruk area yang di-wax.',
                    '5. Eksfoliasi lembut setelah 2-3 hari untuk mencegah bulu tumbuh ke dalam.',
                    '6. Beri kelembapan dengan lotion yang ringan.',
                    '',
                    'Jika ada keluhan kulit, hubungi kami: {{admin_wa}}',
                    '',
                    'Sampai jumpa di sesi berikutnya!',
                    'Bulu Space',
                ]),
            ],
            'admin_email' => [
                'subject' => '',
                'body' => 'spacebulujaksel@gmail.com',
            ],
        ];

        foreach ($defaults as $type => $row) {
            DB::table('email_settings')->insert([
                'type' => $type,
                'subject' => $row['subject'],
                'body' => $row['body'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('email_settings');
    }
};