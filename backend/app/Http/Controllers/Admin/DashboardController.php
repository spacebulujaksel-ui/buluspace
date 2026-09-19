<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Review;
use App\Models\Service;
use App\Models\Therapist;
use App\Models\WalkIn;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    private function customerDates(string $branchName): array
    {
        $online = Appointment::where('location', $branchName)
            ->whereIn('status', ['Confirmed', 'Completed'])
            ->pluck('appointment_date')
            ->map(fn ($d) => $d->toDateString());

        $walkIns = WalkIn::whereHas('branch', fn ($q) => $q->where('name', $branchName))
            ->pluck('date')
            ->map(fn ($d) => $d->toDateString());

        return [$online, $walkIns];
    }

    public function index(Request $request)
    {
        $branchName = $request->user()->branch->name;
        $branchId = $request->user()->branch_id;
        $today = now()->toDateString();

        [$online, $walkIns] = $this->customerDates($branchName);

        $customersToday = $online->filter(fn ($d) => $d === $today)->count() + $walkIns->filter(fn ($d) => $d === $today)->count();
        $onlineToday = $online->filter(fn ($d) => $d === $today)->count();
        $walkinToday = $walkIns->filter(fn ($d) => $d === $today)->count();
        $customersThisMonth = $online->filter(fn ($d) => Carbon::parse($d)->isSameMonth(now()))->count()
            + $walkIns->filter(fn ($d) => Carbon::parse($d)->isSameMonth(now()))->count();
        $customersThisYear = $online->filter(fn ($d) => Carbon::parse($d)->year === now()->year)->count()
            + $walkIns->filter(fn ($d) => Carbon::parse($d)->year === now()->year)->count();

        // Daily series: days in current month
        $daily = [];
        $monthStart = now()->startOfMonth();
        $monthEnd = now()->endOfMonth();
        for ($day = $monthStart->copy(); $day->lte($monthEnd); $day->addDay()) {
            $ds = $day->toDateString();
            $daily[] = [
                'label' => $day->day,
                'value' => $online->filter(fn ($d) => $d === $ds)->count()
                    + $walkIns->filter(fn ($d) => $d === $ds)->count(),
            ];
        }

        // Monthly series: 12 months of current year
        $monthly = [];
        for ($m = 1; $m <= 12; $m++) {
            $monthly[] = [
                'label' => Carbon::create(now()->year, $m, 1)->translatedFormat('M'),
                'value' => $online->filter(fn ($d) => Carbon::parse($d)->year === now()->year && (int) Carbon::parse($d)->month === $m)->count()
                    + $walkIns->filter(fn ($d) => Carbon::parse($d)->year === now()->year && (int) Carbon::parse($d)->month === $m)->count(),
            ];
        }

        // Yearly series: all years with data
        $years = collect(array_merge($online->toArray(), $walkIns->toArray()))
            ->map(fn ($d) => Carbon::parse($d)->year)
            ->unique()
            ->sort()
            ->values();
        $yearly = $years->map(fn ($y) => [
            'label' => (string) $y,
            'value' => $online->filter(fn ($d) => Carbon::parse($d)->year === $y)->count()
                + $walkIns->filter(fn ($d) => Carbon::parse($d)->year === $y)->count(),
        ])->values()->toArray();

        $bookings = Appointment::where('location', $branchName)->get();

        return response()->json([
            'stats' => [
                'total_bookings' => $bookings->count(),
                'active_therapists' => Therapist::where('status', 'Active')->count(),
                'total_services' => Service::count(),
                'total_reviews' => Review::whereHas('appointment', fn ($q) => $q->where('location', $branchName))->count(),
                'customers_today' => $customersToday,
                'online_today' => $onlineToday,
                'walkin_today' => $walkinToday,
                'customers_month' => $customersThisMonth,
                'customers_year' => $customersThisYear,
            ],
            'status_breakdown' => [
                'Pending' => $bookings->where('status', 'Pending')->count(),
                'Confirmed' => $bookings->where('status', 'Confirmed')->count(),
                'Completed' => $bookings->where('status', 'Completed')->count(),
                'Cancelled' => $bookings->where('status', 'Cancelled')->count(),
                'Rejected' => $bookings->where('status', 'Rejected')->count(),
            ],
            'cancellations_today' => Appointment::where('location', $branchName)
                ->where('status', 'Cancelled')
                ->whereDate('updated_at', $today)
                ->count(),
            'recent_bookings' => Appointment::with(['therapist'])
            'customer_series' => [
                'daily' => $daily,
                'monthly' => $monthly,
                'yearly' => $yearly,
            ],
            'walk_ins' => WalkIn::where('branch_id', $branchId)
                ->orderByDesc('date')
                ->limit(10)
                ->get()
                ->map(fn (WalkIn $w) => [
                    'id' => $w->id,
                    'date' => $w->date->toDateString(),
                    'customer_name' => $w->customer_name,
                ]),
        ]);
    }
}