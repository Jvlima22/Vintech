import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "light";
  showText?: boolean;
}

export const Logo = ({ className, variant = "default", showText = true }: LogoProps) => {
  const textColor = variant === "light" ? "text-primary-foreground" : "text-foreground";
  const accentColor = variant === "light" ? "text-gold" : "text-primary";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 40 40"
        className="h-9 w-9 shrink-0"
        aria-hidden="true"
      >
        <circle cx="20" cy="20" r="19" fill="hsl(350 55% 22%)" stroke="hsl(var(--gold))" strokeWidth="1.2" />
        {/* stylized V + grape */}
        <path d="M12 14 L20 28 L28 14" stroke="hsl(var(--gold))" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="20" cy="22" r="2.2" fill="hsl(var(--gold))" />
      </svg>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn("font-display text-xl font-bold tracking-tight", textColor)}>
            Vin<span className={accentColor}>tech</span>
          </span>
          <span className={cn("mt-0.5 text-[9px] font-medium uppercase tracking-[0.2em]", variant === "light" ? "text-white/70" : "text-primary")}>
            Wine Management
          </span>
        </div>
      )}
    </div>
  );
};
