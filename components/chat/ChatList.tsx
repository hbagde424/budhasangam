// components/chat/ChatList.tsx
"use client";
import Image from "next/image";
import { format, isToday, isYesterday } from "date-fns";

interface ChatListProps {
  connections: any[];
  activeId?: string;
  currentUserId: string;
  onSelect: (connection: any) => void;
}

function formatTime(date: string) {
  const d = new Date(date);
  if (isToday(d)) return format(d, "hh:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

export function ChatList({ connections, activeId, currentUserId, onSelect }: ChatListProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-ivory-dark">
        <h2 className="font-serif text-xl font-semibold text-mahogany mb-3">Messages</h2>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
          <input className="input-field pl-9 text-sm py-2.5" placeholder="Search conversations..." />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {connections.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="text-3xl mb-3">💬</div>
            <p className="font-serif text-lg text-mahogany mb-1">No conversations yet</p>
            <p className="text-xs text-muted-foreground">Accept an interest to start chatting</p>
          </div>
        ) : (
          connections.map((conn) => {
            const other = conn.user1Id === currentUserId ? conn.user2 : conn.user1;
            const profile = other?.profile;
            const photo = other?.photos?.[0]?.url;
            const lastMsg = conn.messages?.[0];
            const unread = conn._count?.messages ?? 0;
            const isActive = conn.id === activeId;

            return (
              <button
                key={conn.id}
                onClick={() => onSelect(conn)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 border-l-4 transition-all text-left hover:bg-ivory
                  ${isActive ? "bg-saffron/5 border-saffron" : "border-transparent"}`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-ivory-dark relative">
                    {photo ? (
                      <Image src={photo} alt={profile?.fullName ?? ""} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-saffron to-lotus-gold text-white font-bold text-lg">
                        {profile?.fullName?.[0] ?? "?"}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-jade rounded-full border-2 border-white" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-mahogany truncate">
                      {profile?.fullName ?? "Connection"}
                    </span>
                    {lastMsg && (
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        {formatTime(lastMsg.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs text-muted-foreground truncate">
                      {lastMsg
                        ? lastMsg.senderId === currentUserId
                          ? `You: ${lastMsg.content}`
                          : lastMsg.content
                        : `${profile?.workLocation ?? ""}`}
                    </p>
                    {unread > 0 && (
                      <span className="flex-shrink-0 w-5 h-5 bg-saffron rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
