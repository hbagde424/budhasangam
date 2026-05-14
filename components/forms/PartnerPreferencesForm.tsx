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

  const update = (k: string, v: any) => setPrefs((p: any) => ({ ...p, [k]: v }));

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
