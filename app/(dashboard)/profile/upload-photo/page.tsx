// app/(dashboard)/profile/upload-photo/page.tsx
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ProfilePictureUpload } from "@/components/forms/ProfilePictureUpload";

export default function UploadPhotoPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile").then(r => r.json()).then(d => {
      if (d.success) setPhotos(d.data?.photos ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const deletePhoto = async (photoId: string) => {
    await fetch("/api/upload", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ photoId }) });
    setPhotos(p => p.filter(ph => ph.id !== photoId));
  };

  return (
    <div className="max-w-2xl">
      <h1 className="section-title text-3xl mb-2">Manage Photos</h1>
      <p className="text-muted-foreground text-sm mb-8">Upload up to 3 photos (Free) or 10 photos (Premium)</p>

      {/* Profile photo */}
      <div className="card-base p-8 mb-6 text-center">
        <h2 className="font-serif text-xl font-semibold text-mahogany mb-5">Profile Photo</h2>
        <ProfilePictureUpload
          currentUrl={photos.find(p => p.isProfile)?.url}
          onUpload={(url) => setPhotos(p => p.map(ph => ph.isProfile ? {...ph, url} : ph))}
        />
      </div>

      {/* Gallery */}
      <div className="card-base p-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl font-semibold text-mahogany">Gallery Photos</h2>
          <span className="text-sm text-muted-foreground">{photos.filter(p => !p.isProfile).length} / 10</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {photos.filter(p => !p.isProfile).map(photo => (
            <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden group">
              <Image src={photo.url} alt="" fill className="object-cover" />
              <button onClick={() => deletePhoto(photo.id)}
                className="absolute inset-0 bg-mahogany/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-2xl">
                🗑
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 3 - photos.filter(p => !p.isProfile).length) }).map((_, i) => (
            <label key={i} className="aspect-square rounded-xl border-2 border-dashed border-ivory-dark flex flex-col items-center justify-center cursor-pointer hover:border-saffron hover:bg-saffron/3 transition-all">
              <span className="text-3xl text-muted-foreground mb-1">+</span>
              <span className="text-xs text-muted-foreground">Add Photo</span>
              <input type="file" accept="image/*" className="hidden"
                onChange={async e => {
                  if (!e.target.files?.[0]) return;
                  const fd = new FormData();
                  fd.append("file", e.target.files[0]);
                  fd.append("isProfile", "false");
                  const res = await fetch("/api/upload", { method: "POST", body: fd });
                  const data = await res.json();
                  if (data.success) setPhotos(p => [...p, data.data]);
                }} />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
