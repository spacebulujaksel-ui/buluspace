<?php

namespace Database\Seeders;

use App\Models\Promo;
use Illuminate\Database\Seeder;

class PromoSeeder extends Seeder
{
    public function run(): void
    {
        $promos = [
            [
                'tag' => 'SPECIAL NEW CLIENT',
                'title' => 'First Time Waxing di Bulu Space?',
                'highlight_text' => 'Diskon 30% All Services',
                'description' => 'Rasakan pengalaman waxing minim rasa sakit dengan formulasi gentle film wax hypoallergenic dan ruang treatment privat beraroma lavender.',
                'discount_badge' => '',
                'valid_until' => '2026-09-30',
                'cta_text' => 'BOOK NOW',
                'promo_code' => 'FIRSTBULU30',
                'bg_gradient' => 'from-slate-900 via-zinc-800 to-slate-900',
                'accent_color' => '#F472B6',
                'image' => '/asset/img/promo-first-time.jpeg',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'tag' => 'BEST SELLER BUNDLE',
                'title' => 'Silky Glow Duo Package',
                'highlight_text' => 'Brazilian + Underarm + Free Serum',
                'description' => 'Kombinasi favorit untuk kulit mulus sempurna tanpa bulu hingga 4-6 minggu.',
                'discount_badge' => '',
                'valid_until' => '2026-12-31',
                'cta_text' => 'Pesan Paket Bundling',
                'promo_code' => 'SILKYGLOW',
                'bg_gradient' => 'from-zinc-900 via-neutral-800 to-zinc-900',
                'accent_color' => '#FBCFE8',
                'image' => '/asset/img/promo-bundle.jpeg',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'tag' => 'EXCLUSIVE MEMBER',
                'title' => 'Bulu Space VIP Membership',
                'highlight_text' => 'Cashback 20% & Priority Therapist',
                'description' => 'Nikmati kebebasan booking terapis prioritas pilihan Anda.',
                'discount_badge' => '',
                'valid_until' => '2026-12-31',
                'cta_text' => 'Daftar Member Bulu',
                'promo_code' => 'VIPBULU',
                'bg_gradient' => 'from-stone-900 via-slate-800 to-zinc-900',
                'accent_color' => '#F472B6',
                'image' => '/asset/img/promo-vip.jpeg',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'tag' => 'WEEKEND RECHARGE',
                'title' => 'Friday to Sunday Pampering',
                'highlight_text' => 'Free Post-Wax Soothing Mask',
                'description' => 'Manjakan diri di akhir pekan dengan perawatan menenangkan.',
                'discount_badge' => 'FREE ADD-ON',
                'valid_until' => '2026-12-31',
                'cta_text' => 'Reservasi Weekend',
                'promo_code' => 'WEEKENDCARE',
                'bg_gradient' => 'from-slate-900 via-zinc-900 to-slate-800',
                'accent_color' => '#FBCFE8',
                'image' => '/asset/img/promo-weekend.jpeg',
                'is_active' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($promos as $p) {
            Promo::create($p);
        }
    }
}