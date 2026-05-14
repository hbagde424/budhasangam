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
