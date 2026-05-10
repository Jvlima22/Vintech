import { useState, useEffect } from "react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { DollarSign, ShoppingBag, Wine, Users, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

export const DashboardOverview = () => {
  const { profile } = useAuth();

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard', profile?.winery_id],
    enabled: !!profile?.winery_id,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
    queryFn: async () => {
      // 1. Buscar Vendas (Orders)
      const { data: orders } = await supabase
        .from("orders")
        .select(`*, items:order_items(quantity)`)
        .eq("winery_id", profile!.winery_id)
        .order("created_at", { ascending: false });

      // 2. Buscar Reservas (Bookings)
      const { data: bookings } = await supabase
        .from("bookings")
        .select(`*, event:events(title, date)`)
        .eq("winery_id", profile!.winery_id)
        .order("created_at", { ascending: false });

      // 3. Buscar Próximos Eventos (Sessões)
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .eq("winery_id", profile!.winery_id)
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true })
        .limit(4);

      const now = new Date();
      const thisMonth = { start: startOfMonth(now), end: endOfMonth(now) };
      
      const safeOrders = orders || [];
      const safeBookings = bookings || [];
      const safeEvents = events || [];

      // Cálculos de KPI
      const monthOrders = safeOrders.filter(o => isWithinInterval(parseISO(o.created_at), thisMonth));
      const monthRevenue = monthOrders.reduce((acc, o) => acc + (o.status === 'completed' ? Number(o.total_amount) : 0), 0);
      const totalBottles = safeOrders.reduce((acc, o) => acc + o.items.reduce((sum: number, i: any) => sum + i.quantity, 0), 0);
      const totalVisitors = safeBookings.reduce((acc, b) => acc + Number(b.participants || 0), 0);

      const stats = {
        revenue: monthRevenue,
        ordersCount: safeOrders.length,
        bottlesSold: totalBottles,
        visitors: totalVisitors,
        revenueChange: 12.5, // Mock change
        ordersChange: 5.2,
      };

      // Gráfico de Canais
      const channels: Record<string, number> = {};
      safeOrders.forEach(o => {
        const method = o.payment_method?.toUpperCase() || "OUTROS";
        channels[method] = (channels[method] || 0) + 1;
      });
      const channelData = Object.entries(channels).map(([canal, valor]) => ({ canal, valor }));

      // Gráfico de Receita Mensal
      const last6Months = Array.from({ length: 6 }).map((_, i) => {
        const d = subMonths(now, 5 - i);
        const monthStr = format(d, "MMM", { locale: ptBR });
        const interval = { start: startOfMonth(d), end: endOfMonth(d) };
        const monthRev = safeOrders
          .filter(o => o.status === 'completed' && isWithinInterval(parseISO(o.created_at), interval))
          .reduce((acc, o) => acc + Number(o.total_amount), 0);
        return { mes: monthStr, receita: monthRev };
      });

      // Pedidos Recentes
      const recentOrders = safeOrders.slice(0, 5).map(o => ({
        id: `#${o.id.substring(0, 4)}`,
        cliente: o.customer_name,
        valor: Number(o.total_amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        status: o.status === 'completed' ? "Pago" : o.status === 'pending' ? "Pendente" : "Cancelado"
      }));

      // Próximos Eventos
      const upcomingEvents = safeEvents.map(e => ({
        titulo: e.title,
        data: format(parseISO(e.date), "dd/MM '·' HH:mm", { locale: ptBR }),
        pessoas: e.booked_slots,
        tipo: "Sessão"
      }));

      return { stats, channelData, last6Months, recentOrders, upcomingEvents };
    }
  });

  const firstName = profile?.full_name?.split(" ")[0] || "Usuário";
  
  // Valores default para renderizar instantaneamente em 0ms
  const stats = dashboardData?.stats || { revenue: 0, ordersCount: 0, bottlesSold: 0, visitors: 0, revenueChange: 0, ordersChange: 0 };
  const chartData = dashboardData?.last6Months || [];
  const channelData = dashboardData?.channelData || [];
  const recentOrders = dashboardData?.recentOrders || [];
  const upcomingEvents = dashboardData?.upcomingEvents || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Visão Geral · {profile?.winery?.name || "Minha Vinícola"}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Olá, {firstName} ✦
          </h1>
          <p className="mt-1 text-muted-foreground">
            Aqui está um resumo do que está acontecendo na sua vinícola hoje.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Receita do mês" value={stats.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} change={stats.revenueChange} icon={DollarSign} variant="wine" />
        <KpiCard label="Pedidos Totais" value={stats.ordersCount.toString()} change={stats.ordersChange} icon={ShoppingBag} />
        <KpiCard label="Garrafas vendidas" value={stats.bottlesSold.toLocaleString("pt-BR")} icon={Wine} />
        <KpiCard label="Visitantes Totais" value={stats.visitors.toLocaleString("pt-BR")} icon={Users} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-2">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Desempenho de Vendas</h3>
              <p className="text-xs text-muted-foreground">Últimos 6 meses de receita</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success">
              <TrendingUp className="h-3 w-3" />
              Atualizado
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="receitaG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} />
              <Tooltip
                formatter={(value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="receita"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#receitaG)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="mb-6">
            <h3 className="font-display text-lg font-semibold">Vendas por canal</h3>
            <p className="text-xs text-muted-foreground">Volume por método</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={channelData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="canal" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={80} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="valor" fill="hsl(var(--gold))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card shadow-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border p-6">
            <div>
              <h3 className="font-display text-lg font-semibold">Pedidos recentes</h3>
              <p className="text-xs text-muted-foreground">Últimas movimentações</p>
            </div>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.length === 0 ? (
              <p className="p-10 text-center text-sm text-muted-foreground italic">Nenhum pedido registrado ainda.</p>
            ) : (
              recentOrders.map((o) => (
                <div key={o.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-secondary/50">
                  <div className="font-mono text-xs text-muted-foreground">{o.id}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{o.cliente}</div>
                  </div>
                  <div className="hidden text-right text-sm font-semibold sm:block">{o.valor}</div>
                  <span
                    className={
                      "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase " +
                      (o.status === "Pago"
                        ? "bg-success/10 text-success"
                        : o.status === "Pendente"
                        ? "bg-gold/15 text-gold-foreground"
                        : "bg-destructive/10 text-destructive")
                    }
                  >
                    {o.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Próximos eventos</h3>
              <p className="text-xs text-muted-foreground">Enoturismo</p>
            </div>
          </div>
          <ul className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="p-10 text-center text-sm text-muted-foreground italic">Nenhuma sessão agendada.</p>
            ) : (
              upcomingEvents.map((e) => (
                <li key={e.titulo} className="rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{e.titulo}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{e.data}</div>
                    </div>
                    <span className="shrink-0 rounded-full bg-wine px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold">
                      {e.tipo}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" /> {e.pessoas} pessoas
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
