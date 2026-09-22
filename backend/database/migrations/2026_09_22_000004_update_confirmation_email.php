<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const OLD = [
        'subject' => 'Booking Berhasil - Bulu Space',
        'body' => "Halo {{customer_name}},\n\nTerima kasih sudah memesan treatment di Bulu Space. Booking Anda telah tercatat:\n\nKode Booking: {{booking_code}}\nTanggal: {{date}}\nJam: {{time}}\nLokasi: {{branch}}\nTerapis: {{therapist}}\nTreatment: {{services}}\nTotal Estimasi: {{total}}\n\nMohon datang 10-15 menit sebelum jadwal. Konfirmasi atau ubah jadwal bisa melalui WhatsApp admin di {{admin_wa}}.\n\nTerima kasih,\nBulu Space",
    ];

    private const NEW = [
        'subject' => 'Konfirmasi Booking Treatment – Bulu Space | {{booking_code}}',
        'body' => "Halo Kak {{customer_name}},\n\nTerima kasih telah melakukan booking treatment di Bulu Space. Dengan senang hati, kami mengonfirmasi bahwa booking Kakak telah tercatat dengan detail sebagai berikut:\n\nDETAIL BOOKING\nKode Booking : {{booking_code}}\nTanggal : {{date}}\nWaktu : {{time}}\nLokasi : {{branch}}\nTerapis : {{therapist}}\nTreatment : {{services}}\nTotal Estimasi : {{total}}\n\nMohon untuk hadir 10–15 menit sebelum jadwal treatment agar proses registrasi dan persiapan dapat berjalan dengan nyaman.\n\nWAX PREPARATION\n\nSebelum melakukan waxing, kami menyarankan Kakak untuk:\n\n☑️ Memastikan panjang bulu kurang lebih ¼ inci agar proses waxing lebih optimal.\n☑️ Menggunakan pakaian yang nyaman dan tidak terlalu ketat.\n☑️ Melakukan eksfoliasi secara lembut beberapa hari sebelum treatment.\n☑️ Mengonsumsi air yang cukup sebelum treatment.\n☑️ Untuk underarms, mohon tidak menggunakan deodorant sebelum treatment.\n☑️ Untuk arms dan legs, mohon tidak menggunakan lotion atau body moisturizer sebelum treatment.\n☑️ Apabila diperlukan, obat pereda nyeri seperti ibuprofen dapat digunakan sebelum treatment hanya jika aman bagi Kakak dan sesuai petunjuk pada kemasan/anjuran tenaga kesehatan.\n\nAFTER CARE WAXING\n\nSetelah treatment waxing, kami menyarankan:\n\n• Hindari mandi dengan air panas/hangat dan aktivitas yang menyebabkan keringat berlebih selama 24 jam.\n• Untuk underarms, hindari penggunaan deodorant selama 24 jam.\n• Untuk arms dan legs, hindari penggunaan lotion/body moisturizer selama 24 jam.\n• Hindari pakaian yang terlalu ketat pada area yang baru diwax.\n• Lakukan eksfoliasi secara lembut mulai 3 hari setelah waxing untuk membantu mencegah ingrown hair.\n• Eksfoliasi dapat dilakukan secara rutin sesuai kondisi kulit, namun hindari eksfoliasi apabila kulit masih mengalami kemerahan atau iritasi.\n\nAFTER CARE BRAZILIAN\n\nKhusus untuk treatment Brazilian:\n\n• Dapat menggunakan 100% Aloe Vera tanpa alkohol pada area yang ditreatment apabila diperlukan.\n• Hindari body scrub selama 3 hari setelah treatment.\n• Hindari mandi air panas, hot bath, atau hot tub.\n• Gunakan pakaian dalam dan pakaian yang longgar serta nyaman.\n• Hindari olahraga atau aktivitas yang menyebabkan keringat berlebih selama 24 jam.\n• Hindari hubungan seksual selama 24 jam setelah treatment.\n• Setelah 3 hari, lakukan eksfoliasi secara lembut dan rutin untuk membantu mencegah ingrown hair.\n\nTHREADING\n\nBefore Threading:\nMohon membersihkan wajah dari makeup sebelum treatment.\n\nAfter Threading:\n• Hindari penggunaan skincare pada area yang ditreatment selama kurang lebih 6–12 jam.\n• Hindari produk dengan bahan aktif atau produk yang berpotensi menyebabkan iritasi setelah treatment.\n\nKETENTUAN KETERLAMBATAN\n\nToleransi keterlambatan adalah maksimal 10 menit.\n\nApabila keterlambatan melebihi 10 menit, waktu treatment dapat disesuaikan dengan sisa waktu yang tersedia. Terapis akan mengevaluasi kondisi dan menyesuaikan treatment agar tetap dapat dilakukan dengan optimal.\n\nUntuk keterlambatan yang melebihi batas toleransi, booking dapat dianggap hangus apabila slot treatment sudah tidak memungkinkan untuk digunakan. Apabila tetap datang, Kakak dapat melakukan walk-in sesuai ketersediaan slot pada saat kedatangan.\n\nHave a smooth day🤍\n\nWarm regards,\nBulu Space",
    ];

    public function up(): void
    {
        DB::table('email_settings')->where('type', 'booking_confirmation')->update(self::NEW);
    }

    public function down(): void
    {
        DB::table('email_settings')->where('type', 'booking_confirmation')->update(self::OLD);
    }
};