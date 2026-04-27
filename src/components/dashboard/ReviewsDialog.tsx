import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Star, MessageSquare, Calendar, User, GlassWater, Filter, X } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  booking: {
    customer_name: string;
    event: {
      title: string;
    }
  }
}

interface ReviewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviews: Review[];
  averageRating: number;
}

export function ReviewsDialog({ open, onOpenChange, reviews, averageRating }: ReviewsDialogProps) {
  const [filterEvent, setFilterEvent] = useState<string>("all");

  // Extrair nomes únicos de eventos para o filtro
  const uniqueEvents = useMemo(() => {
    const titles = reviews.map(r => r.booking.event.title);
    return Array.from(new Set(titles)).sort();
  }, [reviews]);

  // Filtrar as avaliações
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const matchesEvent = filterEvent === "all" || review.booking.event.title === filterEvent;
      return matchesEvent;
    });
  }, [reviews, filterEvent]);

  // Estatísticas filtradas
  const filteredStats = useMemo(() => {
    if (filteredReviews.length === 0) return { avg: 0, count: 0 };
    const avg = filteredReviews.reduce((acc, r) => acc + r.rating, 0) / filteredReviews.length;
    return { avg, count: filteredReviews.length };
  }, [filteredReviews]);

  const hasFilters = filterEvent !== "all";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col bg-card border-border shadow-elegant p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-display font-bold text-primary">
                Avaliações dos Clientes
              </DialogTitle>
              <DialogDescription className="mt-1">
                Analise o feedback e a satisfação dos seus visitantes.
              </DialogDescription>
            </div>
            <div className="text-right pr-10">
              <div className="flex items-center gap-1 text-2xl font-bold text-gold justify-end">
                {averageRating.toFixed(1)} <Star className="h-6 w-6 fill-gold" />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Média Geral ({reviews.length})</p>
            </div>
          </div>

          {/* Barra de Filtros e Stats */}
          <div className="mt-6 flex flex-wrap items-center gap-6 p-4 bg-secondary/20 rounded-2xl border border-border/50">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Filtrar por Experiência</span>
              <div className="w-[240px]">
                <Select value={filterEvent} onValueChange={setFilterEvent}>
                  <SelectTrigger className="h-9 bg-background border-border/50">
                    <SelectValue placeholder="Todas as Experiências" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Experiências</SelectItem>
                    {uniqueEvents.map(event => (
                      <SelectItem key={event} value={event}>{event}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="h-10 w-px bg-border/50 hidden md:block" />

            <div className="flex gap-8">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Média da Seleção</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-lg font-bold text-primary">{filteredStats.avg.toFixed(1)}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        className={cn(
                          "h-3 w-3",
                          s <= Math.round(filteredStats.avg) ? "fill-gold text-gold" : "text-muted/30"
                        )} 
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total de Avaliações</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-lg font-bold text-primary">{filteredStats.count}</span>
                  <MessageSquare className="h-4 w-4 text-muted-foreground/50" />
                </div>
              </div>
            </div>

            {hasFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setFilterEvent("all"); }}
                className="ml-auto h-8 text-[10px] uppercase tracking-widest text-wine hover:text-wine hover:bg-wine/5"
              >
                <X className="h-3 w-3 mr-1" /> Ver Tudo
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-gold/20">
          {filteredReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
              <MessageSquare className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Nenhum resultado encontrado.</p>
              <p className="text-sm">Tente selecionar uma experiência diferente.</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="group animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-wine/10 flex items-center justify-center text-wine font-bold border border-wine/20">
                    {review.booking.customer_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-sm leading-none flex items-center gap-2">
                          {review.booking.customer_name}
                          <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                          <span className="text-xs font-normal text-muted-foreground italic flex items-center gap-1">
                            <GlassWater className="h-3 w-3" /> {review.booking.event.title}
                          </span>
                        </h4>
                        <div className="flex gap-0.5 mt-1.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                              key={s} 
                              className={cn(
                                "h-3 w-3",
                                s <= review.rating ? "fill-gold text-gold" : "text-muted/30"
                              )} 
                            />
                          ))}
                        </div>
                      </div>
                      <time className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase tracking-tighter">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(review.created_at), "dd MMM yyyy", { locale: ptBR })}
                      </time>
                    </div>

                    {review.comment ? (
                      <div className="relative bg-secondary/30 p-4 rounded-2xl rounded-tl-none border border-border/50 italic text-sm text-primary/90">
                        "{review.comment}"
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">O cliente não deixou comentário escrito.</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
