<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ChatSession;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|integer|exists:branches,id',
            'customer_name' => 'required|string|max:120',
            'customer_phone' => 'required|string|max:30',
        ]);

        $session = ChatSession::where('branch_id', $validated['branch_id'])
            ->where('customer_phone', $validated['customer_phone'])
            ->where('status', 'open')
            ->orderByDesc('id')
            ->first();

        if (!$session) {
            $session = ChatSession::create([
                'branch_id' => $validated['branch_id'],
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'status' => 'open',
            ]);
        }

        return response()->json([
            'id' => $session->id,
            'messages' => $session->messages->map(fn (ChatMessage $m) => $this->shape($m)),
        ]);
    }

    public function send(Request $request, int $id)
    {
        $validated = $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $session = ChatSession::findOrFail($id);

        ChatMessage::create([
            'chat_session_id' => $session->id,
            'sender' => 'customer',
            'body' => $validated['body'],
            'is_read' => false,
        ]);

        $session->update(['last_message_at' => now()]);

        return response()->json([
            'id' => $session->id,
            'messages' => $session->fresh('messages')->messages->map(fn (ChatMessage $m) => $this->shape($m)),
        ]);
    }

    public function messages(Request $request, int $id)
    {
        $after = max(0, (int) $request->query('after'));

        $session = ChatSession::findOrFail($id);

        $rows = $session->messages()->where('id', '>', $after)->get();

        return response()->json([
            'id' => $session->id,
            'messages' => $rows->map(fn (ChatMessage $m) => $this->shape($m)),
        ]);
    }

    private function shape(ChatMessage $m): array
    {
        return [
            'id' => $m->id,
            'sender' => $m->sender,
            'body' => $m->body,
            'created_at' => $m->created_at?->toIso8601String(),
        ];
    }
}