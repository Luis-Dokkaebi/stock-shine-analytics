import { MainLayout } from "@/components/layout/MainLayout";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  CreditCard, 
  Receipt,
  MapPin,
  Package,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

// Mock data for charts
const salesTrendData = [
  { month: "Ene-25", value: 45000 },
  { month: "Feb-25", value: 52000 },
  { month: "Mar-25", value: 48000 },
  { month: "Abr-25", value: 61000 },
  { month: "May-25", value: 55000 },
  { month: "Jun-25", value: 67000 },
  { month: "Jul-25", value: 72000 },
  { month: "Ago-25", value: 65000 },
  { month: "Sep-25", value: 78000 },
  { month: "Oct-25", value: 82000 },
  { month: "Nov-25", value: 75000 },
  { month: "Dic-25", value: 89000 },
];

const topClientsData = [
  { name: "Constructora Horizonte", value: 106000 },
  { name: "Ingeniería Apex", value: 104000 },
  { name: "Apex Digital Systems", value: 100000 },
  { name: "HorizonTech Partners", value: 99000 },
  { name: "Vertex Software Group", value: 94000 },
  { name: "Summit IT Services", value: 82000 },
  { name: "Sunstate Digital Solutions", value: 80000 },
  { name: "Evergreen Tech Solutions", value: 79000 },
  { name: "LoneStar Data Solutions", value: 78000 },
  { name: "QuantumTech Solutions", value: 76000 },
];

const purchasesByLocationData = [
  { name: "Texas", value: 26.4, color: "hsl(200, 80%, 50%)" },
  { name: "California", value: 23.6, color: "hsl(174, 72%, 56%)" },
  { name: "Arizona", value: 21.6, color: "hsl(220, 70%, 60%)" },
  { name: "Florida", value: 16.4, color: "hsl(45, 90%, 55%)" },
  { name: "Otros", value: 12, color: "hsl(280, 60%, 50%)" },
];

const purchasesByCategoryData = [
  { name: "2024", HVAC: 450, Maquinaria: 380, Herramientas: 320, Construcción: 280, Electromecánica: 220 },
  { name: "2025", HVAC: 520, Maquinaria: 420, Herramientas: 380, Construcción: 340, Electromecánica: 290 },
];

const salesByLocationData = [
  { name: "Arizona", value: 195000 },
  { name: "Florida", value: 245000 },
  { name: "Texas", value: 320000 },
  { name: "California", value: 280000 },
  { name: "Unknown", value: 150000 },
];

const salesByCategoryData = [
  { name: "HVAC", value: 36.1, color: "hsl(200, 80%, 50%)" },
  { name: "Maquinaria", value: 29.2, color: "hsl(174, 72%, 56%)" },
  { name: "Herramientas", value: 25.0, color: "hsl(45, 90%, 55%)" },
  { name: "Construcción", value: 9.7, color: "hsl(280, 60%, 50%)" },
];

const salesByCityData = [
  { name: "Miami", value: 180 },
  { name: "Dallas", value: 160 },
  { name: "Houston", value: 140 },
  { name: "Los Angeles", value: 130 },
  { name: "Tampa", value: 110 },
  { name: "Sacramento", value: 100 },
  { name: "Austin", value: 95 },
  { name: "San Francisco", value: 90 },
  { name: "Scottsdale", value: 85 },
  { name: "San Antonio", value: 80 },
  { name: "Mesa", value: 75 },
  { name: "San Diego", value: 70 },
  { name: "Jacksonville", value: 65 },
  { name: "Orlando", value: 60 },
];

const COLORS = [
  "hsl(200, 80%, 50%)",
  "hsl(174, 72%, 56%)",
  "hsl(45, 90%, 55%)",
  "hsl(280, 60%, 50%)",
  "hsl(340, 70%, 55%)",
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatK = (value: number) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
};

