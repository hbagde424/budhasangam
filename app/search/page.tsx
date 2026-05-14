// app/search/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { ProfileCard } from "@/components/search/ProfileCard";
import { FilterSidebar } from "@/components/search/FilterSidebar";

export default function SearchPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState("compatibility");
  const [search, setSearch] = useState("");

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "12", sortBy });
    Object.entries(filters).forEach(([k, v]) => v !== undefined && v !== "" && params.set(k, String(v)));
    const res = await fetch(`/api/search?${params}`);
    const data = await res.json();
    if (data.success) { setProfiles(data.data.items); setTotal(data.data.total); }
    setLoading(false);
  }, [page, filters, sortBy]);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const sendInterest = async (toUserId: string) => {
    await fetch("/api/interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId }),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-5 py-7">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
          <input className="input-field pl-10" placeholder="Search by name, city, profession..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-48" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="compatibility">Sort: Compatibility</option>
          <option value="newest">Sort: Newest First</option>
          <option value="age_asc">Sort: Age ↑</option>
          <option value="age_desc">Sort: Age ↓</option>
        </select>
      </div>

      <div className="flex gap-6">
        {/* Filters */}
        <div className="w-64 flex-shrink-0">
          <FilterSidebar filters={filters} onChange={setFilters} onReset={() => setFilters({})} />
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              <span className="text-mahogany font-bold">{total}</span> profiles found
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 gap-5">
              {Array.from({length:9}).map((_,i) => <div key={i} className="h-72 rounded-2xl bg-ivory-dark animate-pulse" />)}
            </div>
          ) : profiles.length === 0 ? (
            <div className="card-base p-16 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-serif text-2xl text-mahogany mb-2">No profiles found</p>
              <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
              <button onClick={() => setFilters({})} className="btn-saffron px-6 py-2.5 text-sm">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-5">
                {profiles.map(p => (
                  <ProfileCard key={p.id} profile={p} compatibility={p.compatibility}
                    onInterest={() => sendInterest(p.userId)} />
                ))}
              </div>
              {/* Pagination */}
              <div className="flex justify-center gap-3 mt-8">
                <button disabled={page === 1} onClick={() => setPage(p => p-1)}
                  className="btn-outline-saffron px-5 py-2 text-sm disabled:opacity-40">← Prev</button>
                <span className="flex items-center text-sm text-muted-foreground">Page {page}</span>
                <button onClick={() => setPage(p => p+1)}
                  className="btn-outline-saffron px-5 py-2 text-sm">Next →</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
