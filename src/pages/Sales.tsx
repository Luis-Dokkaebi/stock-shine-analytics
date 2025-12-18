import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesChart, CategoryChart } from "@/components/dashboard/Charts";
import { TrendingUp, DollarSign, ShoppingCart, Target, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

const monthlyData = [
  { mes: "Ene", ventas: 285000, objetivo: 280000 },
  { mes: "Feb", ventas: 312000, objetivo: 290000 },
  { mes: "Mar", ventas: 298000, objetivo: 300000 },
  { mes: "Abr", ventas: 345000, objetivo: 310000 },
  { mes: "May", ventas: 378000, objetivo: 320000 },
  { mes: "Jun", ventas: 356000, objetivo: 330000 },
];

const weeklyComparison = [
  { semana: "S1", actual: 67000, anterior: 62000 },
  { semana: "S2", actual: 72000, anterior: 68000 },
  { semana: "S3", actual: 69000, anterior: 71000 },
  { semana: "S4", actual: 81000, anterior: 73000 },
];

const Sales = () => {
  return (
    <MainLayout>
      <PageHeader 
        title="Análisis de Ventas" 
        subtitle="Visualización temporal y tendencias de ventas"
      >
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="w-4 h-4" />
          Personalizar Periodo
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </PageHeader>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Ventas del Mes"
          value="$356,000"
          change="+8.2%"
          changeType="positive"
          icon={DollarSign}
          description="vs mes anterior"
          delay={0.1}
          gradient
        />
        <MetricCard
          title="Ventas Semanales"
          value="$81,000"
          change="+10.9%"
          changeType="positive"
          icon={TrendingUp}
          description="Semana actual"
          delay={0.2}
        />
        <MetricCard
          title="Transacciones"
          value="1,247"
          change="+156"
          changeType="positive"
          icon={ShoppingCart}
          description="Este mes"
          delay={0.3}
        />
        <MetricCard
          title="Cumplimiento"
          value="107.8%"
          change="+7.8%"
          changeType="positive"
          icon={Target}
          description="vs objetivo mensual"
          delay={0.4}
        />
      </div>

      {/* Period Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2 mb-6"
      >
        <Button variant="secondary" size="sm" className="bg-primary/10 text-primary border-primary/30">
          Semanal
        </Button>
        <Button variant="ghost" size="sm">
          Quincenal
        </Button>
        <Button variant="ghost" size="sm">
          Mensual
        </Button>
        <Button variant="ghost" size="sm">
          Trimestral
        </Button>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DashboardCard 
          title="Tendencia de Ventas Mensual" 
          subtitle="Ventas vs Objetivo - Últimos 6 meses"
          delay={0.6}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="salesGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(174, 72%, 56%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(174, 72%, 56%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
              <XAxis dataKey="mes" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <YAxis 
                stroke="hsl(215, 15%, 55%)" 
                fontSize={12}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(220, 18%, 13%)",
                  border: "1px solid hsl(220, 15%, 20%)",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="objetivo"
                stroke="hsl(220, 10%, 55%)"
                strokeWidth={2}
                fill="none"
                strokeDasharray="5 5"
                name="Objetivo"
              />
              <Area
                type="monotone"
                dataKey="ventas"
                stroke="hsl(174, 72%, 56%)"
                strokeWidth={2}
                fill="url(#salesGradient2)"
                name="Ventas"
              />
            </AreaChart>
          </ResponsiveContainer>
        </DashboardCard>

        <DashboardCard 
          title="Comparativa Semanal" 
          subtitle="Semana actual vs semana anterior"
          delay={0.7}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
              <XAxis dataKey="semana" stroke="hsl(215, 15%, 55%)" fontSize={12} />
              <YAxis 
                stroke="hsl(215, 15%, 55%)" 
                fontSize={12}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(220, 18%, 13%)",
                  border: "1px solid hsl(220, 15%, 20%)",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
              />
              <Legend />
              <Bar dataKey="anterior" fill="hsl(220, 10%, 45%)" radius={[4, 4, 0, 0]} name="Semana Anterior" />
              <Bar dataKey="actual" fill="hsl(174, 72%, 56%)" radius={[4, 4, 0, 0]} name="Semana Actual" />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>
      </div>

      {/* Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard 
          title="Ventas por Categoría" 
          subtitle="Distribución del último mes"
          delay={0.8}
        >
          <CategoryChart />
        </DashboardCard>

        <DashboardCard 
          title="Top Productos" 
          subtitle="Mejores vendidos del mes"
          className="lg:col-span-2"
          delay={0.9}
        >
          <div className="space-y-3">
            {[
              { nombre: "Monitor LED 24\"", ventas: "$45,200", unidades: 151 },
              { nombre: "Taladro Industrial", ventas: "$38,900", unidades: 245 },
              { nombre: "Cable Eléctrico 100m", ventas: "$31,600", unidades: 400 },
              { nombre: "Teclado Mecánico", ventas: "$28,450", unidades: 320 },
              { nombre: "Sierra Circular", ventas: "$24,150", unidades: 69 },
            ].map((product, index) => (
              <motion.div
                key={product.nombre}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{product.nombre}</p>
                    <p className="text-sm text-muted-foreground">{product.unidades} unidades</p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-primary">{product.ventas}</p>
              </motion.div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </MainLayout>
  );
};

export default Sales;
