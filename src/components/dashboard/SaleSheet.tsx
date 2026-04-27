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
import { Plus, Trash2, ShoppingCart, User, CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface CartItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface SaleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  sale?: any;
}

export function SaleSheet({ open, onOpenChange, onSuccess, sale }: SaleSheetProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerCpf, setCustomerCpf] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [status, setStatus] = useState("completed");
  const [cart, setCart] = useState<CartItem[]>([]);

  // Carregar produtos da vinícola
  useEffect(() => {
    if (open && profile?.winery_id) {
      const fetchProducts = async () => {
        const { data } = await supabase
          .from("products")
          .select("id, name, price")
          .eq("winery_id", profile.winery_id);
        if (data) setProducts(data);
      };
      fetchProducts();
    }
  }, [open, profile]);

  // Preencher se for edição
  useEffect(() => {
    const fetchOrderItems = async () => {
      if (sale?.id) {
        setCustomerName(sale.customer_name);
        setCustomerCpf(sale.customer_cpf || "");
        setCustomerEmail(sale.customer_email || "");
        setPaymentMethod(sale.payment_method);
        setStatus(sale.status);

        // Buscar itens da venda no banco
        const { data: items, error } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", sale.id);

        if (items) {
          setCart(items.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: Number(item.unit_price)
          })));
        }
      } else {
        setCustomerName("");
        setCustomerCpf("");
        setCustomerEmail("");
        setPaymentMethod("pix");
        setStatus("completed");
        setCart([]);
      }
    };

    if (open) {
      fetchOrderItems();
    }
  }, [sale, open]);

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.product_id === productId);
    if (existing) {
      setCart(cart.map(item => 
        item.product_id === productId 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.price
      }]);
    }
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) return toast.error("Nome do cliente é obrigatório");
    if (cart.length === 0) return toast.error("Adicione pelo menos um produto");

    setLoading(true);
    try {
      if (sale?.id) {
        // 1. ATUALIZAR venda existente
        const { error: orderError } = await supabase
          .from("orders")
          .update({
            customer_name: customerName,
            customer_cpf: customerCpf,
            customer_email: customerEmail,
            payment_method: paymentMethod,
            status: status,
            total_amount: totalAmount
          })
          .eq("id", sale.id);

        if (orderError) throw orderError;

        // Se mudou de PENDENTE para CONCLUÍDA, baixa o estoque
        if (sale.status === "pending" && status === "completed") {
          const stockUpdates = cart.map(async (item) => {
            const { data: product } = await supabase
              .from("products")
              .select("stock_quantity")
              .eq("id", item.product_id)
              .single();
            
            if (product) {
              const newStock = Math.max(0, (product.stock_quantity || 0) - item.quantity);
              return supabase
                .from("products")
                .update({ stock_quantity: newStock })
                .eq("id", item.product_id);
            }
          });
          await Promise.all(stockUpdates);
          toast.success("Venda concluída e estoque baixado!");
        } else {
          toast.success("Venda atualizada com sucesso!");
        }
      } else {
        // 2. CRIAR nova venda
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert([{
            winery_id: profile?.winery_id,
            customer_name: customerName,
            customer_cpf: customerCpf,
            customer_email: customerEmail,
            payment_method: paymentMethod,
            status: status,
            total_amount: totalAmount
          }])
          .select()
          .single();

        if (orderError) throw orderError;

        // Criar os Itens da Venda
        const orderItems = cart.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.unit_price * item.quantity
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) throw itemsError;

        // 3. BAIXA DE ESTOQUE (Somente se já for criada como CONCLUÍDA)
        if (status === "completed") {
          const stockUpdates = cart.map(async (item) => {
            const { data: product } = await supabase
              .from("products")
              .select("stock_quantity")
              .eq("id", item.product_id)
              .single();
            
            if (product) {
              const newStock = Math.max(0, (product.stock_quantity || 0) - item.quantity);
              return supabase
                .from("products")
                .update({ stock_quantity: newStock })
                .eq("id", item.product_id);
            }
          });
          await Promise.all(stockUpdates);
          toast.success("Venda realizada e estoque atualizado!");
        } else {
          toast.success("Venda registrada (Pendente)!");
        }
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Erro ao processar venda: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isLocked = sale?.status === "completed";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl flex flex-col h-full bg-card border-border">
        <SheetHeader className="border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-wine/10 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-wine" />
            </div>
            <div>
              <SheetTitle className="text-xl font-display font-bold">
                {isLocked ? "Detalhes da Venda" : (sale ? "Editar Venda" : "Nova Venda")}
              </SheetTitle>
              <SheetDescription>
                {isLocked ? "Esta venda já foi concluída e não pode ser alterada." : "Registre uma venda direta no balcão."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-8 scrollbar-thin scrollbar-thumb-gold/20 px-6">
          {/* Dados do Cliente */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-wine font-semibold text-sm">
              <User className="h-4 w-4" /> Dados do Cliente
            </div>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Nome do Cliente *</Label>
                <Input 
                  id="customer" 
                  placeholder="Nome completo" 
                  value={customerName} 
                  onChange={e => setCustomerName(e.target.value)}
                  className="bg-secondary/30 border border-border/50 focus:border-wine/50 focus:ring-wine/20 transition-all"
                  disabled={isLocked}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF (Opcional)</Label>
                  <Input 
                    id="cpf" 
                    placeholder="000.000.000-00" 
                    value={customerCpf} 
                    onChange={e => setCustomerCpf(e.target.value)}
                    className="bg-secondary/30 border border-border/50 focus:border-wine/50 focus:ring-wine/20 transition-all"
                    disabled={isLocked}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail (Opcional)</Label>
                  <Input 
                    id="email" 
                    placeholder="cliente@email.com" 
                    value={customerEmail} 
                    onChange={e => setCustomerEmail(e.target.value)}
                    className="bg-secondary/30 border border-border/50 focus:border-wine/50 focus:ring-wine/20 transition-all"
                    disabled={isLocked}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {/* Seleção de Produtos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-wine font-semibold text-sm">
                <ShoppingCart className="h-4 w-4" /> Itens da Venda
              </div>
              {!isLocked && (
                <Select onValueChange={addToCart}>
                  <SelectTrigger className="w-[200px] h-8 text-xs bg-wine text-gold border-none">
                    <Plus className="h-3 w-3 mr-1" /> Adicionar Produto
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name} - R$ {p.price}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
              <div className="bg-secondary/50 p-3 grid grid-cols-6 text-[10px] uppercase font-bold text-muted-foreground">
                <div className="col-span-3">Produto</div>
                <div className="text-center">Qtd</div>
                <div className="text-right">Total</div>
                <div className="text-right"></div>
              </div>
              <div className="divide-y divide-border">
                {cart.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground italic">
                    Nenhum produto adicionado ao carrinho.
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div key={index} className="p-3 grid grid-cols-6 items-center text-sm">
                      <div className="col-span-3 font-medium truncate">{item.product_name}</div>
                      <div className="text-center">
                        <input 
                          type="number" 
                          min="1" 
                          className="w-10 bg-transparent text-center border-b border-border"
                          value={item.quantity}
                          onChange={(e) => {
                            if (isLocked) return;
                            const newCart = [...cart];
                            newCart[index].quantity = parseInt(e.target.value) || 1;
                            setCart(newCart);
                          }}
                          disabled={isLocked}
                        />
                      </div>
                      <div className="text-right font-semibold">
                        {(item.unit_price * item.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </div>
                      <div className="text-right">
                        {!isLocked && (
                          <Button variant="ghost" size="sm" onClick={() => removeFromCart(index)} className="h-6 w-6 p-0 text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {/* Pagamento e Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-wine font-semibold text-sm">
              <CreditCard className="h-4 w-4" /> Pagamento
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={isLocked}>
                  <SelectTrigger className="bg-secondary/30 border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="card">Cartão de Crédito/Débito</SelectItem>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus} disabled={isLocked}>
                  <SelectTrigger className="bg-secondary/30 border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="border-t border-border pt-6 mt-auto">
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total da Venda</span>
              <span className="text-wine text-2xl">
                {totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                {isLocked ? "Fechar" : "Cancelar"}
              </Button>
              {!isLocked && (
                <Button 
                  className="flex-[2] bg-wine text-gold hover:bg-wine/90 font-bold h-12"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Finalizar Venda"}
                </Button>
              )}
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
