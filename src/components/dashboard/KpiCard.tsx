import { cn } from "@/lib/utils";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  hint?: string;
  variant?: "default" | "wine";
}

export const KpiCard = ({ label, value, change, icon: Icon, hint, variant = "default" }: KpiCardProps) => {
  const positive = (change ?? 0) >= 0;
  const isWine = variant === "wine";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-6 transition-all hover:-translate-y-0.5",
        isWine
          ? "border-primary/20 bg-wine text-primary-foreground shadow-elegant"
          : "border-border bg-card shadow-card hover:shadow-elegant"
      )}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold/10 blur-2xl transition-all group-hover:bg-gold/25" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p
            className={cn(
              "text-xs font-medium uppercase tracking-wider",
              isWine ? "text-primary-foreground/60" : "text-muted-foreground"
            )}
          >
            {label}
          </p>
          <p className={cn("mt-3 font-display text-3xl font-bold tracking-tight", isWine && "text-gold")}>
            {value}
          </p>
          {hint && (
            <p className={cn("mt-1 text-xs", isWine ? "text-primary-foreground/55" : "text-muted-foreground")}>
              {hint}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            isWine ? "bg-primary-foreground/10 text-gold" : "bg-secondary text-primary"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {change !== undefined && (
        <div
          className={cn(
            "relative mt-4 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
            positive
              ? isWine
                ? "bg-success/20 text-success-foreground"
                : "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {positive ? "+" : ""}
          {change}% vs. mês anterior
        </div>
      )}
    </div>
  );
};
