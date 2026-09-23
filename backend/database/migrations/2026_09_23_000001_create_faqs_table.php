<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('question')->index();
            $table->text('answer');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        if (DB::table('faqs')->count() === 0) {
            $rows = [
                "Bagaimana cara memesan (booking) treatment waxing di Bulu Space?"
                    => "Pemesanan sangat mudah! Klik tombol 'Reservasi Sekarang' di website, pilih lokasi cabang (Jakarta Barat / Jakarta Selatan), tentukan layanan, tanggal, jam, dan therapist (opsional). Setelah konfirmasi, tiket reservasi Anda langsung terbit.",
                "Apa yang perlu dipersiapkan sebelum melakukan treatment waxing?"
                    => "Pastikan panjang bulu minimal 0.5 cm (sekitar 2-3 minggu setelah cukur terakhir). Hindari eksfoliasi berat atau penggunaan retinol/lotion tebal 24 jam sebelum waxing agar hasil optimal.",
                "Bagaimana standar kebersihan & sterilisasi di Bulu Space?"
                    => "Higienitas adalah prioritas utama kami. Kami menerapkan standar medis 100% NO DOUBLE DIPPING (aplikator wax hanya dipakai 1x celup), penggunaan sprei/bed sheet sekali pakai, dan sanitasi alat & bilik privat setiap pergantian klien.",
                "Apakah bisa mengubah (reschedule) atau membatalkan jadwal booking?"
                    => "Bisa. Anda dapat melakukan reschedule atau pembatalan melalui fitur 'Cek Tiket Reservasi' di website atau langsung menghubungi Admin WhatsApp cabang terkait minimal 2 jam sebelum waktu treatment.",
                "Apa saja metode pembayaran yang diterima di studio Bulu Space?"
                    => "Kami menerima pembayaran tunai (Cash), Transfer Bank, QRIS (Gopay, OVO, ShopeePay, BCA, Mandiri, dll), serta Kartu Debit langsung di lokasi studio saat hari treatment.",
                "Kalau setelah treatment muncul kemerahan, jerawat atau bintik-bintik kecil, gimana ya Kak?"
                    => "Kemerahan, jerawat, atau bintik-bintik kecil setelah treatment bisa terjadi dan umumnya merupakan reaksi kulit terhadap treatment, terutama pada kulit yang sensitif ya Kak. 🤍\n\nUntuk membantu menenangkan kulit, Kakak bisa:\n\n* Oleskan aloe vera gel.\n* Hindari scrub atau eksfoliasi sementara.\n* Gunakan pakaian yang longgar agar tidak banyak gesekan.\n* Hindari air hangat pada area treatment.\n* Kurangi aktivitas yang membuat keringat berlebih sementara waktu.\n* Boleh dikompres air dingin.\n\nBiasanya reaksi kulit akan mereda seiring waktu ya Kak.☺️🙏🏻",
                "Bisa walk-in tidak Kak?"
                    => "Bisa Kak! Untuk walk-in, treatment yang tersedia hanya 1 treatment dan non-package. Untuk treatment full seperti Full Legs, Full Arms, Full Back, dan Full Front belum bisa dilakukan secara walk-in.\n\nWalk-in mengikuti antrian dan ketersediaan slot di lokasi, sehingga jam treatment belum dapat dipastikan sebelumnya ya kak. 😊\n\nWalk-in close pukul 17.00, jadi disarankan datang sebelum pukul 17.00 agar kemungkinan mendapatkan slot lebih besar. ❤️",
                "Kalau free birthday, boleh digunakan seminggu sebelum atau sesudah tanggal ulang tahun ngga Kak?"
                    => "Belum bisa kak, Free birthday hanya dapat digunakan tepat di tanggal lahir sesuai yang tercantum pada kartu identitas ya Kak.\n\nTanggal lahir akan dilakukan pengecekan melalui kartu identitas, jadi promo free birthday tidak dapat digunakan sehari sebelum, sesudah, maupun di hari lainnya. 😊",
                "Kalau sedang hamil, boleh Brazilian nggak Kak?"
                    => "Boleh Kak, untuk Brazilian saat hamil, usia kandungan minimal 4 bulan dan wajib sudah mendapatkan approval dari dokter ya Kak.\n\nApproval dari dokter tidak harus berupa surat, yang penting sudah ada persetujuan dari dokter sebelum melakukan treatment. 😊",
                "Kalau aku telat datang gimana ya, Kak?"
                    => "Kami memberikan toleransi keterlambatan maksimal 10 menit ya, Kak. 🤍\n\nJika Kakak booking 2 treatment atau lebih dan datang lebih dari 10 menit, maka akan ada penyesuaian/pemotongan treatment sesuai dengan sisa waktu yang tersedia, agar tidak mengganggu jadwal customer berikutnya.\n\nApabila keterlambatan sudah lebih dari 10 menit, booking akan masuk ke antrian walk-in dan treatment mengikuti antrian serta ketersediaan slot di lokasi. 😊",
                "Ibuprofen kegunaannya untuk apa ya?"
                    => "Ibuprofen adalah obat yang berguna untuk meredakan nyeri dan mengurangi peradangan. Jadi kami bisa menyarankan minum ibuprofen/paracetamol untuk pain tolerance-nya rendah. 😊\n\nJadi *pain tolerance* rendah, bisa mempertimbangkan ibuprofen atau paracetamol sesuai aturan pakai ya Kak; bila sedang hamil atau punya kondisi medis tertentu, konsultasikan dulu dengan dokter. 😊",
                "Ada yang harus di lakukan setelah treatment Brazillian? Do’s and Don’ts."
                    => "🌸 *After Care Brazilian* 🌸\n• Boleh dipakaikan 100% Aloe Vera No Alcohol di Area Miss V\n• Memakai Body Scrub 3 Hari sebelum & setelah brazilian\n• No Hot Baths Or Hot Tubs 🫧\n• Pakai Celana yang Longgar dan Nyaman\n• Dilarang olahraga dulu selama 24 jam\n• Dilarang berhubungan (satu hari)",
                "Kalau customer cowok, bisa treatment area intimate ngga Kak?"
                    => "Mohon maaf Kak, untuk customer pria, saat ini belum tersedia treatment untuk area intimate ya, Kak. 🤍\n\nUntuk treatment Full Legs pria, treatment hanya dilakukan sampai area 3/4 kaki, kurang lebih hingga ½ paha ya Kak. 😊",
                "Kak *Bulu Space* ada membership ya?"
                    => "Jadi di Bulu Space ada program menggunakan *membercard*;\n\n🔹 *5x visit* → diskon *50%* untuk treatment termurah (yang eligible)\n🔹 *10x visit* → gratis *1 treatment* (yang eligible)\n\nYang termasuk eligible treatment itu treatment standalone ya Kak, seperti threading alis, underarms, half legs, half legs, dll. \nYang *tidak termasuk* di program member:\n❌ Paket (Clean Girl, Feel Smooth, Bali Ready, Full Face, Full Body)\n❌ Treatment full (Brazillian, Full Legs, Full Arms, Full Front, Full Back)\n\nSetiap kali treatment di Bulu Space, Kakak otomatis dapat *stempel* di member card ya Kak 🫶🏻",
                "Kak di Bulu Space tersedia aloevera? Manfaatnya apa ya?"
                    => "Kami tersedia Kak, hanya saja bisa langsung dipastikan di lokasi ketersediaannya ya Kak. 😊\n\nManfaat utama menggunakan aloe vera gel pada kulit setelah waxing:\n\n- Memberikan efek dingin: Gel ini mendinginkan area yang iritasi atau kemerahan akibat proses pencabutan bulu.\n- Melembapkan: Mengembalikan kelembapan alami kulit yang terangkat bersamaan dengan sel kulit mati saat waxing.\n- Meredakan inflamasi: Membantu mempercepat penyembuhan kulit yang meradang.\n\nCatatan: Aloevera yang dipakai no fragrance no alkohol ya Kak. 🙏🏻☺️",
                "Kalau mau ke *Bulu Space* naik kendaraan umum, bisa lewat mana ya, Kak?"
                    => "Bisa, Kak! 🤍 Berikut beberapa pilihan transportasi menuju Bulu Space:\n\n📍 Jakarta Barat – Kebon Jeruk\n\n* Jak Lingko Jak 14: turun di halte/bus stop tepat di depan Bulu Space.\n* Stasiun Palmerah: dari stasiun bisa melanjutkan perjalanan menggunakan Jak Lingko rute 14.\n* TransJakarta: turun di Halte Kebon Jeruk, lalu lanjut menggunakan ojek online ke Bulu Space.\n\n📍 Jakarta Selatan\n\n* MRT: turun di Stasiun Haji Nawi, lalu jalan kaki kurang lebih 700 m ke salon.\n* Kereta: turun di Stasiun Kebayoran, lalu lanjut ojek online kurang lebih 4–5 km.\n* Jak Lingko: bisa menggunakan rute 102 (Lebak Bulus – PIM – ITC Fatmawati – Blok M).\n\nUntuk lokasi lengkap dan petunjuk arah, Kakak bisa cek Google Maps berikut ya: 😊\n\n📍 Bulu Space Jakarta Barat:\nGoogle Maps – Jakarta Barat\n\n📍 Bulu Space Jakarta Selatan:\nGoogle Maps – Jakarta Selatan",
                "Kak kalau sedang haid, boleh Brazilian nggak?"
                    => "Mohon maaf Kak, untuk treatment Brazilian, mohon dilakukan setelah haid selesai dan sudah bersih ya, Kak. 🤍\n\nHal ini karena selama atau setelah periode haid, kulit di area tersebut dapat menjadi lebih sensitif, sehingga kami menyarankan menunggu hingga haid selesai sebelum melakukan waxing. 😊",
                "Kalau habis waxing, boleh langsung berenang atau olahraga ngga Kak? "
                    => "Setelah waxing, sebaiknya hindari berenang dan olahraga terlebih dahulu selama minimal 24 jam ya, Kak. 🤍 \n\nSetelah 24 jam, aktivitas tersebut sudah boleh dilakukan kembali. 😊",
                "Kalau habis threading, boleh langsung cuci muka pakai sabun nggak, Kak?"
                    => "Sebaiknya tunggu sekitar 2–3 jam setelah threading sebelum mencuci wajah menggunakan sabun/face wash, skincare wajah dan make up yang ada cream wajah seperti foundation. 🤍\n\nHal ini untuk memberikan waktu pada kulit agar lebih tenang, karena tingkat sensitivitas kulit setiap orang bisa berbeda-beda. 😊",
                "Setelah waxing kenapa kulit aku bertekstur ya Kak?"
                    => "Kulit bisa terasa bertekstur setelah waxing karena folikel rambut dan kulit sedang mengalami iritasi ringan, atau ada sel kulit mati yang menumpuk Kak.\n\nBiasanya bersifat sementara ya Kak, jadi hindari menggaruk dan jangan langsung scrub, tunggu sekitar 3 hari, lalu gunakan body scrub yang lembut. Bisa juga pakai aloe vera 100% tanpa alkohol untuk membantu menenangkan kulit 😊",
                "Kak, kalau aku terlanjur sudah pakai deodorant apakah masih bisa treatment?"
                    => "Masih bisa Kak, asalkan area underarms sudah dibersihkan sampai tidak ada sisa deodorant sebelum treatment. ☺️",
                "Kak, apakah di Bulu Space tersedia remover/micellar water?"
                    => "Kami tersedia ya Kak, sebelum treatment dimulai therapist akan memastikan jika Kakak memakai riasan atau tidak, jadi akan dibantu dibersihkan oleh therapist Kak. 😊",
                "Kalau member card aku hilang, gimana ya, Kak?"
                    => "Tidak perlu khawatir, Kak🤍 \nJika member card hilang, kami akan memberikan member card baru, namun stamp akan diulang kembali dari awal ya, Kak.",
                "Kalau member card aku rusak, gimana ya, Kak?"
                    => "Kalau member card rusak, boleh dibawa dan ditunjukkan kepada kasir ya, Kak. Kami akan membantu memberikan member card baru, dan stamp yang sebelumnya akan dicek terlebih dahulu sebelum dipindahkan ke member card yang baru. 🤍",
                "Kalau dihari treatment aku nggak bawa member card, boleh stamp di hari lain nggak, Kak?"
                    => "Mohon maaf Kak belum bisa ya Kak, stamp member card hanya dapat diberikan di hari yang sama dengan tanggal treatment.\n\nKalau member card tertinggal dan kakak ingin mengambilnya terlebih dahulu, kemudian kembali ke salon, boleh ya, Kak. Kakak cukup menunjukkan struk treatment sebagai bukti transaksi.\n\nNamun, jika sudah berganti hari, stamp tidak dapat diberikan di kemudian hari ya, Kak. 🤍",
                "Ada mushola atau masjid di sekitar Bulu Space, Kak?"
                    => "Ada Kak! 🥰\n\n📍 Bulu Space Jakarta Barat: terdapat mushola yang lokasinya tidak jauh dari store kurang lebih 50 - 100 meter Kak.\n\n📍 Bulu Space Jakarta Selatan: terdapat masjid tepat di depan store ya, Kak. 🤍",
                "Di Bulu Space ada toilet nggak, Kak?"
                    => "Ada Kak, Bulu Space menyediakan toilet yang bisa digunakan oleh customer ya, Kak. 😊",
                "Kalau bawa pasangan atau teman ada ruang tunggu nggak, Kak?"
                    => "Ada Kak🥰 untuk pasangan atau teman yang menemani, tersedia ruang tunggu di Bulu Space ya, Kak. 🤍",
                "Di Bulu Space Jaksel apakah tersedia parkir?"
                    => "Kami tersedia Kak hanya saja tidak luas, bisa lgsg koordinasikan dengan tukang parkir kami yg tersedia dilokasi ya Kak. ☺️",
                "Kalau first time waxing sakit nggak Kak?"
                    => "Untuk rasa sakit pasti ada ya Kak, tapi biasanya hanya terasa saat proses waxing dan setelah selesai sudah tidak sakit lagi. Tingkat rasa sakitnya juga tergantung pain tolerance masing-masing ya, Kak. 🤍",
                "Kak, toleransi keterlambatannya maksimal 10 menit ya?"
                    => "Betul, Kak. Namun, untuk booking pukul 18.30 dan 18.45 tidak ada toleransi keterlambatan, karena kami tutup pukul 19.00.\n\nJika kakak merasa kemungkinan akan terlambat, boleh reschedule ke hari lain terlebih dahulu ya, Kak. 🤍",
                "Kak, mau sekalian IPL bisa nggak?"
                    => "Mohon maaf Kak. Saat ini layanan yang tersedia hanya waxing dan threading ya Kak. 🤍",
                "Kak, perbedaan intimate dari basic bikini, brazillian, dan buttocks apa ya?"
                    => "Berikut perbedaan intimate ya Kak :\n• *Basic Bikini*: hanya waxing bagian garis pinggir miss V.\n• *Brazilian*: waxing seluruh area miss V sampai bagian dalam bokong/area dubur, tetapi tidak termasuk bokong luar.\n• *Buttocks*: waxing bagian bokong luar saja. 😊",
                "Kalau ada bekas luka, bekas jahitan, atau bekas jahitan sesar, boleh waxing nggak Kak?"
                    => "Boleh Kak selama luka atau bekas jahitannya sudah sembuh dan kering ya. Nanti tetap akan dicek terlebih dahulu oleh therapist kami. Kalau dirasa belum memungkinkan, area di sekitar bekas luka atau jahitan tidak akan di waxing ya, Kak. 🤍",
                "Untuk treatment paket, bisa diganti nggak Kak? Misalnya paket Bali Ready, Half Legs nya diganti ke Eyebrows?"
                    => "Mohon maaf Kak. Untuk treatment dalam paket tidak dapat diganti atau ditukar ya, Kak. 🤍",
                "Kak, untuk scrub nya disarankan pake produk apa ya?"
                    => "Untuk scrub setelah treatment boleh pakai body scrub apa saja, yang tersedia di rumah pun tak apa Kak, tetapi tetap pilih yang butirannya halus dan lembut agar tidak mengiritasi kulit.\n\nGunakan mulai 3 hari setelah waxing, lalu rutin 2–3 kali seminggu. Jangan langsung scrub setelah treatment ya Kak. 😊",
                "Kalau alis tipis bisa threading alis nggak Kak? "
                    => "Bisa Kak, justru threading alis dapat membantu merapikan bentuk alis agar terlihat lebih full dan terisi ya, Kak. 🤍",
                "Kalau bulunya masih pendek atau habis dicukur, bisa langsung waxing nggak Kak?"
                    => "Kalau masih banyak bulu yang pendek, sebaiknya jangan dulu ya, Kak. Karena hasilnya belum bisa maksimal dan tidak semua bulu bisa terangkat. Sebaiknya tunggu sekitar 2–3 minggu sampai bulunya cukup panjang untuk di waxing ya, Kak. ☺️🙏🏻",
            ];

            DB::table('faqs')->insert(
                array_map(fn ($question, $answer) => [
                    'question' => $question,
                    'answer' => $answer,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ], array_keys($rows), $rows)
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('faqs');
    }
};