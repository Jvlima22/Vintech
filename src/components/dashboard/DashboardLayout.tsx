import { Outlet, Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { GlobalSearch } from "@/components/dashboard/GlobalSearch";
import { NotificationDropdown } from "@/components/dashboard/NotificationDropdown";

export const DashboardLayout = () => {
  const { profile } = useAuth();

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-muted/40">
        <AppSidebar />

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-xl md:px-6">
            <SidebarTrigger className="text-foreground" />

            <div className="hidden flex-1 items-center md:flex">
              <GlobalSearch />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Link to="/" className="ml-2 hidden text-xs text-muted-foreground hover:text-primary md:inline">
                ← Voltar ao site
              </Link>
              <NotificationDropdown />
              
              {profile && (
                <Link 
                  to="/dashboard/perfil" 
                  className="ml-2 flex items-center gap-2.5 rounded-full border border-border bg-card pl-1 pr-3 py-1 transition-all hover:bg-secondary/50 hover:border-gold/30 group"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-wine text-[10px] font-semibold text-gold transition-transform group-hover:scale-105 overflow-hidden border border-gold/10">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name || ""} className="h-full w-full object-cover" />
                    ) : (
                      profile.full_name?.charAt(0) || "U"
                    )}
                  </div>
                  <div className="hidden text-left sm:block">
                    <div className="text-xs font-semibold leading-tight group-hover:text-gold transition-colors">{profile.full_name}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight">
                      {profile.role === 'admin' ? 'Administrador' : 'Equipe'} 
                      {profile.winery?.name ? ` · ${profile.winery.name}` : ''}
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
