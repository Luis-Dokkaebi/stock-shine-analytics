import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { InventoryTable } from "@/components/dashboard/InventoryTable";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Package, DollarSign, TrendingUp, AlertTriangle, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const Inventory = () => {
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
        <Button size="sm" className="gap-2 gradient-primary text-primary-foreground">
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </Button>
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
