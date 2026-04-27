import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, User, Mail, Calendar, Phone, CreditCard, MapPin, Ticket } from "lucide-react";

interface BookingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ORIGINS = [
  "São Paulo", "Rio Grande do Sul", "Rio de Janeiro", "Minas Gerais", 
  "Santa Catarina", "Paraná", "Nordeste", "Centro-Oeste", "Norte", 
  "Internacional", "Outros"
];

export function BookingSheet({ open, onOpenChange, onSuccess }: BookingSheetProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventPrice, setSelectedEventPrice] = useState(0);

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_cpf: "",
    customer_origin: "",
    event_id: "",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      if (!profile?.winery_id) return;
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("winery_id", profile.winery_id)
        .eq("status", "active");
      setEvents(data || []);
    };

    if (open) {
      fetchEvents();
      resetForm();
    }
  }, [open, profile?.winery_id]);

  const handleEventChange = (id: string) => {
    const event = events.find(e => e.id === id);
    setSelectedEventPrice(event?.price || 0);
    setFormData(prev => ({ ...prev, event_id: id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.winery_id) return;

    setLoading(true);
    try {
      // Validar CPF duplicado no mesmo evento
      if (formData.customer_cpf) {
        const { data: existingBooking } = await supabase
          .from("bookings")
          .select("id")
          .eq("event_id", formData.event_id)
          .eq("customer_cpf", formData.customer_cpf)
          .maybeSingle();

        if (existingBooking) {
          toast.error("Este CPF já possui uma reserva confirmada para este evento.");
          setLoading(false);
          return;
        }
      }

      const payload = {
        winery_id: profile.winery_id,
        event_id: formData.event_id,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        customer_cpf: formData.customer_cpf,
        customer_origin: formData.customer_origin,
        participants: 1, 
        total_price: selectedEventPrice,
        status: "confirmed",
      };

      const { error } = await supabase.from("bookings").insert([payload]);
      if (error) throw error;

      // Atualizar o contador de vagas no evento
      const { data: eventData } = await supabase
        .from("events")
        .select("booked_slots")
        .eq("id", formData.event_id)
        .single();

      await supabase
        .from("events")
        .update({ 
          booked_slots: (eventData?.booked_slots || 0) + 1 
        })
        .eq("id", formData.event_id);

      toast.success("Agendamento realizado com sucesso!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Erro ao agendar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      customer_cpf: "",
      customer_origin: "",
      event_id: "",
    });
    setSelectedEventPrice(0);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-card border-l border-border/50">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-gold" /> Novo Agendamento
          </SheetTitle>
          <SheetDescription>
            Preencha os dados do cliente para confirmar a reserva.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pb-8">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Ticket className="h-4 w-4 text-gold" /> Experiência / Evento *</Label>
              <Select onValueChange={handleEventChange} required value={formData.event_id}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Selecione a experiência" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.title} - R$ {Number(e.price).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_name" className="flex items-center gap-2"><User className="h-4 w-4 text-gold" /> Nome do Cliente *</Label>
              <Input 
                id="customer_name" 
                placeholder="Nome completo" 
                required 
                value={formData.customer_name}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                className="bg-background/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_email" className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold" /> E-mail</Label>
                <Input 
                  id="customer_email" 
                  type="email" 
                  placeholder="exemplo@email.com" 
                  value={formData.customer_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_phone" className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold" /> Telefone *</Label>
                <Input 
                  id="customer_phone" 
                  placeholder="(00) 00000-0000" 
                  required
                  value={formData.customer_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                  className="bg-background/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_cpf" className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-gold" /> CPF</Label>
                <Input 
                  id="customer_cpf" 
                  placeholder="000.000.000-00" 
                  value={formData.customer_cpf}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_cpf: e.target.value }))}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> Origem *</Label>
                <Select 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, customer_origin: val }))} 
                  required 
                  value={formData.customer_origin}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="De onde vem?" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORIGINS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-wine/5 border border-wine/10">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Valor Total do Agendamento:</span>
                <span className="text-xl font-bold text-wine">
                  {selectedEventPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground italic text-left">
                Calculado automaticamente com base na experiência selecionada.
              </p>
            </div>
          </div>

          <SheetFooter className="mt-8">
            <Button 
              type="submit" 
              disabled={loading || !formData.event_id}
              className="w-full bg-wine text-gold hover:bg-wine/90 font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirmando...
                </>
              ) : (
                "Confirmar Reserva"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
