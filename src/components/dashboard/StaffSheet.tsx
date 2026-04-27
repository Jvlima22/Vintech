import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, User, Mail, Shield, Phone, CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface StaffSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  staffMember?: any;
}

export function StaffSheet({ open, onOpenChange, onSuccess, staffMember }: StaffSheetProps) {
  const { profile: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [status, setStatus] = useState("active");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");

  useEffect(() => {
    if (staffMember) {
      setFullName(staffMember.full_name || "");
      setEmail(staffMember.email || "");
      setRole(staffMember.role || "staff");
      setStatus(staffMember.status || "active");
      setPhone(staffMember.phone || "");
      setCpf(staffMember.cpf || "");
    } else {
      setFullName("");
      setEmail("");
      setRole("staff");
      setStatus("active");
      setPhone("");
      setCpf("");
    }
  }, [staffMember, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return toast.error("Nome é obrigatório");
    
    setLoading(true);
    try {
      const staffData = {
        full_name: fullName,
        email: email,
        role: role,
        status: status,
        phone: phone,
        cpf: cpf,
        winery_id: currentUser?.winery_id
      };

      if (staffMember?.id) {
        // UPDATE
        const { error } = await supabase
          .from("profiles")
          .update(staffData)
          .eq("id", staffMember.id);
        if (error) throw error;
        toast.success("Membro da equipe atualizado!");
      } else {
        // INSERT (Nota: No Supabase Auth, o convite real seria via Auth API, 
        // aqui estamos apenas criando o perfil. Idealmente o usuário faria o Sign Up depois.)
        const { error } = await supabase
          .from("profiles")
          .insert([staffData]);
        if (error) throw error;
        toast.success("Membro da equipe cadastrado!");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col h-full bg-card border-border">
        <SheetHeader className="border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-gold" />
            </div>
            <div>
              <SheetTitle className="text-xl font-display font-bold">
                {staffMember ? "Editar Membro" : "Novo Membro"}
              </SheetTitle>
              <SheetDescription>
                Gerencie as permissões e dados da sua equipe.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-6 space-y-6 px-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-3.5 w-3.5" /> Nome Completo *
              </Label>
              <Input 
                id="name" 
                placeholder="Ex: João Silva" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)}
                className="bg-secondary/30 border-border/50 focus:border-gold/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> E-mail Profissional
              </Label>
              <Input 
                id="email" 
                type="email"
                placeholder="equipe@vinicola.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="bg-secondary/30 border-border/50 focus:border-gold/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" /> Telefone
                </Label>
                <Input 
                  id="phone" 
                  placeholder="(00) 00000-0000" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  className="bg-secondary/30 border-border/50 focus:border-gold/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf" className="flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5" /> CPF
                </Label>
                <Input 
                  id="cpf" 
                  placeholder="000.000.000-00" 
                  value={cpf} 
                  onChange={e => setCpf(e.target.value)}
                  className="bg-secondary/30 border-border/50 focus:border-gold/50"
                />
              </div>
            </div>

            <div className="h-px bg-border/50 my-2" />

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" /> Cargo / Função
              </Label>
              <Select 
                value={role} 
                onValueChange={setRole} 
                disabled={staffMember?.role === "admin"}
              >
                <SelectTrigger className="bg-secondary/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="staff">Atendimento / Vendas</SelectItem>
                  <SelectItem value="sommelier">Sommelier</SelectItem>
                </SelectContent>
              </Select>
              {staffMember?.role === "admin" && (
                <p className="text-[10px] text-muted-foreground italic">
                  * O cargo de administrador não pode ser alterado por segurança.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status de Acesso</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-secondary/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Desativado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>

        <SheetFooter className="border-t border-border p-6 mt-auto">
          <div className="flex w-full gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button 
              className="flex-1 bg-gold text-wine hover:bg-gold/90 font-bold"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar Membro"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
