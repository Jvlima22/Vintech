import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Wine, ShoppingBag, Users, Calendar, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export function GlobalSearch() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    products: any[];
    orders: any[];
    bookings: any[];
    staff: any[];
    events: any[];
  }>({ products: [], orders: [], bookings: [], staff: [], events: [] });
  
  const searchRef = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2 || !profile?.winery_id) {
      setResults({ products: [], orders: [], bookings: [], staff: [], events: [] });
      return;
    }

    setLoading(true);
    try {
      const q = `%${searchQuery}%`;
      const [productsRes, ordersRes, bookingsRes, staffRes, eventsRes] = await Promise.all([
        supabase.from("products").select("*").eq("winery_id", profile.winery_id).ilike("name", q).limit(3),
        supabase.from("orders").select("*").eq("winery_id", profile.winery_id).ilike("customer_name", q).limit(3),
        supabase.from("bookings").select("*").eq("winery_id", profile.winery_id).ilike("customer_name", q).limit(3),
        supabase.from("profiles").select("*").eq("winery_id", profile.winery_id).ilike("full_name", q).limit(3),
        supabase.from("events").select("*").eq("winery_id", profile.winery_id).ilike("title", q).limit(3)
      ]);

      setResults({
        products: productsRes.data || [],
        orders: ordersRes.data || [],
        bookings: bookingsRes.data || [],
        staff: staffRes.data || [],
        events: eventsRes.data || []
      });
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }, [profile?.winery_id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const onSelect = (path: string) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  const hasResults = results.products.length > 0 || results.orders.length > 0 || results.bookings.length > 0 || results.staff.length > 0 || results.events.length > 0;

  // Atalhos de navegação baseados na query
  const navigationShortcuts = [
    { name: "Ver Produtos", path: "/dashboard/produtos", keywords: ["produtos", "estoque", "vinhos", "prod"] },
    { name: "Ver Vendas", path: "/dashboard/vendas", keywords: ["vendas", "pedidos", "faturamento", "vend"] },
    { name: "Ver Enoturismo", path: "/dashboard/enoturismo", keywords: ["enoturismo", "eventos", "reservas", "agenda", "eno"] },
    { name: "Ver Equipe", path: "/dashboard/equipe", keywords: ["equipe", "funcionários", "staff", "membros", "equi"] },
    { name: "Ver Analytics", path: "/dashboard/analytics", keywords: ["analytics", "gráficos", "relatórios", "insights", "anal"] },
  ].filter(s => s.keywords.some(k => query.toLowerCase().includes(k)));

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className={cn(
        "relative flex items-center transition-all duration-300",
        open ? "z-50" : "z-0"
      )}>
        <Search className={cn(
          "absolute left-3 h-4 w-4 transition-colors",
          open ? "text-gold" : "text-muted-foreground"
        )} />
        <input
          type="text"
          placeholder="Buscar no Vintech..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className={cn(
            "h-10 w-full rounded-xl border border-input bg-secondary/40 pl-10 pr-10 text-sm outline-none transition-all",
            "placeholder:text-muted-foreground focus:border-gold/50 focus:bg-background/80 focus:ring-4 focus:ring-gold/5",
            open && "rounded-b-none border-gold/30 bg-background shadow-lg"
          )}
        />
        {query && (
          <button 
            onClick={() => { setQuery(""); setResults({ products: [], orders: [], bookings: [], staff: [], events: [] }); }}
            className="absolute right-3 hover:text-primary transition-colors"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {open && (query.length >= 2 || loading || navigationShortcuts.length > 0) && (
        <div className="absolute left-0 right-0 top-full z-40 max-h-[400px] overflow-y-auto rounded-b-xl border-x border-b border-gold/20 bg-background/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          
          {navigationShortcuts.length > 0 && (
            <div className="mb-4 border-b border-border/50 pb-2">
              <h4 className="px-2 mb-1 text-[10px] font-bold uppercase tracking-widest text-primary/60">Ações Rápidas</h4>
              {navigationShortcuts.map((s) => (
                <button
                  key={s.path}
                  onClick={() => onSelect(s.path)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm bg-primary/5 text-primary hover:bg-primary/10 transition-colors group mb-1"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white">
                    <Search className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-semibold">{s.name}</span>
                  <span className="ml-auto text-[10px] opacity-60">Ir para página →</span>
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gold" />
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center text-sm text-muted-foreground italic">
              Nenhum resultado para "{query}"
            </div>
          ) : (
            <div className="space-y-4 p-1">
              {results.products.length > 0 && (
                <div>
                  <h4 className="px-2 mb-1 text-[10px] font-bold uppercase tracking-widest text-gold/60">Produtos</h4>
                  {results.products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onSelect("/dashboard/produtos")}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-gold/5 transition-colors group"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-wine/10 text-wine group-hover:bg-wine group-hover:text-gold transition-colors">
                        <Wine className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{p.category}</p>
                      </div>
                      <span className="ml-auto text-[10px] font-mono text-muted-foreground">R$ {p.price}</span>
                    </button>
                  ))}
                </div>
              )}

              {results.orders.length > 0 && (
                <div>
                  <h4 className="px-2 mb-1 text-[10px] font-bold uppercase tracking-widest text-success/60">Vendas & Clientes</h4>
                  {results.orders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => onSelect("/dashboard/vendas")}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-success/5 transition-colors group"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-success/10 text-success group-hover:bg-success group-hover:text-white transition-colors">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{o.customer_name}</p>
                        <p className="text-[10px] text-muted-foreground">Pedido #{o.id.substring(0,4)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.events.length > 0 && (
                <div>
                  <h4 className="px-2 mb-1 text-[10px] font-bold uppercase tracking-widest text-primary/60">Eventos & Sessões</h4>
                  {results.events.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => onSelect("/dashboard/enoturismo")}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-primary/5 transition-colors group"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{e.title}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(e.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.bookings.length > 0 && (
                <div>
                  <h4 className="px-2 mb-1 text-[10px] font-bold uppercase tracking-widest text-amber-500/60">Agendamentos (Clientes)</h4>
                  {results.bookings.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => onSelect("/dashboard/enoturismo")}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-amber-500/5 transition-colors group"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{b.customer_name}</p>
                        <p className="text-[10px] text-muted-foreground">{b.participants} pessoas</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.staff.length > 0 && (
                <div>
                  <h4 className="px-2 mb-1 text-[10px] font-bold uppercase tracking-widest text-gold/60">Equipe</h4>
                  {results.staff.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onSelect("/dashboard/equipe")}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-gold/5 transition-colors group"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold group-hover:bg-gold group-hover:text-wine transition-colors overflow-hidden">
                        {s.avatar_url ? <img src={s.avatar_url} className="h-full w-full object-cover" /> : <Users className="h-4 w-4" />}
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{s.full_name}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{s.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
