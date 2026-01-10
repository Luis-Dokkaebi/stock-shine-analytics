import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWarehouse } from "@/context/WarehouseContext";
import { toast } from "sonner";
import { Plus, Trash2, ShoppingCart, FileDown } from "lucide-react";
import { generateOrderPdf } from "@/utils/generateOrderPdf";

interface CartItem {
  partId: number;
  quantity: number;
  name: string;
}

const Technician = () => {
  const { projects, inventory, createOrder } = useWarehouse();

  const [technicianName, setTechnicianName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);

  // Item selection state
  const [selectedPartId, setSelectedPartId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  const handleAddToCart = () => {
    if (!selectedPartId) return;

    const part = inventory.find(p => p.id === parseInt(selectedPartId));
    if (!part) return;

    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.partId === part.id);
      if (existing) {
        return prev.map(item =>
          item.partId === part.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { partId: part.id, quantity, name: part.name }];
    });

    // Reset selection
    setSelectedPartId("");
    setQuantity(1);
    toast.success("Item added to cart");
  };

  const removeFromCart = (partId: number) => {
    setCart(prev => prev.filter(item => item.partId !== partId));
  };

  const handleSubmitOrder = () => {
    if (!technicianName.trim()) {
      toast.error("Please enter Technician Name");
      return;
    }
    if (!selectedProjectId) {
      toast.error("Please select a Project");
      return;
    }
    if (cart.length === 0) {
      toast.error("Please add items to the order");
      return;
    }

    const orNumber = createOrder(
      technicianName,
      parseInt(selectedProjectId),
      cart
    );

    // Generate PDF with the order data we have (since state update is async)
    const tempOrder = {
      id: Date.now(),
      or_number: orNumber,
      technician: technicianName,
      projectId: parseInt(selectedProjectId),
      status: "open" as const,
      items: cart.map(c => ({ partId: c.partId, quantityRequired: c.quantity, quantityFulfilled: 0 })),
      fulfillmentLogs: []
    };
    
    generateOrderPdf({ order: tempOrder, inventory, projects, type: "request" });
    toast.success(`Solicitud creada y PDF generado! Referencia: ${orNumber}`);

    // Reset Form
    setTechnicianName("");
    setSelectedProjectId("");
    setCart([]);
  };

  return (
    <MainLayout>
      <PageHeader
        title="Zona Técnica"
        subtitle="Generar Solicitud de Herramientas"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Form */}
        <div className="space-y-6">
          <DashboardCard title="Detalles de Solicitud">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="techName">Nombre del Técnico</Label>
                <Input
                  id="techName"
                  placeholder="Enter your name"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Proyecto</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Agregar Herramientas/Refacciones">
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label>Seleccionar Ítem</Label>
                <Select value={selectedPartId} onValueChange={setSelectedPartId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Buscar herramienta..." />
                  </SelectTrigger>
                  <SelectContent>
                    {inventory.map(part => (
                      <SelectItem key={part.id} value={part.id.toString()}>
                        {part.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-24 space-y-2">
                <Label>Cant.</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                />
              </div>

              <Button onClick={handleAddToCart}>
                <Plus className="w-4 h-4 mr-2" /> Agregar
              </Button>
            </div>
          </DashboardCard>
        </div>

        {/* Cart / Summary */}
        <div className="space-y-6">
          <DashboardCard title="Resumen de Solicitud">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No hay herramientas seleccionadas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                 <div className="rounded-md border">
                    <div className="grid grid-cols-12 gap-4 p-3 bg-secondary/50 text-sm font-medium">
                      <div className="col-span-8">Ítem</div>
                      <div className="col-span-2 text-center">Cant.</div>
                      <div className="col-span-2"></div>
                    </div>
                    <div className="divide-y">
                      {cart.map(item => (
                        <div key={item.partId} className="grid grid-cols-12 gap-4 p-3 items-center text-sm">
                          <div className="col-span-8 font-medium">{item.name}</div>
                          <div className="col-span-2 text-center">{item.quantity}</div>
                          <div className="col-span-2 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeFromCart(item.partId)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>

                 <Button className="w-full" size="lg" onClick={handleSubmitOrder}>
                   <FileDown className="w-4 h-4 mr-2" />
                   Generar Solicitud y PDF
                 </Button>
              </div>
            )}
          </DashboardCard>
        </div>
      </div>
    </MainLayout>
  );
};

export default Technician;
