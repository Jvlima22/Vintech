import { useState, useEffect } from "react";
import { Bell, ShoppingBag, Calendar, AlertTriangle, MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function NotificationDropdown() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (profile?.winery_id) {
      fetchNotifications();
      unsubscribe = subscribeToNotifications();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [profile?.winery_id]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("winery_id", profile?.winery_id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel("realtime-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `winery_id=eq.${profile?.winery_id}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev].slice(0, 10));
          setUnreadCount(prev => prev + 1);
          // Opcional: som de notificação ou Toast aqui
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("winery_id", profile?.winery_id)
        .eq("is_read", false);

      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking single as read:", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "sale": return <ShoppingBag className="h-4 w-4 text-success" />;
      case "booking": return <Calendar className="h-4 w-4 text-primary" />;
      case "stock": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "feedback": return <MessageSquare className="h-4 w-4 text-wine" />;
      default: return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (!profile?.winery_id) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative transition-transform active:scale-95">
          <Bell className={cn("h-5 w-5 transition-colors", unreadCount > 0 ? "text-primary" : "text-muted-foreground")} />
          {unreadCount > 0 && (
            <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0 shadow-2xl border-border/50 backdrop-blur-xl bg-background/95" align="end">
        <div className="flex items-center justify-between p-4 pb-2">
          <DropdownMenuLabel className="font-display text-base font-bold">Notificações</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-7 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary hover:bg-primary/5">
              Limpar todas
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gold" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                <Bell className="h-6 w-6 text-muted-foreground/30" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Tudo em ordem por aqui!</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Nenhuma nova notificação no momento.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={cn(
                  "relative flex flex-col gap-1 p-4 transition-colors hover:bg-secondary/50 cursor-pointer",
                  !n.is_read && "bg-primary/5"
                )}
                onClick={() => markAsRead(n.id)}
              >
                {!n.is_read && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-gold rounded-full" />}
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/50",
                    !n.is_read ? "bg-background shadow-sm" : "bg-muted/30"
                  )}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs leading-none mb-1", !n.is_read ? "font-bold text-foreground" : "font-medium text-muted-foreground")}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight mb-1.5">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/50">
                      {n.created_at ? new Date(n.created_at).toLocaleDateString('pt-BR') : 'agora'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-foreground" disabled>
            Ver histórico completo
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
