// components/search/FilterSidebar.tsx
"use client";
import { useState } from "react";
import { Icon } from "@/components/ui/icons";

interface FilterSidebarProps {
  filters: Record<string, any>;
  onChange: (filters: Record<string, any>) => void;
  onReset: () => void;
}

export function FilterSidebar({ filters, onChange, onReset }: FilterSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const update = (key: string, value: any) => onChange({ ...filters, [key]: value });

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-[11px] font-black text-textLight mb-2 uppercase tracking-[0.15em]">
      {children}
    </label>
  );

  const Select = ({ field, opts }: { field: string; opts: [string, string][] }) => (
    <div className="relative group">
      <select 
        className="input-field !py-2.5 !text-xs font-bold text-mahogany appearance-none cursor-pointer" 
        value={filters[field] ?? ""} 
        onChange={e => update(field, e.target.value)}
      >
        <option value="">Any Tradition</option>
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-textLight group-hover:text-saffron transition-colors">
        <Icon name="arrow" size={12} style={{ transform: "rotate(90deg)" }} />
      </div>
    </div>
  );

  return (
    <div className="card-base p-6 h-fit sticky top-24 border-saffron/10 shadow-sm overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Icon name="filter" size={64} />
      </div>

      <div className="flex items-center justify-between mb-6 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-saffron/10 rounded-lg flex items-center justify-center text-saffron">
            <Icon name="filter" size={16} />
          </div>
          <h3 className="font-serif text-lg font-black text-mahogany">Refine</h3>
        </div>
        <button 
          onClick={onReset} 
          className="text-[10px] font-black text-saffron uppercase tracking-widest hover:bg-saffron/5 px-2 py-1 rounded-md transition-all"
        >
          Reset
        </button>
      </div>

      <div className="space-y-6">
        {/* Age */}
        <div>
          <Label>Soul Age</Label>
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <input 
                className="input-field !py-2.5 !text-xs !pl-3" 
                type="number" 
                placeholder="Min" 
                min={18} 
                max={60}
                value={filters.minAge ?? ""} 
                onChange={e => update("minAge", e.target.value ? parseInt(e.target.value) : undefined)} 
              />
            </div>
            <span className="text-textLight font-bold text-xs">to</span>
            <div className="relative flex-1">
              <input 
                className="input-field !py-2.5 !text-xs !pl-3" 
                type="number" 
                placeholder="Max" 
                min={18} 
                max={70}
                value={filters.maxAge ?? ""} 
                onChange={e => update("maxAge", e.target.value ? parseInt(e.target.value) : undefined)} 
              />
            </div>
          </div>
        </div>

        {/* Tradition */}
        <div>
          <Label>Spiritual Path</Label>
          <Select field="tradition" opts={[
            ["THERAVADA","Theravada"],["MAHAYANA","Mahayana"],
            ["VAJRAYANA","Vajrayana"],["NAVAYANA","Navayana"],["OTHER","Other"],
          ]} />
        </div>

        {/* Meditation */}
        <div>
          <Label>Dhamma Practice</Label>
          <div className="grid grid-cols-1 gap-2">
            {[
              ["VIPASSANA","Vipassana"],["SAMATHA","Samatha"],
              ["METTA","Metta"],["ZEN","Zen"]
            ].map(([v, l]) => (
              <button 
                key={v}
                onClick={() => update("meditation", filters.meditation === v ? "" : v)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl border-1.5 transition-all text-[11px] font-bold
                  ${filters.meditation === v 
                    ? "border-saffron bg-saffron/5 text-saffron" 
                    : "border-ivory-dark text-textMid hover:border-saffron/50 hover:bg-ivory/50"}`}
              >
                {l}
                {filters.meditation === v && <Icon name="check" size={12} />}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <Label>Sacred Space (Location)</Label>
          <div className="relative">
            <input 
              className="input-field !py-2.5 !text-xs !pl-9" 
              placeholder="Nagpur, Pune..."
              value={filters.location ?? ""} 
              onChange={e => update("location", e.target.value)} 
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-textLight">
              <Icon name="map" size={14} />
            </div>
          </div>
        </div>

        {/* Marital */}
        <div>
          <Label>Journey Status</Label>
          <div className="flex flex-wrap gap-2">
            {[
              ["NEVER_MARRIED","Never Married"],["DIVORCED","Divorced"],
              ["WIDOWED","Widowed"]
            ].map(([v, l]) => (
              <button 
                key={v} 
                onClick={() => update("maritalStatus", filters.maritalStatus === v ? "" : v)}
                className={`filter-chip !px-3 !py-2 !text-[10px] !font-bold tracking-tight
                  ${filters.maritalStatus === v ? "active" : ""}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => onChange({ ...filters })} 
          className="btn-saffron w-full !py-3 text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-saffron/20 mt-4 group"
        >
          Seek Matches
        </button>
      </div>
    </div>
  );
}
