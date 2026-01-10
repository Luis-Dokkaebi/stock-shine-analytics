import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { InventoryTable } from "@/components/dashboard/InventoryTable";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Package, DollarSign, TrendingUp, AlertTriangle, Plus, Download } from "lucide-react";
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
import { useWarehouse } from "@/context/WarehouseContext";
import { toast } from "sonner";

const Inventory = () => {
  const { addStock, inventory } = useWarehouse();
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(false);

  const handleReceiveStock = () => {
    const part = inventory.find(i => i.sku.toLowerCase() === sku.toLowerCase());
    if (part) {
      addStock(part.id, Number(qty));
      toast.success(`Added ${qty} units to ${part.name}`);
      setOpen(false);
      setSku("");
      setQty(1);
    } else {
      toast.error("SKU not found");
    }
  };

  return (
    <MainLayout>
      <PageHeader 
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
              Realizar Entrada (Receive Stock)
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Receive Stock</DialogTitle>
              <DialogDescription>
                Add stock to existing inventory (Red Path resolution).
              </DialogDescription>
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
                  placeholder="e.g. ELEC-001"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="qty" className="text-right">
                  Quantity
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
              <Button type="submit" onClick={handleReceiveStock}>Confirm Entry</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Productos"
          value="2,847"
          icon={Package}
          description="SKUs registrados"
          delay={0.1}
        />
        <MetricCard
          title="Valor Total Inventario"
          value="$847,520"
          icon={DollarSign}
          description="Costo de adquisición"
          delay={0.2}
          gradient
        />
        <MetricCard
          title="Valor Potencial"
          value="$1,234,890"
          icon={TrendingUp}
          description="Precio de venta total"
          delay={0.3}
        />
        <MetricCard
          title="Productos Críticos"
          value="34"
          icon={AlertTriangle}
          description="Stock bajo o sin rotación"
          delay={0.4}
        />
      </div>

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
