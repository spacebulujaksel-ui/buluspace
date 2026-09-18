<?php

namespace Tests\Feature;

use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SyncServicesTest extends TestCase
{
    use RefreshDatabase;

    public function test_sync_updates_per_roster_keeps_price_and_deactivates_others(): void
    {
        Service::create(['name' => 'Brazilian', 'category' => 'other', 'duration_minutes' => 5, 'description' => 'lama', 'wax_type' => 'x', 'price' => 100000, 'status' => 'Active']);
        Service::create(['name' => 'Cheek', 'category' => 'face', 'duration_minutes' => 10, 'description' => 'x', 'wax_type' => 'x', 'price' => 37000, 'status' => 'Active']);

        $this->artisan('app:sync-services')->assertExitCode(0);

        $this->assertSame(19, Service::where('status', 'Active')->count());
        $this->assertDatabaseHas('services', ['name' => 'Cheek', 'status' => 'Inactive']);

        $brazilian = Service::where('name', 'Brazilian')->first();
        $this->assertSame(30, (int) $brazilian->duration_minutes);
        $this->assertSame('intimate', $brazilian->category);
        $this->assertSame(100000.0, (float) $brazilian->price);
        $this->assertSame('Active', $brazilian->status);
    }

    public function test_sync_dry_run_changes_nothing(): void
    {
        Service::create(['name' => 'Cheek', 'category' => 'face', 'duration_minutes' => 10, 'description' => 'x', 'wax_type' => 'x', 'price' => 37000, 'status' => 'Active']);

        $this->artisan('app:sync-services', ['--dry-run' => true])->assertExitCode(0);

        $this->assertSame(1, Service::count());
        $this->assertDatabaseHas('services', ['name' => 'Cheek', 'status' => 'Active']);
    }
}