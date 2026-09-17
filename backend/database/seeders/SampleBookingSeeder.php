<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\AppointmentDetail;
use App\Models\Review;
use Illuminate\Database\Seeder;

class SampleBookingSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $apt1 = Appointment::create([
            'booking_code' => 'BS-384721',
            'user_id' => 3,
            'therapist_id' => 1,
            'appointment_date' => $now->copy()->addDays(2)->toDateString(),
            'start_time' => '13:30',
            'end_time' => '14:00',
            'status' => 'Confirmed',
            'customer_name' => 'Andi',
            'customer_phone' => '085163274684',
            'location' => 'Jakarta Barat',
            'notes' => 'booking untuk bagian underarm',
            'total_price' => 52000,
        ]);
        AppointmentDetail::create(['appointment_id' => $apt1->id, 'service_id' => 6, 'quantity' => 1, 'price' => 52000]);

        $apt2 = Appointment::create([
            'booking_code' => 'BS-749102',
            'user_id' => 4,
            'therapist_id' => 2,
            'appointment_date' => $now->copy()->addDays(1)->toDateString(),
            'start_time' => '10:00',
            'end_time' => '10:45',
            'status' => 'Confirmed',
            'customer_name' => 'Budi',
            'customer_phone' => '081232547985',
            'location' => 'Jakarta Selatan',
            'notes' => 'booking waxing',
            'total_price' => 195000,
        ]);
        AppointmentDetail::create(['appointment_id' => $apt2->id, 'service_id' => 20, 'quantity' => 1, 'price' => 195000]);

        $apt3 = Appointment::create([
            'booking_code' => 'BS-518263',
            'user_id' => 5,
            'therapist_id' => 1,
            'appointment_date' => $now->copy()->addDays(3)->toDateString(),
            'start_time' => '15:00',
            'end_time' => '15:30',
            'status' => 'Pending',
            'customer_name' => 'Clarissa Maharani',
            'customer_phone' => '081298765432',
            'location' => 'Jakarta Barat',
            'notes' => 'First timer, minta terapis yang sabar',
            'total_price' => 85000,
        ]);
        AppointmentDetail::create(['appointment_id' => $apt3->id, 'service_id' => 16, 'quantity' => 1, 'price' => 85000]);

        $apt4 = Appointment::create([
            'booking_code' => 'BS-902145',
            'user_id' => 6,
            'therapist_id' => 4,
            'appointment_date' => $now->copy()->addDays(5)->toDateString(),
            'start_time' => '11:00',
            'end_time' => '11:15',
            'status' => 'Completed',
            'customer_name' => 'Dina Anggraeni',
            'customer_phone' => '082154321098',
            'location' => 'Jakarta Selatan',
            'notes' => '',
            'total_price' => 89000,
        ]);
        AppointmentDetail::create(['appointment_id' => $apt4->id, 'service_id' => 6, 'quantity' => 1, 'price' => 52000]);
        AppointmentDetail::create(['appointment_id' => $apt4->id, 'service_id' => 2, 'quantity' => 1, 'price' => 37000]);

        Review::create(['user_id' => 3, 'appointment_id' => $apt1->id, 'rating' => 5, 'comment' => 'Pelayanan sangat bagus, terapis ramah dan sabar']);
        Review::create(['user_id' => 4, 'appointment_id' => $apt2->id, 'rating' => 5, 'comment' => 'Tempatnya nyaman dan proses waxing cepat']);
        Review::create(['user_id' => 6, 'appointment_id' => $apt4->id, 'rating' => 5, 'comment' => 'Fitur request terapis membantu banget, hasilnya mulus']);
    }
}