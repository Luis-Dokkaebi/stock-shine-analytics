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
import { generateToolRequestPdf } from "@/utils/generateToolRequestPdf";

interface RequestItem {
  partId: number;
  quantity: number;
  name: string;
  sku: string;
}

const Technician = () => {
  const { projects, inventory, createOrder } = useWarehouse();

  const [technicianName, setTechnicianName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [requestItems, setRequestItems] = useState<RequestItem[]>([]);

  // Item selection state
  const [selectedPartId, setSelectedPartId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  const handleAddToRequest = () => {
    if (!selectedPartId) return;

    const part = inventory.find(p => p.id === parseInt(selectedPartId));
    if (!part) return;

    if (quantity <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    setRequestItems(prev => {
      const existing = prev.find(item => item.partId === part.id);
      if (existing) {
        return prev.map(item =>
          item.partId === part.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { partId: part.id, quantity, name: part.name, sku: part.sku }];
    });

    // Reset selection
    setSelectedPartId("");
    setQuantity(1);
    toast.success("Item agregado a la solicitud");
  };

  const removeFromRequest = (partId: number) => {
    setRequestItems(prev => prev.filter(item => item.partId !== partId));
  };

  const handleSubmitOrder = () => {
    if (!technicianName.trim()) {
      toast.error("Por favor ingrese el nombre del técnico");
      return;
    }
    if (!selectedProjectId) {
      toast.error("Por favor seleccione un proyecto");
      return;
    }
    if (requestItems.length === 0) {
      toast.error("Por favor agregue items a la solicitud");
      return;
    }

    // Create order WITHOUT items (items are only saved in Sales)
    const orNumber = createOrder(technicianName, parseInt(selectedProjectId));

    const project = projects.find(p => p.id === parseInt(selectedProjectId));

    // Generate PDF with requested items (for the technician to take to warehouse)
    generateToolRequestPdf({
      orNumber,
      technician: technicianName,
      projectId: parseInt(selectedProjectId),
      projectName: project?.name || "N/A",
      requestedItems: requestItems.map(item => ({
        name: item.name,
        sku: item.sku,
        quantity: item.quantity
      }))
    });

    toast.success(`Orden de Trabajo creada: ${orNumber}. PDF de solicitud generado.`);

    // Reset Form
    setTechnicianName("");
    setSelectedProjectId("");
    setRequestItems([]);
  };

  return (
    <MainLayout>
      <PageHeader
        title="Zona Técnica"
        subtitle="Crear Órdenes de Trabajo y generar solicitudes de herramientas"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Form */}
        <div className="space-y-6">
          <DashboardCard title="Nueva Orden de Trabajo">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="techName">Nombre del Técnico</Label>
                <Input
                  id="techName"
                  placeholder="Ingrese su nombre"
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

          <DashboardCard title="Agregar Items a Solicitud">
            <p className="text-sm text-muted-foreground mb-4">
              Los items agregados aquí aparecerán en el PDF de solicitud. 
              El almacén verificará el stock y registrará la entrega.
            </p>
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label>Seleccionar Item</Label>
                <Select value={selectedPartId} onValueChange={setSelectedPartId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Buscar herramienta o parte..." />
                  </SelectTrigger>
                  <SelectContent>
                    {inventory.map(part => (
                      <SelectItem key={part.id} value={part.id.toString()}>
                        {part.name} ({part.sku})
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

              <Button onClick={handleAddToRequest}>
                <Plus className="w-4 h-4 mr-2" /> Agregar
              </Button>
            </div>
          </DashboardCard>
        </div>

        {/* Request Summary */}
        <div className="space-y-6">
          <DashboardCard title="Resumen de Solicitud">
            {requestItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No hay items en la solicitud.</p>
              </div>
            ) : (
              <div className="space-y-4">
                 <div className="rounded-md border">
                    <div className="grid grid-cols-12 gap-4 p-3 bg-secondary/50 text-sm font-medium">
                      <div className="col-span-6">Item</div>
                      <div className="col-span-2">SKU</div>
                      <div className="col-span-2 text-center">Cant.</div>
                      <div className="col-span-2"></div>
                    </div>
                    <div className="divide-y">
                      {requestItems.map(item => (
                        <div key={item.partId} className="grid grid-cols-12 gap-4 p-3 items-center text-sm">
                          <div className="col-span-6 font-medium">{item.name}</div>
                          <div className="col-span-2 text-xs text-muted-foreground font-mono">{item.sku}</div>
                          <div className="col-span-2 text-center">{item.quantity}</div>
                          <div className="col-span-2 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeFromRequest(item.partId)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>

                 <div className="bg-muted/50 rounded-md p-3 text-sm text-muted-foreground">
                   <strong>Nota:</strong> Este PDF es una SOLICITUD DE HERRAMIENTAS. 
                   El almacén verificará disponibilidad y registrará los items entregados.
                 </div>

                 <Button className="w-full" size="lg" onClick={handleSubmitOrder}>
                   <FileDown className="w-4 h-4 mr-2" />
                   Crear Orden y Generar Solicitud PDF
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