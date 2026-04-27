import { useState, useEffect, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Camera, Package, DollarSign, Tag, Wine, Info } from "lucide-react";

interface ProductSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  product?: any;
}

export function ProductSheet({ open, onOpenChange, onSuccess, product }: ProductSheetProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "vinho",
    variety: "",
    vintage: "",
    price: "",
    stock_quantity: "",
    sku: "",
    description: "",
    image_url: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category: product.category || "vinho",
        variety: product.variety || "",
        vintage: product.vintage || "",
        price: product.price?.toString() || "",
        stock_quantity: product.stock_quantity?.toString() || "",
        sku: product.sku || "",
        description: product.description || "",
        image_url: product.image_url || "",
      });
      setImagePreview(product.image_url);
    } else {
      resetForm();
    }
  }, [product, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl: rawUrl } } = supabase.storage
        .from("products")
        .getPublicUrl(fileName);

      const publicUrl = rawUrl.includes("/public/") 
        ? rawUrl 
        : rawUrl.replace("/object/products/", "/object/public/products/");

      setFormData((prev) => ({ ...prev, image_url: publicUrl }));
      setImagePreview(publicUrl);
      toast.success("Imagem carregada!");
    } catch (error: any) {
      toast.error("Erro no upload: " + (error.message || "Verifique as configurações do bucket"));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.winery_id) {
      toast.error("Erro: Vinícola não identificada.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        winery_id: profile.winery_id,
        name: formData.name,
        category: formData.category,
        variety: formData.variety,
        vintage: formData.vintage,
        price: parseFloat(formData.price.toString().replace(",", ".")),
        stock_quantity: parseInt(formData.stock_quantity.toString()),
        sku: formData.sku,
        description: formData.description,
        image_url: formData.image_url,
      };

      if (product?.id) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id);
        if (error) throw error;
        toast.success("Produto atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("products").insert([payload]);
        if (error) throw error;
        toast.success("Produto criado com sucesso!");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Erro ao salvar produto: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "vinho",
      variety: "",
      vintage: "",
      price: "",
      stock_quantity: "",
      sku: "",
      description: "",
      image_url: "",
    });
    setImagePreview(null);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-card border-l border-border/50">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <PlusIcon className="h-6 w-6 text-gold" /> 
            {product ? "Editar Produto" : "Novo Produto"}
          </SheetTitle>
          <SheetDescription>
            {product 
              ? "Atualize as informações do rótulo selecionado." 
              : "Preencha as informações para adicionar um novo rótulo ao seu catálogo."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pb-8">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Imagem do Produto</Label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-video rounded-xl border-2 border-dashed border-border/50 bg-secondary/30 flex items-center justify-center cursor-pointer overflow-hidden transition-colors hover:bg-secondary/50 group"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Camera className="h-8 w-8" />
                  <span className="text-xs">Clique para fazer upload</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-gold" />
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleImageUpload} 
              accept="image/*"
            />
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gold" /> Nome do Produto *
              </Label>
              <Input 
                id="name" 
                placeholder="Ex: Cabernet Sauvignon Reserva" 
                required 
                value={formData.name}
                onChange={handleInputChange}
                className="bg-background/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="flex items-center gap-2">
                  <Wine className="h-4 w-4 text-gold" /> Categoria
                </Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vinho">Vinho Tinto</SelectItem>
                    <SelectItem value="branco">Vinho Branco</SelectItem>
                    <SelectItem value="rose">Vinho Rosé</SelectItem>
                    <SelectItem value="espumante">Espumante</SelectItem>
                    <SelectItem value="suco">Suco</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vintage" className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gold" /> Safra (Ano)
                </Label>
                <Input 
                  id="vintage" 
                  placeholder="Ex: 2021" 
                  value={formData.vintage}
                  onChange={handleInputChange}
                  className="bg-background/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gold" /> Preço (R$) *
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

              <div className="space-y-2">
                <Label htmlFor="stock_quantity" className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-gold" /> Estoque Inicial *
                </Label>
                <Input 
                  id="stock_quantity" 
                  type="number" 
                  placeholder="0" 
                  required 
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  className="bg-background/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="variety" className="flex items-center gap-2">
                <Wine className="h-4 w-4 text-gold" /> Uva / Variedade
              </Label>
              <Input 
                id="variety" 
                placeholder="Ex: 100% Merlot" 
                value={formData.variety}
                onChange={handleInputChange}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku" className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gold" /> SKU / Código
              </Label>
              <Input 
                id="sku" 
                placeholder="Ex: VIN-CAB-2021" 
                value={formData.sku}
                onChange={handleInputChange}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea 
                id="description" 
                placeholder="Detalhes sobre o produto, notas de degustação, etc." 
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
              disabled={loading || uploading}
              className="flex-1 bg-wine text-gold hover:bg-wine/90 font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                </>
              ) : (
                "Criar Produto"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
