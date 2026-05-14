// components/search/FilterSidebar.tsx
"use client";
import { useState } from "react";

interface FilterSidebarProps {
  filters: Record<string, any>;
  onChange: (filters: Record<string, any>) => void;
  onReset: () => void;
}

export function FilterSidebar({ filters, onChange, onReset }: FilterSidebarProps) {
  const [open, setOpen] = useState(true);

  const update = (key: string, value: any) => onChange({ ...filters, [key]: value });

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-bold text-mahogany-mid mb-2 uppercase tracking-wide">
      {children}
    </label>
  );

  const Select = ({ field, opts }: { field: string; opts: [string, string][] }) => (
    <select className="input-field text-sm" value={filters[field] ?? ""} onChange={e => update(field, e.target.value)}>
      <option value="">Any</option>
      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );

  return (
    <div className="card-base p-5 h-fit sticky top-20">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-serif text-lg font-semibold text-mahogany">Filters</h3>
        <button onClick={onReset} className="text-xs text-saffron font-semibold hover:underline">Reset All</button>
      </div>

      <div className="space-y-5">
        {/* Age */}
        <div>
          <Label>Age Range</Label>
          <div className="flex gap-2 items-center">
            <input className="input-field text-sm w-20" type="number" placeholder="Min" min={18} max={60}
              value={filters.minAge ?? ""} onChange={e => update("minAge", e.target.value ? parseInt(e.target.value) : undefined)} />
            <span className="text-muted-foreground text-sm">–</span>
            <input className="input-field text-sm w-20" type="number" placeholder="Max" min={18} max={70}
              value={filters.maxAge ?? ""} onChange={e => update("maxAge", e.target.value ? parseInt(e.target.value) : undefined)} />
          </div>
        </div>

        {/* Tradition */}
        <div>
          <Label>Tradition</Label>
          <Select field="tradition" opts={[
            ["THERAVADA","Theravada"],["MAHAYANA","Mahayana"],
            ["VAJRAYANA","Vajrayana"],["NAVAYANA","Navayana"],["OTHER","Other"],
          ]} />
        </div>

        {/* Diet */}
        <div>
          <Label>Diet</Label>
          <Select field="diet" opts={[
            ["VEGETARIAN","Vegetarian"],["VEGAN","Vegan"],
            ["EGGETARIAN","Eggetarian"],["NON_VEGETARIAN","Non-vegetarian"],
          ]} />
        </div>

        {/* Meditation */}
        <div>
          <Label>Meditation</Label>
          <Select field="meditation" opts={[
            ["VIPASSANA","Vipassana"],["SAMATHA","Samatha"],
            ["METTA","Metta"],["ZEN","Zen"],["NONE","None / Beginner"],
          ]} />
        </div>

        {/* Vipassana */}
        <div>
          <Label>Vipassana Course</Label>
          <Select field="vipassanaCourse" opts={[
            ["TEN_DAY","10-day"],["TWENTY_DAY","20-day"],
            ["THIRTY_DAY","30-day"],["SERVED","Served as Server"],
          ]} />
        </div>

        {/* Marital */}
        <div>
          <Label>Marital Status</Label>
          <Select field="maritalStatus" opts={[
            ["NEVER_MARRIED","Never Married"],["DIVORCED","Divorced"],
            ["WIDOWED","Widowed"],["ANNULLED","Annulled"],
          ]} />
        </div>

        {/* Location */}
        <div>
          <Label>City / State</Label>
          <input className="input-field text-sm" placeholder="e.g. Nagpur, Maharashtra"
            value={filters.location ?? ""} onChange={e => update("location", e.target.value)} />
        </div>

        {/* Quick filters */}
        <div>
          <Label>Quick Filters</Label>
          <div className="flex flex-wrap gap-2">
            {[
              ["photoVerified", "Photo Verified"],
              ["hasChildren", "No Children"],
            ].map(([key, label]) => (
              <button key={key} onClick={() => update(key, filters[key] ? undefined : true)}
                className={`filter-chip ${filters[key] ? "active" : ""}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => onChange({ ...filters })} className="btn-saffron w-full text-sm py-3">
          Apply Filters
        </button>
      </div>
    </div>
  );
}
