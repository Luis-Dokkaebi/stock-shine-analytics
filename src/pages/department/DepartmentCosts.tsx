import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DepartmentHeader } from "@/components/department/DepartmentHeader";
import { RotationChart } from "@/components/dashboard/Charts";
import { DollarSign, Warehouse, Clock, AlertTriangle, Settings, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { getDepartmentConfig } from "@/config/departments";
import { useDepartmentParts } from "@/hooks/useDepartmentParts";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";

const DepartmentCosts = () => {
  const { dept } = useParams<{ dept: string }>();
  const department = dept || "hvac";
  const config = getDepartmentConfig(department);
  const { data: parts = [] } = useDepartmentParts(config.dbKey);

  // Calculate real values from inventory
  const totalInventoryValue = parts.reduce((sum, p) => sum + Number(p.unit_cost) * p.stock, 0);
  const lowRotationParts = parts.filter(p => p.rotation === "low");
  const lowRotationValue = lowRotationParts.reduce((sum, p) => sum + Number(p.unit_cost) * p.stock, 0);
  const penaltyAmount = Math.round(lowRotationValue * 0.015); // 1.5% penalty

  const costBreakdown = [
    { name: "Renta (prorrateo)", value: 2500, color: "hsl(174, 72%, 56%)" },
    { name: "Personal", value: 1800, color: "hsl(199, 89%, 48%)" },
    { name: "Servicios", value: 800, color: "hsl(38, 92%, 50%)" },
    { name: "Penalización Rotación", value: penaltyAmount, color: "hsl(0, 72%, 51%)" },
    { name: "Otros", value: 500, color: "hsl(220, 10%, 55%)" },
  ];

  const totalCost = costBreakdown.reduce((acc, item) => acc + item.value, 0);

  return (
    <MainLayout>
      <DepartmentHeader 
        title="Costos Operativos" 
        subtitle="Análisis de gastos del departamento y penalización por rotación"
      >
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Configurar Parámetros
        </Button>
      </DepartmentHeader>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Costo Mensual"
          value={`$${totalCost.toLocaleString()}`}
          icon={DollarSign}
          description="Gastos operativos"
          delay={0.1}
          gradient
        />
        <MetricCard
          title="Valor Inventario"
          value={`$${totalInventoryValue.toLocaleString()}`}
          icon={Warehouse}
          description={`${parts.length} productos`}
          delay={0.2}
        />
        <MetricCard
          title="Días Promedio"
          value={parts.length > 0 ? `${Math.round(parts.reduce((sum, p) => sum + (p.days_in_warehouse || 0), 0) / parts.length)} días` : "0 días"}
          icon={Clock}
          description="Permanencia en almacén"
          delay={0.3}
        />
        <MetricCard
          title="Penalización"
          value={`$${penaltyAmount.toLocaleString()}`}
          icon={AlertTriangle}
          description="Por baja rotación"
          delay={0.4}
        />
      </div>

      {/* Cost Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DashboardCard 
          title="Distribución de Costos" 
          subtitle="Desglose mensual de gastos"
          delay={0.5}
        >
          {totalCost > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                  contentStyle={{
                    backgroundColor: "hsl(220, 18%, 13%)",
                    border: "1px solid hsl(220, 15%, 20%)",
                    borderRadius: "8px",
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Sin datos de costos
            </div>
          )}
        </DashboardCard>

        <DashboardCard 
          title="Detalle de Costos" 
          subtitle="Gastos fijos y variables"
          delay={0.6}
        >
          <div className="space-y-4">
            {costBreakdown.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${item.value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {totalCost > 0 ? ((item.value / totalCost) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </motion.div>
            ))}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-display font-bold text-primary">
                  ${totalCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Rotation Penalty Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DashboardCard 
          title="Análisis de Rotación" 
          subtitle="Productos por nivel de movimiento"
          delay={0.8}
        >
          <RotationChart />
        </DashboardCard>

        <DashboardCard 
          title="Modelo de Penalización" 
          subtitle="Costo por baja rotación de inventario"
          delay={0.9}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Alta Rotación (0-30 días)</span>
                <span className="text-success font-semibold">Sin penalización</span>
              </div>
              <p className="text-xs text-muted-foreground">{parts.filter(p => p.rotation === "high").length} productos</p>
            </div>
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Media Rotación (31-60 días)</span>
                <span className="text-warning font-semibold">0.5% del valor</span>
              </div>
              <p className="text-xs text-muted-foreground">{parts.filter(p => p.rotation === "medium").length} productos</p>
            </div>
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Baja Rotación (61+ días)</span>
                <span className="text-destructive font-semibold">1.5% del valor</span>
              </div>
              <p className="text-xs text-muted-foreground">{lowRotationParts.length} productos - ${penaltyAmount.toLocaleString()} en penalización</p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Cost Parameters */}
      <DashboardCard 
        title="Parámetros de Costo" 
        subtitle="Configuración de costos fijos y variables del departamento"
        delay={1.0}
        action={
          <Button size="sm" variant="outline" className="gap-2">
            <Calculator className="w-4 h-4" />
            Recalcular
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="rent">Renta (Prorrateo)</Label>
            <Input id="rent" type="number" defaultValue="2500" className="bg-secondary/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="personnel">Costo de Personal</Label>
            <Input id="personnel" type="number" defaultValue="1800" className="bg-secondary/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="services">Servicios</Label>
            <Input id="services" type="number" defaultValue="800" className="bg-secondary/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="other">Otros Gastos</Label>
            <Input id="other" type="number" defaultValue="500" className="bg-secondary/50" />
          </div>
        </div>
      </DashboardCard>
    </MainLayout>
  );
};

export default DepartmentCosts;
