import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DepartmentHeader } from "@/components/department/DepartmentHeader";
import { useDepartmentParts } from "@/hooks/useDepartmentParts";
import { useDepartmentOrders } from "@/hooks/useDepartmentOrders";
import { getDepartmentConfig } from "@/config/departments";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Loader2 } from "lucide-react";

const DepartmentSales = () => {
  const { dept } = useParams<{ dept: string }>();
  const config = getDepartmentConfig(dept || "hvac");
  const { data: parts = [], isLoading: partsLoading } = useDepartmentParts(config.dbKey);
  const { data: orders = [], isLoading: ordersLoading } = useDepartmentOrders(config.name.toUpperCase());

  const isLoading = partsLoading || ordersLoading;

  // Stats
  const totalValue = parts.reduce((sum, p) => sum + Number(p.sale_price) * p.stock, 0);
  const categoryData = parts.reduce((acc, part) => {
    const existing = acc.find(c => c.name === part.category);
    if (existing) {
      existing.value += part.stock;
    } else {
      acc.push({ name: part.category, value: part.stock });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const rotationData = [
    { name: "Alta", value: parts.filter(p => p.rotation === "high").length, color: "hsl(142, 71%, 45%)" },
    { name: "Media", value: parts.filter(p => p.rotation === "medium").length, color: "hsl(48, 96%, 53%)" },
    { name: "Baja", value: parts.filter(p => p.rotation === "low").length, color: "hsl(0, 72%, 51%)" },
  ];

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
      <DepartmentHeader title="Análisis" subtitle="Estadísticas y análisis del inventario" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard title="Valor Potencial" className="text-center">
          <p className="text-3xl font-bold text-primary">${totalValue.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">Valor total de venta</p>
        </DashboardCard>
        <DashboardCard title="Total Productos" className="text-center">
          <p className="text-3xl font-bold">{parts.length}</p>
          <p className="text-sm text-muted-foreground mt-1">SKUs registrados</p>
        </DashboardCard>
        <DashboardCard title="Órdenes Activas" className="text-center">
          <p className="text-3xl font-bold">{orders.filter(o => o.status === "open").length}</p>
          <p className="text-sm text-muted-foreground mt-1">En proceso</p>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Stock por Categoría">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Sin datos
            </div>
          )}
        </DashboardCard>

        <DashboardCard title="Distribución por Rotación">
          {parts.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={rotationData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" label>
                  {rotationData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Sin datos
            </div>
          )}
        </DashboardCard>
      </div>
    </MainLayout>
  );
};

export default DepartmentSales;
