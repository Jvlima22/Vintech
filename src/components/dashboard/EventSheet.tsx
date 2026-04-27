import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { Loader2, Calendar as CalendarIcon, Users, DollarSign, Tag, FileText, Clock } from "lucide-react";

interface EventSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  event?: any;
}

export function EventSheet({ open, onOpenChange, onSuccess, event }: EventSheetProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "10:00",
    capacity: "20",
    price: "",
  });

  useEffect(() => {
    if (event) {
      const eventDate = new Date(event.date);
      setFormData({
        title: event.title || "",
        description: event.description || "",
        date: eventDate.toISOString().split("T")[0],
        time: eventDate.toTimeString().substring(0, 5),
        capacity: event.capacity?.toString() || "20",
        price: event.price?.toString() || "",
      });
    } else {
      resetForm();
    }
  }, [event, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.winery_id) return;

    setLoading(true);
    try {
      const dateTime = new Date(`${formData.date}T${formData.time}:00`);
      
      const payload = {
        winery_id: profile.winery_id,
        title: formData.title,
        description: formData.description,
        date: dateTime.toISOString(),
        capacity: parseInt(formData.capacity),
        price: parseFloat(formData.price.replace(",", ".")),
        status: "active",
      };

      if (event?.id) {
        const { error } = await supabase
          .from("events")
          .update(payload)
          .eq("id", event.id);
        if (error) throw error;
        toast.success("Experiência atualizada!");
      } else {
        const { error } = await supabase.from("events").insert([payload]);
        if (error) throw error;
        toast.success("Experiência criada com sucesso!");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Erro ao salvar experiência: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      capacity: "20",
      price: "",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-card border-l border-border/50">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <Tag className="h-6 w-6 text-gold" /> 
            {event ? "Editar Experiência" : "Nova Experiência"}
          </SheetTitle>
          <SheetDescription>
            Defina os detalhes da sua oferta de enoturismo (tours, degustações, etc).
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pb-8">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gold" /> Título da Experiência *
              </Label>
              <Input 
                id="title" 
                placeholder="Ex: Degustação Harmonizada Premium" 
                required 
                value={formData.title}
                onChange={handleInputChange}
                className="bg-background/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-gold" /> Data *
                </Label>
                <Input 
                  id="date" 
                  type="date"
                  required 
                  value={formData.date}
                  onChange={handleInputChange}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gold" /> Horário *
                </Label>
                <Input 
                  id="time" 
                  type="time"
                  required 
                  value={formData.time}
                  onChange={handleInputChange}
                  className="bg-background/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gold" /> Capacidade (Vagas) *
                </Label>
                <Input 
                  id="capacity" 
                  type="number" 
                  required 
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gold" /> Preço por Pessoa *
                </Label>
                <Input 
                  id="price" 
                  placeholder="0,00" 
                  required 
                  value={formData.price}
                  onChange={handleInputChange}
                  className="bg-background/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gold" /> Descrição / Detalhes
              </Label>
              <Textarea 
                id="description" 
                placeholder="Descreva o que está incluso na experiência..." 
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="bg-background/50 resize-none"
              />
            </div>
          </div>

          <SheetFooter className="mt-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-wine text-gold hover:bg-wine/90 font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                </>
              ) : (
                "Salvar Experiência"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
