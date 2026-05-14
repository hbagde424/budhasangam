// components/chat/ChatWindow.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";

const ICEBREAKERS = [
  "What drew you to Buddhism? 🙏",
  "Describe your daily Dhamma practice ☸",
  "Favorite teaching from the Buddha?",
  "What does Metta mean to you in marriage?",
];

interface ChatWindowProps {
  connection: any;
  currentUserId: string;
}

export function ChatWindow({ connection, currentUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const other = connection.user1Id === currentUserId ? connection.user2 : connection.user1;
  const otherProfile = other?.profile;

  useEffect(() => {
    fetch(`/api/chat?connectionId=${connection.id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setMessages(d.data?.messages ?? []); })
      .finally(() => setLoading(false));
  }, [connection.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content) return;
    setInput("");
    setSending(true);
    const tempMsg = {
      id: "temp_" + Date.now(), senderId: currentUserId,
      content, createdAt: new Date().toISOString(), isRead: false,
    };
    setMessages(p => [...p, tempMsg]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: connection.id, content }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(p => p.map(m => m.id === tempMsg.id ? data.data : m));
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-ivory-dark bg-white">
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-saffron to-lotus-gold flex items-center justify-center text-white font-bold text-base">
            {otherProfile?.fullName?.[0] ?? "?"}
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-jade rounded-full border-2 border-white" />
        </div>
        <div className="flex-1">
          <p className="font-serif font-bold text-mahogany">{otherProfile?.fullName ?? "Connection"}</p>
          <p className="text-xs text-jade font-semibold">● Online · {otherProfile?.workLocation ?? ""}</p>
        </div>
        <div className="flex gap-2">
          {["📞","📹","ℹ️"].map(icon => (
            <button key={icon} className="w-9 h-9 rounded-xl border border-ivory-dark text-base hover:bg-ivory transition-colors">
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-ivory/50">
        {loading ? (
          <div className="flex justify-center py-8 text-muted-foreground text-sm">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-3">☸</div>
            <p className="text-sm text-muted-foreground">Start your mindful conversation</p>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === currentUserId} />
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Icebreakers */}
      <div className="px-4 py-2 border-t border-ivory-dark bg-ivory overflow-x-auto">
        <div className="flex gap-2">
          {ICEBREAKERS.map(q => (
            <button key={q} onClick={() => send(q)}
              className="whitespace-nowrap px-3 py-1.5 rounded-full border border-saffron/25 bg-white text-xs font-semibold text-saffron-dark hover:bg-saffron/5 transition-colors flex-shrink-0">
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 px-4 py-4 border-t border-ivory-dark bg-white">
        <button className="w-9 h-9 rounded-xl border border-ivory-dark flex items-center justify-center text-base hover:bg-ivory transition-colors">📎</button>
        <button className="w-9 h-9 rounded-xl border border-ivory-dark flex items-center justify-center text-base hover:bg-ivory transition-colors">😊</button>
        <input className="input-field flex-1 text-sm py-2.5"
          placeholder="Write a mindful message..."
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} />
        <button onClick={() => send()} disabled={!input.trim() || sending}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-saffron to-saffron-dark flex items-center justify-center text-white text-base disabled:opacity-50 hover:shadow-lg hover:shadow-saffron/30 transition-all">
          ➤
        </button>
      </div>
    </div>
  );
}
