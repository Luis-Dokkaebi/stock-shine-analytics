import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { InventoryTable } from "@/components/dashboard/InventoryTable";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Package, DollarSign, TrendingUp, AlertTriangle, Plus, Download, X, Bell, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useWarehouse } from "@/context/WarehouseContext";
import { toast } from "sonner";
import { useParts, useAddStock, useCreatePart } from "@/hooks/useParts";

const Inventory = () => {
  const { stockAlerts, resolveStockAlert } = useWarehouse();
  const { data: partsData = [], isLoading } = useParts();
  const addStockMutation = useAddStock();
  const createPartMutation = useCreatePart();
  
  // Estado para entrada de stock
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(false);
  
  // Estado para nueva pieza
  const [newPartOpen, setNewPartOpen] = useState(false);
  const [newPart, setNewPart] = useState({
    sku: "",
    name: "",
    category: "General",
    stock: 0,
    unit_cost: 0,
    sale_price: 0,
    rotation: "medium" as "high" | "medium" | "low",
    days_in_warehouse: 0,
  });
  
  // Transform parts data to inventory format
  const inventory = partsData.map(part => ({
    id: part.id,
    sku: part.sku,
    name: part.name,
    category: part.category,
    stock: part.stock,
    unitCost: Number(part.unit_cost),
    salePrice: Number(part.sale_price),
    rotation: part.rotation as "high" | "medium" | "low",
    daysInWarehouse: part.days_in_warehouse,
  }));

  // Filter unresolved alerts
  const unresolvedAlerts = stockAlerts.filter(a => !a.resolved);

  const handleReceiveStock = async () => {
    const part = inventory.find(i => i.sku.toLowerCase() === sku.toLowerCase());
    if (part) {
      addStockMutation.mutate(
        { partId: part.id, quantity: Number(qty) },
        {
          onSuccess: () => {
            toast.success(`Se agregaron ${qty} unidades a ${part.name}`);
            setOpen(false);
            setSku("");
            setQty(1);
          }
        }
      );
    } else {
      toast.error("SKU no encontrado");
    }
  };

  const handleCreatePart = async () => {
    if (!newPart.sku.trim() || !newPart.name.trim()) {
      toast.error("SKU y nombre son requeridos");
      return;
    }
    
    // Verificar si el SKU ya existe
    const existingSku = partsData.find(p => p.sku.toLowerCase() === newPart.sku.toLowerCase());
    if (existingSku) {
      toast.error("Este SKU ya existe en el inventario");
      return;
    }
    
    createPartMutation.mutate(
      { ...newPart, department: "general" },
      {
        onSuccess: () => {
          setNewPartOpen(false);
          setNewPart({
            sku: "",
            name: "",
            category: "General",
            stock: 0,
            unit_cost: 0,
            sale_price: 0,
            rotation: "medium",
            days_in_warehouse: 0,
          });
        }
      }
    );
  };

  // Get items with zero or low stock
  const criticalItems = inventory.filter(item => item.stock === 0 || item.stock <= 2);

  return (
    <MainLayout>
      <PageHeader 
        title="Gestión de Inventario - Almacén General" 
        subtitle="Control detallado de productos y existencias"
      >
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar
        </Button>

        {/* Botón para crear nueva pieza */}
        <Dialog open={newPartOpen} onOpenChange={setNewPartOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <PackagePlus className="w-4 h-4" />
              Nueva Pieza
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Alta de Nueva Pieza - Almacén General</DialogTitle>
              <DialogDescription>
                Registrar una nueva pieza en el inventario del almacén general.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-sku" className="text-right">SKU *</Label>
                <Input
                  id="new-sku"
                  value={newPart.sku}
                  onChange={(e) => setNewPart({...newPart, sku: e.target.value})}
                  className="col-span-3"
                  placeholder="ej: GEN-001"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-name" className="text-right">Nombre *</Label>
                <Input
                  id="new-name"
                  value={newPart.name}
                  onChange={(e) => setNewPart({...newPart, name: e.target.value})}
                  className="col-span-3"
                  placeholder="Descripción del producto"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-category" className="text-right">Categoría</Label>
                <Input
                  id="new-category"
                  value={newPart.category}
                  onChange={(e) => setNewPart({...newPart, category: e.target.value})}
                  className="col-span-3"
                  placeholder="ej: Refacciones, Herramientas"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-stock" className="text-right">Stock Inicial</Label>
                <Input
                  id="new-stock"
                  type="number"
                  value={newPart.stock}
                  onChange={(e) => setNewPart({...newPart, stock: Number(e.target.value)})}
                  className="col-span-3"
                  min={0}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-cost" className="text-right">Costo Unitario</Label>
                <Input
                  id="new-cost"
                  type="number"
                  value={newPart.unit_cost}
                  onChange={(e) => setNewPart({...newPart, unit_cost: Number(e.target.value)})}
                  className="col-span-3"
                  min={0}
                  step={0.01}
                  placeholder="$0.00"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-price" className="text-right">Precio Venta</Label>
                <Input
                  id="new-price"
                  type="number"
                  value={newPart.sale_price}
                  onChange={(e) => setNewPart({...newPart, sale_price: Number(e.target.value)})}
                  className="col-span-3"
                  min={0}
                  step={0.01}
                  placeholder="$0.00"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-rotation" className="text-right">Rotación</Label>
                <Select
                  value={newPart.rotation}
                  onValueChange={(value: "high" | "medium" | "low") => setNewPart({...newPart, rotation: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar rotación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewPartOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreatePart} disabled={createPartMutation.isPending}>
                {createPartMutation.isPending ? "Guardando..." : "Crear Pieza"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Botón para entrada de stock existente */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 gradient-primary text-primary-foreground">
              <Plus className="w-4 h-4" />
              Realizar Entrada
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Recibir Stock</DialogTitle>
              <DialogDescription>
                Agregar stock al inventario existente.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sku" className="text-right">
                  SKU
                </Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="col-span-3"
                  placeholder="ej: GEN-001"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="qty" className="text-right">
                  Cantidad
                </Label>
                <Input
                  id="qty"
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleReceiveStock}>Confirmar Entrada</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stock Alerts Section */}
      {unresolvedAlerts.length > 0 && (
        <div className="mb-6">
          <DashboardCard 
            title={
              <div className="flex items-center gap-2 text-amber-600">
                <Bell className="w-5 h-5 animate-pulse" />
                Solicitudes Pendientes de Stock ({unresolvedAlerts.length})
              </div>
            }
            className="border-amber-500/50 bg-amber-500/5"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Técnicos han solicitado las siguientes herramientas que no están disponibles. 
              Agregue stock para resolver estas solicitudes.
            </p>
            <div className="space-y-2">
              {unresolvedAlerts.map(alert => {
                const currentPart = inventory.find(p => p.id === String(alert.partId));
                const currentStock = currentPart?.stock || 0;
                return (
                  <div 
                    key={alert.id} 
                    className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {alert.partName} <span className="text-muted-foreground font-mono text-xs">({alert.sku})</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Solicitado: <strong className="text-foreground">{alert.requestedQuantity}</strong> | 
                        Stock actual: <strong className={currentStock >= alert.requestedQuantity ? "text-green-600" : "text-destructive"}>{currentStock}</strong>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        O.T.: {alert.orNumber} | Técnico: {alert.technician} | {alert.createdAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentStock >= alert.requestedQuantity && (
                        <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded">
                          Stock disponible
                        </span>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          resolveStockAlert(alert.id);
                          toast.success("Alerta marcada como resuelta");
                        }}
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/20"
                      >
                        <X className="w-4 h-4 mr-1" /> Resolver
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </DashboardCard>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Productos"
          value={inventory.length.toString()}
          icon={Package}
          description="SKUs registrados"
          delay={0.1}
        />
        <MetricCard
          title="Valor Total Inventario"
          value={`$${inventory.reduce((sum, item) => sum + item.unitCost * item.stock, 0).toLocaleString()}`}
          icon={DollarSign}
          description="Costo de adquisición"
          delay={0.2}
          gradient
        />
        <MetricCard
          title="Valor Potencial"
          value={`$${inventory.reduce((sum, item) => sum + item.salePrice * item.stock, 0).toLocaleString()}`}
          icon={TrendingUp}
          description="Precio de venta total"
          delay={0.3}
        />
        <MetricCard
          title="Productos Críticos"
          value={criticalItems.length.toString()}
          icon={AlertTriangle}
          description="Stock bajo o agotado"
          delay={0.4}
        />
      </div>

      {/* Critical Stock Warning */}
      {criticalItems.length > 0 && (
        <div className="mb-6">
          <DashboardCard 
            title={
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Productos con Stock Crítico
              </div>
            }
            className="border-destructive/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {criticalItems.map(item => (
                <div 
                  key={item.id}
                  className={`p-3 rounded-lg border ${item.stock === 0 ? 'bg-destructive/10 border-destructive/30' : 'bg-amber-500/10 border-amber-500/30'}`}
                >
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                  <p className={`text-sm font-bold mt-1 ${item.stock === 0 ? 'text-destructive' : 'text-amber-600'}`}>
                    Stock: {item.stock} {item.stock === 0 ? '(AGOTADO)' : '(Bajo)'}
                  </p>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      )}

      {/* Inventory Table */}
      <DashboardCard 
        title="Listado de Productos" 
        subtitle="Inventario completo con análisis de rotación"
        delay={0.5}
      >
        <InventoryTable />
      </DashboardCard>
    </MainLayout>
  );
};

export default Inventory;