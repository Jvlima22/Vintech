import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Configuração estática das funcionalidades e estilo mapeada pelos IDs do .env
const planConfig: Record<string, any> = {
  [import.meta.env.VITE_STRIPE_PRICE_VINHEDO]: {
    features: ["Até 3 membros na equipe", "Acesso a todos os módulos", "500 pedidos/mês", "Suporte por email"],
    highlighted: false,
  },
  [import.meta.env.VITE_STRIPE_PRICE_RESERVA]: {
    features: [
      "Até 7 membros na equipe",
      "Acesso a todos os módulos",
      "1.000 pedidos/mês",
      "Clube de assinatura",
      "Suporte prioritário",
    ],
    highlighted: true,
  },
  [import.meta.env.VITE_STRIPE_PRICE_GRAND_CRU]: {
    features: [
      "Membros ilimitados",
      "Acesso a todos os módulos",
      "Pedidos ilimitados",
      "API & integrações custom",
      "SLA 99.9% e Gerente dedicado",
    ],
    highlighted: false,
  },
};

interface Plan {
  priceId: string;
  name: string;
  price: string | number;
  desc: string;
  features?: string[];
  highlighted?: boolean;
}

// Função para formatar o nome que vem da Stripe (ex: VINTECH [Viticultura] -> Vintech Viticultura)
const formatPlanName = (name: string) => {
  return name.replace(/VINTECH\s*\[(.*?)\]/gi, "Vintech $1").trim();
};

// Planos de fallback com os valores REAIS encontrados na sua Stripe
const staticPlans: Plan[] = [
  {
    priceId: import.meta.env.VITE_STRIPE_PRICE_VINHEDO || "",
    name: formatPlanName("VINTECH [Viticultura]"),
    price: "129",
    desc: "Solução fundamental para gestão operacional e conformidade.",
    features: planConfig[import.meta.env.VITE_STRIPE_PRICE_VINHEDO]?.features,
    highlighted: false,
  },
  {
    priceId: import.meta.env.VITE_STRIPE_PRICE_RESERVA || "",
    name: formatPlanName("VINTECH [Business]"),
    price: "349",
    desc: "Gestão avançada para vinícolas em expansão.",
    features: planConfig[import.meta.env.VITE_STRIPE_PRICE_RESERVA]?.features,
    highlighted: true,
  },
  {
    priceId: import.meta.env.VITE_STRIPE_PRICE_GRAND_CRU || "",
    name: formatPlanName("VINTECH [Sommelier]"),
    price: "849",
    desc: "Ecossistema completo de gestão e inteligência vitivinícola.",
    features: planConfig[import.meta.env.VITE_STRIPE_PRICE_GRAND_CRU]?.features,
    highlighted: false,
  },
];

export const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>(staticPlans); // Começa com os estáticos
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/checkout/plans`);
        
        if (!response.ok) throw new Error("Erro na API");
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          const mergedPlans = data.map((stripePlan: any) => ({
            ...stripePlan,
            name: formatPlanName(stripePlan.name), // Formata o nome dinâmico
            features: planConfig[stripePlan.priceId]?.features || [],
            highlighted: planConfig[stripePlan.priceId]?.highlighted || false,
          }));
          setPlans(mergedPlans);
        }
      } catch (error) {
        console.error("Erro ao carregar planos da Stripe, usando fallback:", error);
        // Mantém os staticPlans que já estão no estado inicial
      } finally {
        setFetching(false);
      }
    };

    fetchPlans();
  }, []);

  const handleCheckout = async (plan: Plan) => {
    if (!user) {
      toast.warning("Você precisa estar logado para assinar um plano.", {
        description: "Por favor, crie uma conta ou faça login para continuar."
      });
      navigate("/login");
      return;
    }

    setLoadingPlan(plan.name);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/checkout/create-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          priceId: plan.priceId,
          userId: user.id,
          returnUrl: window.location.origin + "/dashboard" // Se for a landing page, manda pro dashboard
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Erro ao criar sessão de checkout");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar pagamento");
      console.error(error);
    } finally {
      setLoadingPlan(null);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section id="planos" className="py-24 md:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Planos transparentes
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl text-balance">
            Escolha o plano que combina com o
            <span className="text-primary"> ritmo da sua colheita.</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={cn(
                "relative rounded-2xl border p-8 transition-all hover:-translate-y-1",
                p.highlighted
                  ? "border-primary/40 bg-wine text-primary-foreground shadow-elegant scale-[1.02]"
                  : "border-border bg-card shadow-card hover:shadow-elegant"
              )}
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-xs font-semibold uppercase tracking-wider text-gold-foreground">
                  Mais escolhido
                </span>
              )}

              <h3 className={cn("font-display text-2xl font-bold", p.highlighted && "text-gold")}>
                {p.name}
              </h3>
              <p className={cn("mt-2 text-sm", p.highlighted ? "text-primary-foreground/70" : "text-muted-foreground")}>
                {p.desc}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-2xl font-medium opacity-70">R$</span>
                <span className="font-display text-5xl font-bold">{p.price}</span>
                <span className={cn("text-sm", p.highlighted ? "text-primary-foreground/60" : "text-muted-foreground")}>
                  /mês
                </span>
              </div>

              <Button
                variant={p.highlighted ? "hero" : "outline"}
                size="lg"
                className="mt-6 w-full"
                onClick={() => handleCheckout(p)}
                disabled={loadingPlan === p.name}
              >
                {loadingPlan === p.name ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Começar agora
              </Button>

              <ul className="mt-8 space-y-3">
                {p.features?.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className={cn("mt-0.5 h-4 w-4 shrink-0", p.highlighted ? "text-gold" : "text-primary")} />
                    <span className={p.highlighted ? "text-primary-foreground/85" : "text-foreground/80"}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
