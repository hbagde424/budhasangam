// components/chat/MessageBubble.tsx
"use client";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: any;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const time = format(new Date(message.createdAt), "hh:mm a");

  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
        <span className="text-xs text-muted-foreground italic px-3 py-2 bg-ivory-dark rounded-2xl">
          Message deleted
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}>
      {message.messageType === "image" && message.mediaUrl ? (
        <div className={`max-w-[60%] rounded-2xl overflow-hidden shadow-sm ${isOwn ? "rounded-tr-sm" : "rounded-tl-sm"}`}>
          <img src={message.mediaUrl} alt="Shared image" className="w-full h-auto" />
        </div>
      ) : (
        <div className={isOwn ? "chat-bubble-sent" : "chat-bubble-recv"}>
          {message.content}
        </div>
      )}
      <div className="flex items-center gap-1 px-1">
        <span className="text-[10px] text-muted-foreground">{time}</span>
        {isOwn && (
          <span className="text-[10px] text-muted-foreground">
            {message.isRead ? "✓✓" : "✓"}
          </span>
        )}
      </div>
    </div>
  );
}
