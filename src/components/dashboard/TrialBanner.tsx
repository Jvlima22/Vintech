import { usePlanLimits } from "@/hooks/usePlanLimits";
import { Button } from "@/components/ui/button";
import { Zap, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export const TrialBanner = () => {
  const { data: planData } = usePlanLimits();

  if (!planData?.limits.isTrial) return null;

  return (
    <Link 
      to="/dashboard/configuracoes?tab=assinatura"
      className="flex items-center gap-2 bg-wine/10 hover:bg-wine/20 border border-wine/20 rounded-full px-3 py-1.5 transition-all animate-fade-in group"
    >
      <Clock className="h-3.5 w-3.5 text-wine animate-pulse" />
      <span className="text-[11px] font-medium text-wine whitespace-nowrap">
        Teste: <span className="font-bold">{planData.limits.trialDaysLeft} dias</span> restantes
      </span>
      <div className="h-4 w-[1px] bg-wine/20 mx-1 hidden sm:block"></div>
      <span className="text-[10px] font-bold text-wine/80 uppercase tracking-wider hidden sm:flex items-center gap-1 group-hover:text-wine">
        Assinar <Zap className="h-2.5 w-2.5 fill-current" />
      </span>
    </Link>
  );
};
