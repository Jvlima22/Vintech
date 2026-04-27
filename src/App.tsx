import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthProvider";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { PrivateRoute } from "./components/PrivateRoute";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { DashboardOverview } from "./pages/dashboard/DashboardOverview";
import { ProductsPage } from "./pages/dashboard/ProductsPage";
import { EnoturismoPage } from "./pages/dashboard/EnoturismoPage";
import { VendasPage } from "./pages/dashboard/VendasPage";
import { EquipePage } from "./pages/dashboard/EquipePage";
import { AnalyticsPage } from "./pages/dashboard/AnalyticsPage";
import { ProfilePage } from "./pages/dashboard/ProfilePage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import FeedbackPage from "./pages/public/FeedbackPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/feedback/:bookingId" element={<FeedbackPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="produtos" element={<ProductsPage />} />
              <Route path="enoturismo" element={<EnoturismoPage />} />
              <Route path="vendas" element={<VendasPage />} />
              <Route path="equipe" element={<EquipePage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="perfil" element={<ProfilePage />} />
              <Route path="configuracoes" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
