<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmail extends Command
{
    protected $signature = 'app:test-email {email}';

    protected $description = 'Kirim email tes ke sebuah alamat untuk verifikasi SMTP.';

    public function handle(): int
    {
        $to = $this->argument('email');

        Mail::html(
            '<p>Halo! Ini email tes dari <strong>Bulu Space</strong>.</p><p>Konfigurasi email berhasil.</p>',
            fn ($m) => $m->to($to)->subject('Tes Email - Bulu Space')
        );

        $this->info('Email tes dikirim ke '.$to);

        return 0;
    }
}