"use client";
import { useState, useRef } from "react";
import Image from "next/image";

interface ProfilePictureUploadProps {
  currentUrl?: string;
  onUpload?: (url: string) => void;
}

export function ProfilePictureUpload({ currentUrl, onUpload }: ProfilePictureUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPEG, PNG and WebP allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("isProfile", "true");

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        onUpload?.(data.data.url);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Photo circle */}
      <div
        className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-ivory-dark bg-ivory cursor-pointer group"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <Image src={preview} alt="Profile" fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <span className="text-4xl">👤</span>
          </div>
        )}
        <div className="absolute inset-0 bg-mahogany/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-2xl">📷</span>
        </div>
        {uploading && (
          <div className="absolute inset-0 bg-mahogany/60 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {/* Camera badge */}
        <div className="absolute bottom-1 right-1 w-8 h-8 bg-saffron rounded-full flex items-center justify-center border-2 border-white">
          <span className="text-white text-sm">📷</span>
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

      <button type="button" onClick={() => inputRef.current?.click()}
        className="btn-outline-saffron text-sm py-2 px-5">
        {preview ? "Change Photo" : "Upload Photo"}
      </button>

      {error && <p className="text-red-500 text-xs">{error}</p>}
      <p className="text-xs text-muted-foreground text-center">JPEG, PNG or WebP · Max 5MB<br />Face should be clearly visible</p>
    </div>
  );
}
