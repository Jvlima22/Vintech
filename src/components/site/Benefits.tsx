import vineyard from "@/assets/vineyard.jpg";
import { Shield, Zap, Globe2, Building2 } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Multi-tenant nativo",
    desc: "Cada vinícola com banco isolado, segurança de nível enterprise e RBAC granular.",
  },
  {
    icon: Zap,
    title: "Performance otimizada",
    desc: "Construído sobre Next.js e PostgreSQL. Carrega em milissegundos, escala em milhões.",
  },
  {
    icon: Globe2,
    title: "Pensado para o terroir",
    desc: "Do controle de safra à comunicação com o enoturista, com nomenclatura do setor.",
  },
  {
    icon: Building2,
    title: "Pronto para crescer",
    desc: "Integrações com Stripe, Google OAuth, e exportação de relatórios em PDF.",
  },
];

export const Benefits = () => {
  return (
    <section id="beneficios" className="relative overflow-hidden bg-primary-deep py-24 md:py-32">
      <img
        src={vineyard}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-15"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary-deep via-primary-deep/95 to-primary-deep/70" />

      <div className="container relative">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Por que Vintech
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-primary-foreground md:text-5xl text-balance">
              Tecnologia à altura da
              <span className="block text-gold italic">tradição do vinho.</span>
            </h2>
            <p className="mt-6 max-w-lg text-lg text-primary-foreground/70">
              Combinamos a precisão da engenharia moderna com o respeito à arte vinícola.
              Uma plataforma feita para quem leva o ofício a sério.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/[0.04] p-6 backdrop-blur-sm transition-all hover:border-gold/40 hover:bg-primary-foreground/[0.07]"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-primary-foreground">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/65">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
