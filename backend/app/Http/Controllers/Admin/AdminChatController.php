<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ChatSession;
use Illuminate\Http\Request;

class AdminChatController extends Controller
{
    public function index(Request $request)
    {
        $branchId = $request->user()->branch_id;

        $sessions = ChatSession::withCount([
            'messages as unread' => fn ($q) => $q->where('sender', 'customer')->where('is_read', false),
        ])
            ->where('branch_id', $branchId)
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->limit(100)
            ->get();

        return response()->json([
            'chats' => $sessions->map(fn (ChatSession $s) => [
                'id' => $s->id,
                'customer_name' => $s->customer_name,
                'customer_phone' => $s->customer_phone,
                'status' => $s->status,
                'unread' => $s->unread,
                'last_message_at' => $s->last_message_at?->toIso8601String(),
                'created_at' => $s->created_at?->toIso8601String(),
            ]),
        ]);
    }

    public function show(Request $request, int $id)
    {
        $branchId = $request->user()->branch_id;

        $session = ChatSession::with('messages')->where('branch_id', $branchId)->findOrFail($id);

        ChatMessage::where('chat_session_id', $session->id)
            ->where('sender', 'customer')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'chat' => [
                'id' => $session->id,
                'customer_name' => $session->customer_name,
                'customer_phone' => $session->customer_phone,
                'status' => $session->status,
            ],
            'messages' => $session->messages->map(fn (ChatMessage $m) => [
                'id' => $m->id,
                'sender' => $m->sender,
                'body' => $m->body,
                'created_at' => $m->created_at?->toIso8601String(),
            ]),
        ]);
    }

    public function reply(Request $request, int $id)
    {
        $validated = $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $branchId = $request->user()->branch_id;

        $session = ChatSession::where('branch_id', $branchId)->findOrFail($id);

        $message = ChatMessage::create([
            'chat_session_id' => $session->id,
            'sender' => 'admin',
            'body' => $validated['body'],
            'is_read' => true,
        ]);

        $session->update(['last_message_at' => now()]);

        return response()->json([
            'message' => 'Balasan terkirim.',
            'created' => [
                'id' => $message->id,
                'sender' => 'admin',
                'body' => $message->body,
                'created_at' => $message->created_at?->toIso8601String(),
            ],
        ]);
    }

    public function close(Request $request, int $id)
    {
        $branchId = $request->user()->branch_id;

        $session = ChatSession::where('branch_id', $branchId)->findOrFail($id);

        $session->update(['status' => 'closed']);

        return response()->json(['message' => 'Sesi chat ditutup.']);
    }
}