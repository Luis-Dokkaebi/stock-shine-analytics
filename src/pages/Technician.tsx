import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWarehouse, Order } from "@/context/WarehouseContext";
import { toast } from "sonner";
import { Plus, Trash2, ShoppingCart, FileDown, AlertTriangle } from "lucide-react";
import { generateToolRequestPdf } from "@/utils/generateToolRequestPdf";

interface RequestItem {
  partId: number;
  quantity: number;
  name: string;
  sku: string;
  currentStock: number;
}

const DEPARTMENTS: Order["department"][] = ["HVAC", "ELECTROMECANICO", "HERRERIA", "MAQUINARIA PESADA"];

const Technician = () => {
  const { projects, inventory, createOrder, addStockAlert } = useWarehouse();

  const [technicianName, setTechnicianName] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<Order["department"] | "">("");
  const [supplierName, setSupplierName] = useState("");
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
      return [...prev, { partId: part.id, quantity, name: part.name, sku: part.sku, currentStock: part.stock }];
    });

    // Reset selection
    setSelectedPartId("");
    setQuantity(1);
    toast.success("Item agregado a la solicitud");
  };

  const removeFromRequest = (partId: number) => {
    setRequestItems(prev => prev.filter(item => item.partId !== partId));
  };

  // Check for items with insufficient stock
  const itemsWithLowStock = requestItems.filter(item => item.currentStock < item.quantity);

  const handleSubmitOrder = () => {
    if (!technicianName.trim()) {
      toast.error("Por favor ingrese el nombre del técnico");
      return;
    }
    if (!selectedDepartment) {
      toast.error("Por favor seleccione un departamento");
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

    // Create order with department and supplier
    const orNumber = createOrder(technicianName, parseInt(selectedProjectId), selectedDepartment, supplierName);

    const project = projects.find(p => p.id === parseInt(selectedProjectId));

    // Create stock alerts for items with insufficient stock
    itemsWithLowStock.forEach(item => {
      addStockAlert({
        partId: item.partId,
        partName: item.name,
        sku: item.sku,
        requestedQuantity: item.quantity,
        orNumber: orNumber,
        technician: technicianName,
      });
    });

    if (itemsWithLowStock.length > 0) {
      toast.warning(
        `Se crearon ${itemsWithLowStock.length} alertas de stock insuficiente. El almacén ha sido notificado.`,
        { duration: 5000 }
      );
    }

    // Generate PDF with requested items (for the technician to take to warehouse)
    generateToolRequestPdf({
      orNumber,
      technician: technicianName,
      department: selectedDepartment,
      supplierName: supplierName || "N/A",
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
    setSelectedDepartment("");
    setSupplierName("");
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
                <Label>Departamento</Label>
                <Select value={selectedDepartment} onValueChange={(v) => setSelectedDepartment(v as Order["department"])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                        {part.name} ({part.sku}) - Stock: {part.stock}
                        {part.stock === 0 && " ⚠️"}
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
                 {/* Low stock warning */}
                 {itemsWithLowStock.length > 0 && (
                   <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                     <div className="flex items-center gap-2 text-amber-600 font-medium mb-2">
                       <AlertTriangle className="w-4 h-4" />
                       Alerta de Stock Insuficiente
                     </div>
                     <p className="text-sm text-muted-foreground">
                       Los siguientes items tienen stock insuficiente. Se notificará al almacén cuando se cree la orden:
                     </p>
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
                      <div className="col-span-5">Item</div>
                      <div className="col-span-2">SKU</div>
                      <div className="col-span-2 text-center">Cant.</div>
                      <div className="col-span-2 text-center">Stock</div>
                      <div className="col-span-1"></div>
                    </div>
                    <div className="divide-y">
                      {requestItems.map(item => {
                        const isLowStock = item.currentStock < item.quantity;
                        return (
                          <div 
                            key={item.partId} 
                            className={`grid grid-cols-12 gap-4 p-3 items-center text-sm ${isLowStock ? 'bg-amber-500/5' : ''}`}
                          >
                            <div className="col-span-5 font-medium flex items-center gap-2">
                              {item.name}
                              {isLowStock && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                            </div>
                            <div className="col-span-2 text-xs text-muted-foreground font-mono">{item.sku}</div>
                            <div className="col-span-2 text-center">{item.quantity}</div>
                            <div className={`col-span-2 text-center ${isLowStock ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                              {item.currentStock}
                            </div>
                            <div className="col-span-1 text-right">
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