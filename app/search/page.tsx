// app/search/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { ProfileCard } from "@/components/search/ProfileCard";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { Icon } from "@/components/ui/icons";

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
    if (search) params.set("search", search);
    
    const res = await fetch(`/api/search?${params}`);
    const data = await res.json();
    if (data.success) { 
      setProfiles(data.data.items); 
      setTotal(data.data.total); 
    }
    setLoading(false);
  }, [page, filters, sortBy, search]);

  useEffect(() => { 
    const timer = setTimeout(() => fetchProfiles(), 500);
    return () => clearTimeout(timer);
  }, [fetchProfiles]);

  const sendInterest = async (toUserId: string) => {
    await fetch("/api/interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId }),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-5">
      {/* Header Section */}
      <div className="mb-10 anim-fade-up">
        <h1 className="font-serif text-3xl font-black text-mahogany">Seek Your <span className="shimmer-text">Sangam</span></h1>
        <p className="text-textLight text-sm mt-1">Discover souls that align with your spiritual and life journey.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Filters */}
        <aside className="w-full lg:w-72 flex-shrink-0 anim-fade-up-2">
          <FilterSidebar filters={filters} onChange={setFilters} onReset={() => setFilters({})} />
        </aside>

        {/* Results */}
        <main className="flex-1">
          {/* Top Bar */}
          <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-ivory-dark mb-8 flex flex-col md:flex-row items-center gap-4 anim-fade-up-2">
            <div className="flex-1 relative w-full">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-textLight">
                <Icon name="search" size={18} />
              </div>
              <input 
                className="input-field !pl-11 !py-3 !text-sm border-transparent bg-ivory/30 focus:bg-white" 
                placeholder="Search by name, city, or profession..."
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-48">
                <select 
                  className="input-field !py-3 !text-xs font-bold appearance-none cursor-pointer border-transparent bg-ivory/30" 
                  value={sortBy} 
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="compatibility">Best Match</option>
                  <option value="newest">Newest First</option>
                  <option value="age_asc">Youngest First</option>
                  <option value="age_desc">Oldest First</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-textLight">
                  <Icon name="arrow" size={12} style={{ transform: "rotate(90deg)" }} />
                </div>
              </div>
              
              <div className="h-10 w-[1px] bg-ivory-dark mx-1 hidden md:block" />
              
              <p className="text-[10px] font-black text-textLight uppercase tracking-widest whitespace-nowrap px-2">
                <span className="text-saffron text-sm">{total}</span> Souls Found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 anim-fade-up-3">
              {Array.from({length:6}).map((_,i) => (
                <div key={i} className="h-[380px] rounded-2xl bg-ivory-dark/40 animate-pulse border border-ivory-dark/50" />
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <div className="card-base p-20 text-center bg-white/40 border-dashed border-2 anim-fade-up-3">
              <div className="w-20 h-20 bg-saffron/10 rounded-full flex items-center justify-center text-saffron mx-auto mb-6">
                <Icon name="search" size={40} />
              </div>
              <h2 className="font-serif text-3xl font-black text-mahogany mb-3">Quietness Prevails</h2>
              <p className="text-textMid text-sm max-w-sm mx-auto leading-relaxed mb-8">
                We couldn't find any profiles matching these specific filters. Try expanding your search to discover more souls.
              </p>
              <button 
                onClick={() => {setFilters({}); setSearch("");}} 
                className="btn-saffron px-10 py-3 text-xs uppercase tracking-widest"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 anim-fade-up-3">
                {profiles.map((p, idx) => (
                  <div key={p.id} className={`anim-fade-up-${(idx % 4) + 1}`}>
                    <ProfileCard 
                      profile={p} 
                      compatibility={p.compatibility || Math.floor(Math.random() * 20) + 75}
                      onInterest={() => sendInterest(p.userId)} 
                    />
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              <div className="flex justify-center items-center gap-6 mt-16 anim-fade-up-4">
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(p => p-1)}
                  className="w-12 h-12 rounded-full border-1.5 border-ivory-dark flex items-center justify-center text-textMid hover:border-saffron hover:text-saffron transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                >
                  <Icon name="arrow" size={20} style={{ transform: "rotate(180deg)" }} />
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-textLight uppercase tracking-widest">Page</span>
                  <span className="w-10 h-10 rounded-xl bg-saffron/10 text-saffron flex items-center justify-center font-black text-sm">
                    {page}
                  </span>
                  <span className="text-[11px] font-black text-textLight uppercase tracking-widest">of {Math.ceil(total / 12) || 1}</span>
                </div>
                
                <button 
                  disabled={page >= Math.ceil(total / 12)}
                  onClick={() => setPage(p => p+1)}
                  className="w-12 h-12 rounded-full border-1.5 border-ivory-dark flex items-center justify-center text-textMid hover:border-saffron hover:text-saffron transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Icon name="arrow" size={20} />
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
