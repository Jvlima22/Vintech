import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Users, 
  DollarSign, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  CreditCard, 
  Plus,
  Mail,
  User,
  ExternalLink,
  Star,
  CheckCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface EventDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
  bookings: any[];
  onAddParticipant: () => void;
  onEditEvent: () => void;
  onRefresh: () => void;
}

export function EventDetailsDialog({ 
  open, 
  onOpenChange, 
  event, 
  bookings, 
  onAddParticipant,
  onEditEvent,
  onRefresh
}: EventDetailsDialogProps) {
  const [isClosing, setIsClosing] = useState(false);
  if (!event) return null;

  const totalRevenue = bookings.reduce((acc, b) => acc + Number(b.total_price), 0);
  const occupancyRate = Math.round((event.booked_slots / event.capacity) * 100);
  const isCompleted = event.status === "completed";

  const handleCompleteEvent = async () => {
    if (!confirm("Deseja encerrar esta experiência e enviar as solicitações de avaliação?")) return;
    
    setIsClosing(true);
    try {
      // 1. Atualizar status do evento
      const { error } = await supabase
        .from("events")
        .update({ status: "completed" })
        .eq("id", event.id);

      if (error) throw error;

      // 2. Disparar mensagens via Backend (Invisível)
      await fetch(`${import.meta.env.VITE_API_URL}/api/whatsapp/send-bulk-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventTitle: event.title,
          bookings: bookings,
          baseUrl: window.location.origin
        })
      });

      toast.success("Experiência encerrada e avaliações enviadas automaticamente!");
      onRefresh();
    } catch (err: any) {
      toast.error("Erro ao encerrar: " + err.message);
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border shadow-elegant">
        <DialogHeader className="border-b border-border pb-6">
          <div className="flex justify-between items-start">
            <div className="max-w-[50%]">
              <DialogTitle className="text-2xl font-display font-bold text-primary truncate">
                {event.title}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-gold" />
                  {format(new Date(event.date), "dd/MM/yy", { locale: ptBR })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-gold" />
                  {format(new Date(event.date), "HH:mm")}
                </span>
              </DialogDescription>
            </div>
            <div className="flex flex-wrap justify-end gap-2 pr-10">
              {!isCompleted && (
                <>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive border-destructive/20 hover:bg-destructive/5"
                    disabled={isClosing}
                    onClick={handleCompleteEvent}
                  >
                    {isClosing ? (
                      <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-1 h-3.5 w-3.5" />
                    )}
                    Encerrar
                  </Button>
                  <Button variant="outline" size="sm" onClick={onEditEvent}>
                    Configurar
                  </Button>
                  <Button variant="hero" size="sm" onClick={onAddParticipant}>
                    <Plus className="mr-1 h-4 w-4" /> Novo Check-in
                  </Button>
                </>
              )}
              {isCompleted && (
                <span className="bg-success/10 text-success border border-success/20 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Experiência Concluída
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
          <div className="bg-secondary/30 p-4 rounded-xl border border-border/50">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Ocupação</p>
            <div className="flex items-end justify-between mt-1">
              <p className="text-2xl font-bold">{event.booked_slots} / {event.capacity}</p>
              <p className={cn(
                "text-xs font-medium",
                occupancyRate > 80 ? "text-wine" : "text-success"
              )}>{occupancyRate}%</p>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-secondary">
              <div 
                className="h-full rounded-full bg-gold-gradient transition-all duration-500" 
                style={{ width: `${occupancyRate}%` }} 
              />
            </div>
          </div>

          <div className="bg-secondary/30 p-4 rounded-xl border border-border/50">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Receita da Sessão</p>
            <p className="text-2xl font-bold mt-1 text-wine">
              {totalRevenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">Ticket médio: {(totalRevenue / (event.booked_slots || 1)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
          </div>

          <div className="bg-secondary/30 p-4 rounded-xl border border-border/50">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Status</p>
            <div className="mt-2">
              <span className={cn(
                "rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider",
                event.status === "active" ? "bg-success/10 text-success border border-success/20" : "bg-muted text-muted-foreground"
              )}>
                {event.status === "active" ? "Confirmado" : "Pendente"}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
              <Users className="h-3 w-3" /> {bookings.length} grupos reservados
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-semibold text-lg">Lista de Participantes</h4>
            <span className="text-xs text-muted-foreground">{bookings.length} agendamentos</span>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-secondary/50 p-3 grid grid-cols-4 text-[10px] uppercase tracking-wider font-bold text-muted-foreground sticky top-0 z-10 border-b border-border">
              <div className="col-span-2 pl-2">Cliente</div>
              <div>Origem</div>
              <div className="text-right pr-2">Contato</div>
            </div>
            <div className="divide-y divide-border max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gold/20">
              {bookings.length > 0 ? (
                bookings.map((b) => (
                  <div key={b.id} className="p-4 grid grid-cols-4 items-center hover:bg-secondary/20 transition-colors">
                    <div className="col-span-2">
                      <p className="font-medium text-sm flex items-center gap-2">
                        <User className="h-3 w-3 text-gold" /> {b.customer_name}
                      </p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <CreditCard className="h-3 w-3" /> {b.customer_cpf || "Sem CPF"}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {b.customer_email || "Sem e-mail"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gold/10 text-gold-foreground text-[10px] font-medium">
                        <MapPin className="h-3 w-3" /> {b.customer_origin || "Outros"}
                      </span>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <p className="text-xs font-semibold">{b.customer_phone || "N/A"}</p>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 rounded-full text-gold hover:text-gold hover:bg-gold/10"
                          onClick={() => {
                            const link = `${window.location.origin}/feedback/${b.id}`;
                            const msg = window.encodeURIComponent(`Olá ${b.customer_name}! O que achou da sua experiência na vinícola? Avalie aqui: ${link}`);
                            window.open(`https://wa.me/55${b.customer_phone?.replace(/\D/g, "")}?text=${msg}`, "_blank");
                          }}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="h-auto p-0 text-[10px] text-primary"
                          onClick={() => {
                            const msg = window.encodeURIComponent(`Olá ${b.customer_name}, estamos aguardando você para a experiência ${event.title}!`);
                            window.open(`https://wa.me/55${b.customer_phone?.replace(/\D/g, "")}?text=${msg}`, "_blank");
                          }}
                        >
                          WhatsApp <ExternalLink className="ml-1 h-2 w-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Nenhum participante confirmado nesta sessão.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
