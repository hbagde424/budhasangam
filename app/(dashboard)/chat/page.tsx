// app/(dashboard)/chat/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useSession } from "next-auth/react";

export default function ChatPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [connections, setConnections] = useState<any[]>([]);
  const [activeConnection, setActiveConnection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/chat")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setConnections(d.data);
          const connId = searchParams.get("connectionId");
          if (connId) {
            const found = d.data.find((c: any) => c.id === connId);
            if (found) setActiveConnection(found);
          } else if (d.data.length > 0) {
            setActiveConnection(d.data[0]);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const userId = session?.user?.id ?? "";

  return (
    <div className="h-[calc(100vh-90px)] flex gap-0 rounded-2xl overflow-hidden border border-ivory-dark bg-white shadow-sm">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-ivory-dark">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({length:5}).map((_,i) => <div key={i} className="h-16 rounded-xl bg-ivory-dark animate-pulse" />)}
          </div>
        ) : (
          <ChatList connections={connections} activeId={activeConnection?.id}
            currentUserId={userId} onSelect={setActiveConnection} />
        )}
      </div>

      {/* Chat window */}
      <div className="flex-1">
        {activeConnection ? (
          <ChatWindow connection={activeConnection} currentUserId={userId} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="text-5xl mb-4">☸</div>
            <p className="font-serif text-2xl text-mahogany mb-2">Select a conversation</p>
            <p className="text-muted-foreground text-sm">Begin with loving-kindness 🙏</p>
          </div>
        )}
      </div>
    </div>
  );
}
