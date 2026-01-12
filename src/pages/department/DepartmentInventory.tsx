import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DepartmentHeader } from "@/components/department/DepartmentHeader";
import { DepartmentInventoryTable } from "@/components/department/DepartmentInventoryTable";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Package, DollarSign, TrendingUp, AlertTriangle, Plus, Download, Bell, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useDepartmentParts, useAddDepartmentStock } from "@/hooks/useDepartmentParts";
import { useUnresolvedDepartmentStockAlerts, useResolveDepartmentStockAlert } from "@/hooks/useDepartmentStockAlerts";
import { getDepartmentConfig } from "@/config/departments";

const DepartmentInventory = () => {
  const { dept } = useParams<{ dept: string }>();
  const department = dept || "hvac";
  const config = getDepartmentConfig(department);
  
  const { data: partsData = [] } = useDepartmentParts(config.dbKey);
  const { data: unresolvedAlerts = [] } = useUnresolvedDepartmentStockAlerts(config.dbKey);
  const addStockMutation = useAddDepartmentStock(config.dbKey);
  const resolveAlertMutation = useResolveDepartmentStockAlert(config.dbKey);
  
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(false);
  
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
      toast.error("SKU no encontrado en este departamento");
    }
  };

  const criticalItems = inventory.filter(item => item.stock === 0 || item.stock <= 2);

  return (
    <MainLayout>
      <DepartmentHeader 
        title="Gestión de Inventario" 
        subtitle="Control detallado de productos y existencias"
      >
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 gradient-primary text-primary-foreground">
              <Plus className="w-4 h-4" />
              Realizar Entrada
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Recibir Stock - {config.name}</DialogTitle>
              <DialogDescription>
                Agregar stock al inventario del departamento.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sku" className="text-right">SKU</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="col-span-3"
                  placeholder="ej: HVAC-001"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="qty" className="text-right">Cantidad</Label>
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
      </DepartmentHeader>

      {/* Stock Alerts */}
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
            <div className="space-y-2">
              {unresolvedAlerts.map(alert => {
                const currentPart = inventory.find(p => p.id === alert.part_id);
                const currentStock = currentPart?.stock || 0;
                return (
                  <div 
                    key={alert.id} 
                    className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{alert.part_name} <span className="text-muted-foreground font-mono text-xs">({alert.sku})</span></p>
                      <p className="text-sm text-muted-foreground">
                        Solicitado: <strong>{alert.requested_quantity}</strong> | Stock: <strong className={currentStock >= alert.requested_quantity ? "text-green-600" : "text-destructive"}>{currentStock}</strong>
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => resolveAlertMutation.mutate(alert.id)}
                      className="text-amber-600 hover:text-amber-700"
                    >
                      <X className="w-4 h-4 mr-1" /> Resolver
                    </Button>
                  </div>
                );
              })}
            </div>
          </DashboardCard>
        </div>
      )}

      {/* Metrics */}
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
                  <p className="font-medium">{item.name}</p>
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
        subtitle="Inventario completo del departamento"
        delay={0.5}
      >
        <DepartmentInventoryTable department={config.dbKey} />
      </DashboardCard>
    </MainLayout>
  );
};

export default DepartmentInventory;
