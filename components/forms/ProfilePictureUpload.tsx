// components/forms/ProfilePictureUpload.tsx
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


// components/forms/PartnerPreferencesForm.tsx
"use client";
import { useState } from "react";

interface PartnerPreferencesFormProps {
  initial?: any;
  onSave: (prefs: any) => void;
}

export function PartnerPreferencesForm({ initial = {}, onSave }: PartnerPreferencesFormProps) {
  const [prefs, setPrefs] = useState({
    minAge: 24, maxAge: 34,
    minHeight: 155, maxHeight: 185,
    tradition: "ANY",
    diet: "NO_PREFERENCE",
    drinking: "NON_DRINKER_ONLY",
    smoking: "NON_SMOKER_ONLY",
    minEducation: "GRADUATE",
    maritalStatus: ["NEVER_MARRIED"],
    childrenAcceptable: false,
    locationPreference: "ANYWHERE",
    livingPreference: "DOESNT_MATTER",
    workingSpousePreference: "NO_PREFERENCE",
    horoscopeRequired: false,
    ...initial,
  });

  const update = (k: string, v: any) => setPrefs(p => ({ ...p, [k]: v }));

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-bold text-mahogany-mid mb-2 uppercase tracking-wide">{children}</label>
  );

  return (
    <div className="space-y-6">
      {/* Age */}
      <div>
        <Label>Age Range</Label>
        <div className="flex items-center gap-3">
          <input type="number" className="input-field w-28" min={18} max={70}
            value={prefs.minAge} onChange={e => update("minAge", +e.target.value)} />
          <span className="text-muted-foreground">to</span>
          <input type="number" className="input-field w-28" min={18} max={70}
            value={prefs.maxAge} onChange={e => update("maxAge", +e.target.value)} />
          <span className="text-muted-foreground text-sm">years</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Tradition */}
        <div>
          <Label>Tradition Preference</Label>
          <select className="input-field" value={prefs.tradition} onChange={e => update("tradition", e.target.value)}>
            {[["ANY","Any Buddhist"],["SAME","Same as mine"],["THERAVADA","Theravada"],["MAHAYANA","Mahayana"],["VAJRAYANA","Vajrayana"],["NAVAYANA","Navayana"]].map(([v,l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        {/* Diet */}
        <div>
          <Label>Diet Preference</Label>
          <select className="input-field" value={prefs.diet} onChange={e => update("diet", e.target.value)}>
            {[["NO_PREFERENCE","No Preference"],["VEGETARIAN_ONLY","Vegetarian Only"],["VEGAN_PREFERRED","Vegan Preferred"]].map(([v,l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <Label>Location Preference</Label>
          <select className="input-field" value={prefs.locationPreference} onChange={e => update("locationPreference", e.target.value)}>
            {[["ANYWHERE","Anywhere in India"],["SAME_CITY","Same City"],["SAME_STATE","Same State"],["ABROAD","Abroad OK"]].map(([v,l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        {/* Education */}
        <div>
          <Label>Minimum Education</Label>
          <select className="input-field" value={prefs.minEducation} onChange={e => update("minEducation", e.target.value)}>
            {[["ANY","No Preference"],["GRADUATE","Graduate+"],["POSTGRADUATE","Postgraduate+"]].map(([v,l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        {[
          { key: "childrenAcceptable", label: "Children from previous marriage acceptable" },
          { key: "horoscopeRequired", label: "Horoscope matching required" },
        ].map(item => (
          <label key={item.key} className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => update(item.key, !prefs[item.key as keyof typeof prefs])}
              className={`w-11 h-6 rounded-full relative transition-all cursor-pointer
                ${prefs[item.key as keyof typeof prefs] ? "bg-saffron" : "bg-ivory-dark"}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all
                ${prefs[item.key as keyof typeof prefs] ? "left-5" : "left-0.5"}`} />
            </div>
            <span className="text-sm text-mahogany-mid">{item.label}</span>
          </label>
        ))}
      </div>

      <button type="button" onClick={() => onSave(prefs)} className="btn-saffron w-full py-3 text-sm">
        Save Preferences
      </button>
    </div>
  );
}
