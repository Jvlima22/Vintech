import { Wine, MapPin, ShoppingCart, Users, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const modules = [
  {
    icon: Wine,
    title: "Produtos",
    desc: "Catálogo completo de vinhos, safras, estoque e categorias. Fichas técnicas e harmonizações.",
    features: ["Gestão de safras", "Controle de estoque", "Fichas técnicas"],
  },
  {
    icon: MapPin,
    title: "Enoturismo",
    desc: "Visitas guiadas, degustações, eventos sazonais, hospedagem e cursos. Calendário integrado.",
    features: ["Agendamentos", "Eventos & Vindima", "Hospedagem"],
  },
  {
    icon: ShoppingCart,
    title: "Vendas",
    desc: "Pedidos, clientes, distribuidores, clube de assinatura e e-commerce próprio integrado.",
    features: ["Clube de assinatura", "Distribuição B2B", "E-commerce"],
  },
  {
    icon: Users,
    title: "Equipe",
    desc: "Funcionários, papéis, permissões granulares por módulo e departamento. Multi-tenant.",
    features: ["RBAC completo", "Departamentos", "Permissões finas"],
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "KPIs, dashboards personalizados por papel, gráficos de tendência e exportação de relatórios.",
    features: ["KPIs em tempo real", "Relatórios PDF", "Tendências"],
  },
];

export const Modules = () => {
  return (
    <section id="modulos" className="relative py-24 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Cinco módulos. Uma plataforma.
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl text-balance">
            Tudo que sua vinícola precisa,
            <span className="text-primary"> em um só lugar.</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Cada módulo pensado para a realidade do dia-a-dia: do produtor ao distribuidor,
            do enoturista ao sommelier.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod, i) => (
            <article
              key={mod.title}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-elegant hover:border-primary/30",
                i === 0 && "lg:col-span-2 lg:row-span-1"
              )}
            >
              <div className="absolute right-0 top-0 h-32 w-32 -translate-y-12 translate-x-12 rounded-full bg-gold/5 blur-2xl transition-all duration-500 group-hover:bg-gold/15" />

              <div className="relative">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-wine text-gold shadow-elegant">
                  <mod.icon className="h-5 w-5" />
                </div>

                <h3 className="font-display text-2xl font-semibold">{mod.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{mod.desc}</p>

                <ul className="mt-6 space-y-2">
                  {mod.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <span className="h-1 w-1 rounded-full bg-gold" />
                      <span className="text-foreground/70">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
