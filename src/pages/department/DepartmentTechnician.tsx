import { useState } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DepartmentHeader } from "@/components/department/DepartmentHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, ShoppingCart, FileDown, AlertTriangle, Loader2 } from "lucide-react";
import { generateToolRequestPdf } from "@/utils/generateToolRequestPdf";
import { useProjects } from "@/hooks/useProjects";
import { useDepartmentParts } from "@/hooks/useDepartmentParts";
import { useCreateOrder } from "@/hooks/useOrders";
import { useCreateDepartmentStockAlert } from "@/hooks/useDepartmentStockAlerts";
import { getDepartmentConfig } from "@/config/departments";

interface RequestItem {
  partId: string;
  quantity: number;
  name: string;
  sku: string;
  currentStock: number;
}

const DepartmentTechnician = () => {
  const { dept } = useParams<{ dept: string }>();
  const department = dept || "hvac";
  const config = getDepartmentConfig(department);

  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: inventory = [], isLoading: partsLoading } = useDepartmentParts(config.dbKey);
  const createOrder = useCreateOrder();
  const createStockAlert = useCreateDepartmentStockAlert(config.dbKey);

  const [technicianName, setTechnicianName] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [requestItems, setRequestItems] = useState<RequestItem[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  const handleAddToRequest = () => {
    if (!selectedPartId) return;

    const part = inventory.find(p => p.id === selectedPartId);
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
      return [...prev, { partId: part.id, quantity, name: part.name, sku: part.sku, currentStock: part.stock }];
    });

    setSelectedPartId("");
    setQuantity(1);
    toast.success("Item agregado a la solicitud");
  };

  const removeFromRequest = (partId: string) => {
    setRequestItems(prev => prev.filter(item => item.partId !== partId));
  };

  const itemsWithLowStock = requestItems.filter(item => item.currentStock < item.quantity);

  const handleSubmitOrder = async () => {
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

    try {
      const newOrder = await createOrder.mutateAsync({
        technician: technicianName,
        department: config.name.toUpperCase() as "HVAC" | "ELECTROMECANICO" | "HERRERIA" | "MAQUINARIA PESADA",
        supplierName: supplierName,
        projectId: selectedProjectId,
        items: requestItems.map(item => ({
          partId: item.partId,
          quantity: item.quantity
        })),
      });

      const project = projects.find(p => p.id === selectedProjectId);

      // Create stock alerts for items with insufficient stock
      for (const item of itemsWithLowStock) {
        await createStockAlert.mutateAsync({
          partId: item.partId,
          partName: item.name,
          sku: item.sku,
          requestedQuantity: item.quantity,
          orNumber: newOrder.or_number,
          technician: technicianName,
        });
      }

      if (itemsWithLowStock.length > 0) {
        toast.warning(`Se crearon ${itemsWithLowStock.length} alertas de stock insuficiente.`, { duration: 5000 });
      }

      generateToolRequestPdf({
        orNumber: newOrder.or_number,
        technician: technicianName,
        department: config.name,
        supplierName: supplierName || "N/A",
        projectId: parseInt(selectedProjectId) || 0,
        projectName: project?.name || "N/A",
        requestedItems: requestItems.map(item => ({
          name: item.name,
          sku: item.sku,
          quantity: item.quantity
        }))
      });

      toast.success(`Orden de Trabajo creada: ${newOrder.or_number}`);

      setTechnicianName("");
      setSupplierName("");
      setSelectedProjectId("");
      setRequestItems([]);
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const isLoading = projectsLoading || partsLoading;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <DepartmentHeader
        title="Zona Técnica"
        subtitle="Crear Órdenes de Trabajo y generar solicitudes de herramientas"
      />

      <div className="grid gap-6 md:grid-cols-2">
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
                <Label>Departamento</Label>
                <Input value={config.name} disabled className="bg-secondary/50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierName">Nombre del Proveedor (Opcional)</Label>
                <Input
                  id="supplierName"
                  placeholder="Ingrese nombre del proveedor"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
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
                      <SelectItem key={p.id} value={p.id}>
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
              Seleccione items del inventario de {config.name}.
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
                      <SelectItem key={part.id} value={part.id}>
                        {part.name} ({part.sku}) - Stock: {part.stock}
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

        <div className="space-y-6">
          <DashboardCard title="Resumen de Solicitud">
            {requestItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No hay items en la solicitud.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {itemsWithLowStock.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-amber-600 font-medium mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      Alerta de Stock Insuficiente
                    </div>
                    <ul className="mt-2 text-sm space-y-1">
                      {itemsWithLowStock.map(item => (
                        <li key={item.partId} className="text-amber-700">
                          • {item.name}: Solicitado {item.quantity}, Disponible {item.currentStock}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="rounded-md border">
                  <div className="grid grid-cols-12 gap-4 p-3 bg-secondary/50 text-sm font-medium">
                    <div className="col-span-6">Item</div>
                    <div className="col-span-2">SKU</div>
                    <div className="col-span-2 text-center">Cant.</div>
                    <div className="col-span-2"></div>
                  </div>
                  <div className="divide-y">
                    {requestItems.map(item => {
                      const isLowStock = item.currentStock < item.quantity;
                      return (
                        <div 
                          key={item.partId} 
                          className={`grid grid-cols-12 gap-4 p-3 items-center text-sm ${isLowStock ? 'bg-amber-500/5' : ''}`}
                        >
                          <div className="col-span-6 font-medium flex items-center gap-2">
                            {item.name}
                            {isLowStock && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                          </div>
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
                      );
                    })}
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleSubmitOrder}
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4 mr-2" />
                  )}
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

export default DepartmentTechnician;
