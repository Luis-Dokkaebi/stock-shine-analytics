import { MainLayout } from "@/components/layout/MainLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SalesChart, CategoryChart, RotationChart } from "@/components/dashboard/Charts";
import { InventoryTable } from "@/components/dashboard/InventoryTable";
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <MainLayout>
      <PageHeader 
        title="Dashboard Principal" 
        subtitle="Control y análisis financiero de inventario en tiempo real"
      >
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="w-4 h-4" />
          Este Mes
        </Button>
        <Button size="sm" className="gap-2 gradient-primary text-primary-foreground">
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </Button>
      </PageHeader>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Capital Inmovilizado"
          value="$847,520"
          change="+5.2%"
          changeType="negative"
          icon={DollarSign}
          description="Inversión total en inventario"
          delay={0.1}
          gradient
        />
        <MetricCard
          title="Valor Potencial de Venta"
          value="$1,234,890"
          change="+12.4%"
          changeType="positive"
          icon={TrendingUp}
          description="Ingreso máximo estimado"
          delay={0.2}
        />
        <MetricCard
          title="Productos en Almacén"
          value="2,847"
          change="+156"
          changeType="neutral"
          icon={Package}
          description="SKUs activos"
          delay={0.3}
        />
        <MetricCard
          title="Productos Baja Rotación"
          value="34"
          change="-8"
          changeType="positive"
          icon={AlertTriangle}
          description="Requieren atención"
          delay={0.4}
        />
      </div>

      {/* Financial Summary Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="gradient-card border border-primary/20 rounded-xl p-6 mb-8 shadow-glow"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-display font-semibold mb-1">Margen Bruto Esperado</h3>
            <p className="text-muted-foreground text-sm">Diferencia entre valor de venta e inversión</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-display font-bold text-primary">$387,370</p>
            <p className="text-sm text-success flex items-center justify-end gap-1 mt-1">
              <ArrowUpRight className="w-4 h-4" />
              45.7% de retorno potencial
            </p>
          </div>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard 
          title="Análisis de Ventas" 
          subtitle="Ventas vs Proyectado - Últimas 8 semanas"
          className="lg:col-span-2"
          delay={0.6}
          action={
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary" />
                Ventas
              </span>
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="w-3 h-3 rounded-full bg-silver-dark" />
                Proyectado
              </span>
            </div>
          }
        >
          <SalesChart />
        </DashboardCard>

        <DashboardCard 
          title="Distribución por Categoría" 
          subtitle="Participación del inventario"
          delay={0.7}
        >
          <CategoryChart />
        </DashboardCard>
      </div>

      {/* Rotation Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DashboardCard 
          title="Rotación de Inventario" 
          subtitle="Productos por nivel de rotación"
          delay={0.8}
        >
          <RotationChart />
        </DashboardCard>

        <DashboardCard 
          title="Costos Operativos" 
          subtitle="Estimación mensual del almacén"
          delay={0.9}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div>
                <p className="text-sm text-muted-foreground">Renta y Servicios</p>
                <p className="text-xl font-semibold">$12,500</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">% del Costo Total</p>
                <p className="text-xl font-semibold text-primary">45%</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div>
                <p className="text-sm text-muted-foreground">Personal y Operación</p>
                <p className="text-xl font-semibold">$8,200</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">% del Costo Total</p>
                <p className="text-xl font-semibold text-primary">30%</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div>
                <p className="text-sm text-muted-foreground">Costo por Baja Rotación</p>
                <p className="text-xl font-semibold text-destructive">$6,890</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">% del Costo Total</p>
                <p className="text-xl font-semibold text-destructive">25%</p>
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="font-medium">Costo Total Mensual</p>
                <p className="text-2xl font-display font-bold">$27,590</p>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Inventory Table */}
      <DashboardCard 
        title="Inventario Reciente" 
        subtitle="Productos con mayor impacto financiero"
        delay={1.0}
      >
        <InventoryTable />
      </DashboardCard>
    </MainLayout>
  );
};

export default Index;