const KPIsDashboard = () => {
  return (
    <MainLayout>
      <AnimatedPage>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Tablero de Control - Holtmont
          </h1>
          <p className="text-muted-foreground">
            Key trends y KPIs de business insights
          </p>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>Ventas Totales</span>
            </div>
            <p className="text-xl font-bold">$1,234,149</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <ShoppingCart className="w-4 h-4" />
              <span>Compras Totales</span>
            </div>
            <p className="text-xl font-bold">$1,039,170</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <DollarSign className="w-4 h-4" />
              <span>Utilidad Neta</span>
            </div>
            <p className="text-xl font-bold">$194,979</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <CreditCard className="w-4 h-4" />
              <span>Total por Cobrar</span>
            </div>
            <p className="text-xl font-bold">$493,135</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <Receipt className="w-4 h-4" />
              <span>Total por Pagar</span>
            </div>
            <p className="text-xl font-bold">$414,666</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <MapPin className="w-4 h-4" />
              <span>Ubicación Top Ventas</span>
            </div>
            <p className="text-xl font-bold">Miami</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <Package className="w-4 h-4" />
              <span>Artículo Más Vendido</span>
            </div>
            <p className="text-lg font-bold leading-tight">Unidad HVAC Industrial</p>
          </motion.div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          {/* Sales Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="lg:col-span-5 bg-card border border-border rounded-xl p-4"
          >
            <h3 className="font-semibold text-foreground mb-4">Tendencia de Ventas</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tickFormatter={formatK}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Ventas']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(200, 80%, 50%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(200, 80%, 50%)', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: 'hsl(200, 80%, 50%)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Top 10 Clients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-3 bg-card border border-border rounded-xl p-4"
          >
            <h3 className="font-semibold text-foreground mb-4">Top 10 Clientes</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {topClientsData.map((client, index) => (
                <div key={client.name} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-32 truncate">{client.name}</span>
                  <div className="flex-1 h-6 bg-secondary/50 rounded overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(client.value / 106000) * 100}%` }}
                      transition={{ delay: 0.6 + index * 0.05, duration: 0.5 }}
                      className="h-full rounded flex items-center justify-end px-2"
                      style={{
                        background: `linear-gradient(90deg, hsl(174, 72%, 56%) 0%, hsl(200, 80%, 50%) 100%)`,
                      }}
                    >
                      <span className="text-xs font-medium text-primary-foreground">
                        {formatK(client.value)}
                      </span>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Purchases by Location - Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="lg:col-span-2 bg-card border border-border rounded-xl p-4"
          >
            <h3 className="font-semibold text-foreground mb-4 text-sm">Compras por Ubicación</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={purchasesByLocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {purchasesByLocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}%`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {purchasesByLocationData.slice(0, 4).map((item) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[10px] text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Purchases by Category - Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 bg-card border border-border rounded-xl p-4"
          >
            <h3 className="font-semibold text-foreground mb-4 text-sm">Compras por Categoría</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={purchasesByCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="HVAC" fill="hsl(200, 80%, 50%)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Maquinaria" fill="hsl(174, 72%, 56%)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Herramientas" fill="hsl(45, 90%, 55%)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Construcción" fill="hsl(280, 60%, 50%)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Electromecánica" fill="hsl(340, 70%, 55%)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[hsl(200,80%,50%)]" />
                <span className="text-[10px] text-muted-foreground">HVAC</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[hsl(174,72%,56%)]" />
                <span className="text-[10px] text-muted-foreground">Maquinaria</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[hsl(45,90%,55%)]" />
                <span className="text-[10px] text-muted-foreground">Herramientas</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Sales by Location - Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="lg:col-span-3 bg-card border border-border rounded-xl p-4"
          >
            <h3 className="font-semibold text-foreground mb-4">Ventas por Ubicación</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByLocationData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tickFormatter={formatK}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Ventas']}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(200, 80%, 50%)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Sales by Category - Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-3 bg-card border border-border rounded-xl p-4"
          >
            <h3 className="font-semibold text-foreground mb-4">Ventas por Categoría</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ value }) => `${value}%`}
                    labelLine={false}
                  >
                    {salesByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}%`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {salesByCategoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sales by City - Treemap-like Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="lg:col-span-6 bg-card border border-border rounded-xl p-4"
          >
            <h3 className="font-semibold text-foreground mb-4">Ventas por Ciudad</h3>
            <div className="grid grid-cols-4 gap-1 h-56">
              {salesByCityData.map((city, index) => {
                const maxValue = Math.max(...salesByCityData.map(c => c.value));
                const intensity = city.value / maxValue;
                const size = index < 2 ? 'col-span-2 row-span-2' : 
                             index < 4 ? 'col-span-1 row-span-2' : 
                             'col-span-1 row-span-1';
                
                return (
                  <motion.div
                    key={city.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.03 }}
                    className={`${size} rounded-lg flex items-center justify-center p-2 transition-all hover:scale-105 cursor-pointer`}
                    style={{
                      backgroundColor: `hsl(200, 80%, ${50 + (1 - intensity) * 30}%)`,
                    }}
                  >
                    <span className={`font-medium text-center leading-tight ${
                      index < 4 ? 'text-sm' : 'text-[10px]'
                    } text-primary-foreground`}>
                      {city.name}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </AnimatedPage>
    </MainLayout>
  );
};

export default KPIsDashboard;
