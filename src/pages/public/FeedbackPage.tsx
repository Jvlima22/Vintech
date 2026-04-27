import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, CheckCircle2, GlassWater } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function FeedbackPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data, error } = await supabase
          .from("bookings")
          .select("*, event:events(title)")
          .eq("id", bookingId)
          .single();

        if (error || !data) throw new Error("Reserva não encontrada");
        setBooking(data);
      } catch (err) {
        toast.error("Link de avaliação inválido ou expirado.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Por favor, selecione uma nota.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert([
        {
          booking_id: bookingId,
          winery_id: booking.winery_id,
          rating,
          comment,
        },
      ]);

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      toast.error("Erro ao enviar avaliação: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-wine" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center animate-in fade-in duration-500">
        <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <h1 className="text-3xl font-display font-bold text-primary mb-2">Obrigado pelo seu feedback!</h1>
        <p className="text-muted-foreground max-w-sm">
          Sua avaliação é fundamental para mantermos a excelência em nossas experiências na {booking?.winery_name || "vinícola"}.
        </p>
        <Button variant="outline" className="mt-8" onClick={() => navigate("/")}>
          Voltar ao início
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-md space-y-8 animate-in slide-in-from-bottom-4 duration-700">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-wine/10 mb-4">
            <GlassWater className="h-6 w-6 text-wine" />
          </div>
          <h1 className="text-2xl font-display font-bold">O que você achou?</h1>
          <p className="text-muted-foreground mt-2">
            Conte-nos como foi sua experiência: <br />
            <span className="font-semibold text-primary">{booking?.event?.title}</span>
          </p>
        </div>

        <div className="bg-card border border-border p-8 rounded-3xl shadow-elegant">
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform active:scale-90 hover:scale-110 p-1"
              >
                <Star
                  className={cn(
                    "h-10 w-10 transition-colors",
                    (hoveredRating || rating) >= star
                      ? "fill-gold text-gold"
                      : "text-muted/30"
                  )}
                />
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Seu comentário (opcional)</label>
              <Textarea
                placeholder="Ex: Foi uma experiência inesquecível, o sommelier foi muito atencioso..."
                className="min-h-[120px] bg-secondary/30 border-none resize-none rounded-2xl"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <Button
              className="w-full h-12 bg-wine text-gold hover:bg-wine/90 font-bold text-lg rounded-2xl"
              disabled={submitting || rating === 0}
              onClick={handleSubmit}
            >
              {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Enviar Avaliação"}
            </Button>
          </div>
        </div>

        <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
          Vintech Wine Management System
        </p>
      </div>
    </div>
  );
}
