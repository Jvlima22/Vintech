import { useState, useEffect } from "react";
import { 
  Building2, 
  MessageSquare, 
  Key, 
  User, 
  Save, 
  Globe, 
  Instagram, 
  MapPin, 
  Wifi, 
  ShieldCheck,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // States para os formulários
  const [wineryData, setWineryData] = useState<any>({
    name: "",
    address: "",
    city: "",
    state: "",
    instagram_url: "",
    website_url: "",
  });

  const [whatsappData, setWhatsappData] = useState<any>({
    whatsapp_instance_name: "",
    whatsapp_api_url: "",
    whatsapp_api_key: "",
  });

  const [templates, setTemplates] = useState<any>({
    welcome: "",
    booking_confirm: "",
    feedback_request: "",
  });

  useEffect(() => {
    if (profile?.winery_id) {
      fetchSettings();
    }
  }, [profile]);

  const fetchSettings = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data, error } = await supabase
        .from("wineries")
        .select("*")
        .eq("id", profile?.winery_id)
        .single();

      if (error) throw error;

      if (data) {
        setWineryData({
          name: data.name || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          instagram_url: data.instagram_url || "",
          website_url: data.website_url || "",
        });
        setWhatsappData({
          whatsapp_instance_name: data.whatsapp_instance_name || "",
          whatsapp_api_url: data.whatsapp_api_url || "",
          whatsapp_api_key: data.whatsapp_api_key || "",
        });
        setTemplates(data.message_templates || {
          welcome: "Olá {{name}}! Bem-vindo à {{winery}}.",
          booking_confirm: "Sua reserva para {{event}} em {{date}} está confirmada!",
          feedback_request: "Como foi sua experiência conosco? Adoraríamos seu feedback: {{link}}"
        });
      }
    } catch (error: any) {
      console.error("Erro fetch settings:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSave = async () => {
    console.log("Tentando salvar dados:", { ...wineryData, ...whatsappData });
    setSaving(true);
    try {
      const { data, error, status } = await supabase
        .from("wineries")
        .update({
          ...wineryData,
          ...whatsappData,
          message_templates: templates
        })
        .eq("id", profile?.winery_id)
        .select();

      console.log("Resposta do Supabase:", { data, error, status });

      if (error) throw error;
      
      toast.success("Configurações salvas com sucesso!");
      await fetchSettings(true); 
      refreshProfile();
    } catch (error: any) {
      console.error("Erro completo ao salvar:", error);
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-wine" />
        <p className="font-display text-lg">Carregando painel de controle...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Sistema</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">Configurações</h1>
          <p className="mt-1 text-muted-foreground">Gerencie os dados da sua vinícola e integrações.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-wine hover:bg-wine/90">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar Alterações
        </Button>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="bg-secondary/50 p-1 border border-border/50">
          <TabsTrigger value="geral" className="gap-2">
            <Building2 className="h-4 w-4" /> Geral
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-2">
            <Wifi className="h-4 w-4" /> Integração WhatsApp
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <MessageSquare className="h-4 w-4" /> Mensagens
          </TabsTrigger>
          <TabsTrigger value="conta" className="gap-2">
            <User className="h-4 w-4" /> Minha Conta
          </TabsTrigger>
        </TabsList>

        {/* --- ABA GERAL --- */}
        <TabsContent value="geral" className="space-y-4">
          <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Dados da Vinícola</CardTitle>
              <CardDescription>Informações básicas que aparecem nos seus documentos e links.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Vinícola</Label>
                  <Input 
                    id="name" 
                    value={wineryData.name} 
                    onChange={(e) => setWineryData({...wineryData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Site Oficial</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      id="website" 
                      className="pl-10"
                      placeholder="https://suavinicola.com.br"
                      value={wineryData.website_url} 
                      onChange={(e) => setWineryData({...wineryData, website_url: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço Completo</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    id="address" 
                    className="pl-10"
                    placeholder="Rua, Número, Bairro"
                    value={wineryData.address} 
                    onChange={(e) => setWineryData({...wineryData, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input 
                    id="city" 
                    value={wineryData.city} 
                    onChange={(e) => setWineryData({...wineryData, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado (UF)</Label>
                  <Input 
                    id="state" 
                    maxLength={2}
                    placeholder="RS"
                    value={wineryData.state} 
                    onChange={(e) => setWineryData({...wineryData, state: e.target.value.toUpperCase()})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    id="instagram" 
                    className="pl-10"
                    placeholder="@suavinicola"
                    value={wineryData.instagram_url} 
                    onChange={(e) => setWineryData({...wineryData, instagram_url: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- ABA WHATSAPP --- */}
        <TabsContent value="whatsapp" className="space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                Evolution API <span className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-full uppercase">Ativo</span>
              </CardTitle>
              <CardDescription>Configure a API de WhatsApp para disparar automações e feedbacks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-wine/5 border border-wine/20 rounded-lg py-2.5 px-4 flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-wine shrink-0" />
                <div className="text-[11px] text-foreground/80 leading-none">
                  <strong className="text-wine mr-1">Importante:</strong> Estas chaves são confidenciais. Elas permitem que o sistema envie mensagens em seu nome. Não as compartilhe com ninguém fora da sua equipe de TI.
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_url">URL da API (Evolution)</Label>
                <Input 
                  id="api_url" 
                  placeholder="https://api.suaempresa.com.br"
                  value={whatsappData.whatsapp_api_url} 
                  onChange={(e) => setWhatsappData({...whatsappData, whatsapp_api_url: e.target.value})}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="instance">Nome da Instância</Label>
                  <Input 
                    id="instance" 
                    placeholder="Vintech_Winery"
                    value={whatsappData.whatsapp_instance_name} 
                    onChange={(e) => setWhatsappData({...whatsappData, whatsapp_instance_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api_key">API Key (Global)</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      id="api_key" 
                      type="password"
                      className="pl-10"
                      value={whatsappData.whatsapp_api_key} 
                      onChange={(e) => setWhatsappData({...whatsappData, whatsapp_api_key: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- ABA TEMPLATES --- */}
        <TabsContent value="templates" className="space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Templates de Mensagens</CardTitle>
              <CardDescription>Personalize o texto das mensagens automáticas do sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="flex justify-between">
                  <span>Mensagem de Boas-vindas</span>
                  <span className="text-[10px] text-muted-foreground">Variáveis: {"{{name}}, {{winery}}"}</span>
                </Label>
                <Textarea 
                  className="min-h-[100px]"
                  value={templates.welcome}
                  onChange={(e) => setTemplates({...templates, welcome: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex justify-between">
                  <span>Confirmação de Reserva</span>
                  <span className="text-[10px] text-muted-foreground">Variáveis: {"{{name}}, {{event}}, {{date}}"}</span>
                </Label>
                <Textarea 
                  className="min-h-[100px]"
                  value={templates.booking_confirm}
                  onChange={(e) => setTemplates({...templates, booking_confirm: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex justify-between">
                  <span>Pedido de Avaliação (Feedback)</span>
                  <span className="text-[10px] text-muted-foreground">Variáveis: {"{{name}}, {{link}}"}</span>
                </Label>
                <Textarea 
                  className="min-h-[100px]"
                  value={templates.feedback_request}
                  onChange={(e) => setTemplates({...templates, feedback_request: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- ABA CONTA --- */}
        <TabsContent value="conta" className="space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Meus Dados</CardTitle>
              <CardDescription>Informações do seu perfil de acesso.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6 pb-6">
                <div className="h-20 w-20 rounded-full bg-wine/10 flex items-center justify-center text-wine text-2xl font-bold border border-wine/20 overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name || ""} className="h-full w-full object-cover" />
                  ) : (
                    profile?.full_name?.charAt(0) || "U"
                  )}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">{profile?.full_name}</h3>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">{profile?.role} · {profile?.email}</p>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input disabled value={profile?.full_name || ""} />
                </div>
                <div className="space-y-2">
                  <Label>E-mail de Acesso</Label>
                  <Input disabled value={profile?.email || ""} />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground italic">* Para alterar dados do perfil ou senha, entre em contato com o suporte de TI.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
