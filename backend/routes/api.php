<?php

use App\Http\Controllers\Admin\AdminChatController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EmailSettingController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\PromoController as AdminPromoController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\ScheduleController as AdminScheduleController;
use App\Http\Controllers\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Admin\TherapistController as AdminTherapistController;
use App\Http\Controllers\Admin\WalkInController as AdminWalkInController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\PromoController;
use App\Http\Controllers\Api\PublicController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API (Customer Website)
|--------------------------------------------------------------------------
*/

Route::get('/services', [PublicController::class, 'services']);
Route::get('/therapists', [PublicController::class, 'therapists']);
Route::get('/reviews', [PublicController::class, 'reviews']);
Route::get('/promos', [PromoController::class, 'index']);
Route::get('/availability', [PublicController::class, 'availability']);
Route::get('/branches', [PublicController::class, 'branches']);
Route::get('/faqs', [PublicController::class, 'faqs']);
Route::get('/schedule-board', [PublicController::class, 'scheduleBoard']);

Route::post('/bookings', [BookingController::class, 'store']);
Route::get('/bookings/{code}', [BookingController::class, 'show']);
Route::post('/bookings/{code}/cancel', [BookingController::class, 'cancel']);

Route::middleware('throttle:20,1')->group(function () {
    Route::post('/chats', [ChatController::class, 'store']);
    Route::post('/chats/{id}/messages', [ChatController::class, 'send']);
});
Route::get('/chats/{id}/messages', [ChatController::class, 'messages']);

/*
|--------------------------------------------------------------------------
| Auth
|--------------------------------------------------------------------------
*/

Route::post('/admin/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

/*
|--------------------------------------------------------------------------
| Admin API (Protected) — role Admin
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', \App\Http\Middleware\EnsureAdmin::class])
    ->prefix('admin')
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);

        Route::get('/bookings', [AdminBookingController::class, 'index']);
        Route::get('/bookings/{id}', [AdminBookingController::class, 'show']);
        Route::put('/bookings/{id}/status', [AdminBookingController::class, 'updateStatus']);

        Route::get('/schedule', [AdminScheduleController::class, 'index']);
        Route::post('/schedule/block', [AdminScheduleController::class, 'storeBlock']);
        Route::delete('/schedule/block/{id}', [AdminScheduleController::class, 'destroyBlock']);

        Route::get('/therapists', [AdminTherapistController::class, 'index']);
        Route::post('/therapists', [AdminTherapistController::class, 'store']);
        Route::put('/therapists/{id}', [AdminTherapistController::class, 'update']);
        Route::delete('/therapists/{id}', [AdminTherapistController::class, 'destroy']);
        Route::post('/therapists/{id}/leaves', [AdminTherapistController::class, 'storeLeave']);
        Route::delete('/therapists/{id}/leaves/{leaveId}', [AdminTherapistController::class, 'destroyLeave']);

        Route::get('/services', [AdminServiceController::class, 'index']);
        Route::post('/services', [AdminServiceController::class, 'store']);
        Route::put('/services/{id}', [AdminServiceController::class, 'update']);
        Route::delete('/services/{id}', [AdminServiceController::class, 'destroy']);

        Route::get('/promos', [AdminPromoController::class, 'index']);
        Route::post('/promos', [AdminPromoController::class, 'store']);
        Route::put('/promos/{id}', [AdminPromoController::class, 'update']);
        Route::delete('/promos/{id}', [AdminPromoController::class, 'destroy']);

        Route::get('/reviews', [AdminReviewController::class, 'index']);
        Route::delete('/reviews/{id}', [AdminReviewController::class, 'destroy']);

        Route::get('/faqs', [FaqController::class, 'index']);
        Route::post('/faqs', [FaqController::class, 'store']);
        Route::put('/faqs/{id}', [FaqController::class, 'update']);
        Route::delete('/faqs/{id}', [FaqController::class, 'destroy']);

        Route::get('/email-settings', [EmailSettingController::class, 'index']);
        Route::put('/email-settings', [EmailSettingController::class, 'update']);

        Route::post('/walk-ins', [AdminWalkInController::class, 'store']);
        Route::delete('/walk-ins/{id}', [AdminWalkInController::class, 'destroy']);

        Route::get('/chats', [AdminChatController::class, 'index']);
        Route::get('/chats/{id}', [AdminChatController::class, 'show']);
        Route::post('/chats/{id}/messages', [AdminChatController::class, 'reply']);
        Route::post('/chats/{id}/close', [AdminChatController::class, 'close']);
    });