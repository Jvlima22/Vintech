import { LayoutDashboard, Wine, MapPin, ShoppingCart, Users, BarChart3, Settings, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const mainItems = [
  { title: "Visão Geral", url: "/dashboard", icon: LayoutDashboard, end: true },
  { title: "Produtos", url: "/dashboard/produtos", icon: Wine },
  { title: "Enoturismo", url: "/dashboard/enoturismo", icon: MapPin },
  { title: "Vendas", url: "/dashboard/vendas", icon: ShoppingCart },
  { title: "Equipe", url: "/dashboard/equipe", icon: Users },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";
  useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className={cn("border-b border-sidebar-border bg-sidebar", collapsed ? "p-2" : "p-4")}>
        {collapsed ? (
          <div className="flex justify-center">
            <Logo variant="light" showText={false} />
          </div>
        ) : (
          <Logo variant="light" />
        )}
      </SidebarHeader>

      <SidebarContent className={cn("bg-sidebar py-4", collapsed ? "px-0" : "px-2")}>
        <SidebarGroup className={cn(collapsed ? "p-0" : "px-2")}>
          {!collapsed && (
            <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/50">
              Plataforma
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className={cn(collapsed && "items-center")}>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} className={cn("h-10", collapsed && "justify-center")}>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className={cn(
                        "flex items-center text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                        collapsed ? "justify-center w-full" : "gap-3"
                      )}
                      activeClassName={cn(
                        "!bg-sidebar-accent !text-gold font-medium",
                        !collapsed && "border-l-2 border-gold"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {profile && (
        <div className={cn("mt-2 flex items-center py-2", collapsed ? "justify-center px-0" : "gap-3 px-3")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name || ""} className="h-full w-full object-cover" />
            ) : (
              profile.full_name?.charAt(0) || "U"
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-sidebar-foreground">{profile.full_name}</p>
              <p className="truncate text-[10px] text-sidebar-foreground/50">
                {profile.role === "admin" ? "Administrador" : "Equipe"}
              </p>
            </div>
          )}
        </div>
      )}

      <SidebarFooter className="border-t border-sidebar-border bg-sidebar p-2">
        <SidebarMenu className={cn(collapsed && "items-center")}>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Configurações" className={cn("h-10", collapsed && "justify-center")}>
              <NavLink
                to="/dashboard/configuracoes"
                className={cn(
                  "flex items-center text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  collapsed ? "justify-center w-full" : "gap-3"
                )}
                activeClassName={cn(
                  "!bg-sidebar-accent !text-gold",
                  !collapsed && "border-l-2 border-gold"
                )}
              >
                <Settings className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Configurações</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout} 
              tooltip="Sair" 
              className={cn(
                "h-10 text-sidebar-foreground/75 hover:bg-destructive/10 hover:text-destructive",
                collapsed ? "justify-center" : "gap-3"
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

      
      </SidebarFooter>
    </Sidebar>
  );
}
