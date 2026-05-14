// hooks/useSocket.ts
"use client";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

let socket: Socket | null = null;

export function useSocket() {
  const { data: session } = useSession();
  const initialized = useRef(false);

  useEffect(() => {
    if (!session?.user?.id || initialized.current) return;
    initialized.current = true;

    socket = io(process.env.NEXT_PUBLIC_APP_URL ?? "", {
      path: "/api/socket",
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket?.emit("authenticate", session.user.id);
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Disconnected");
    });

    return () => {
      socket?.disconnect();
      socket = null;
      initialized.current = false;
    };
  }, [session?.user?.id]);

  return socket;
}

export function getSocket() {
  return socket;
}


// hooks/useProfile.ts
"use client";
import { useState, useEffect } from "react";

export function useProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.success) setProfile(data.data);
      else setError(data.error);
    } catch {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refetch(); }, []);

  const updateProfile = async (updates: Record<string, any>) => {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: updates }),
    });
    const data = await res.json();
    if (data.success) { setProfile((p: any) => ({ ...p, profile: data.data })); return true; }
    return false;
  };

  return { profile, loading, error, refetch, updateProfile };
}


// hooks/useInterests.ts
"use client";
import { useState, useEffect } from "react";

export function useInterests(type: "received" | "sent" = "received") {
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/interests?type=${type}`)
      .then(r => r.json())
      .then(d => setInterests(d.success ? d.data : []))
      .finally(() => setLoading(false));
  }, [type]);

  const respond = async (interestId: string, action: "ACCEPTED" | "DECLINED") => {
    const res = await fetch("/api/interests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interestId, action }),
    });
    const data = await res.json();
    if (data.success) {
      setInterests(p => p.map(i => i.id === interestId ? { ...i, status: action } : i));
    }
    return data.success;
  };

  const sendInterest = async (toUserId: string, message?: string) => {
    const res = await fetch("/api/interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId, message }),
    });
    return (await res.json()).success;
  };

  return { interests, loading, respond, sendInterest };
}
