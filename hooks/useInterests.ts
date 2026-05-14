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
