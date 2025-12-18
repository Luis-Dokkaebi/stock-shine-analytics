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
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const salesData = [
  { name: "Sem 1", ventas: 45000, proyectado: 42000 },
  { name: "Sem 2", ventas: 52000, proyectado: 48000 },
  { name: "Sem 3", ventas: 48000, proyectado: 50000 },
  { name: "Sem 4", ventas: 61000, proyectado: 55000 },
  { name: "Sem 5", ventas: 55000, proyectado: 58000 },
  { name: "Sem 6", ventas: 67000, proyectado: 62000 },
  { name: "Sem 7", ventas: 72000, proyectado: 68000 },
  { name: "Sem 8", ventas: 69000, proyectado: 70000 },
];

const categoryData = [
  { name: "Electrónicos", value: 35, color: "hsl(174, 72%, 56%)" },
  { name: "Herramientas", value: 25, color: "hsl(199, 89%, 48%)" },
  { name: "Materiales", value: 20, color: "hsl(38, 92%, 50%)" },
  { name: "Equipos", value: 15, color: "hsl(142, 76%, 36%)" },
  { name: "Otros", value: 5, color: "hsl(220, 10%, 55%)" },
];

const rotationData = [
  { name: "Alta Rotación", productos: 156, dias: 15 },
  { name: "Media Rotación", productos: 89, dias: 45 },
  { name: "Baja Rotación", productos: 34, dias: 90 },
  { name: "Sin Movimiento", productos: 12, dias: 180 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-elevated">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function SalesChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={salesData}>
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(174, 72%, 56%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(174, 72%, 56%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(220, 10%, 55%)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="hsl(220, 10%, 55%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" />
        <XAxis 
          dataKey="name" 
          stroke="hsl(215, 15%, 55%)" 
          fontSize={12}
          tickLine={false}
        />
        <YAxis 
          stroke="hsl(215, 15%, 55%)" 
          fontSize={12}
          tickLine={false}
          tickFormatter={(value) => `$${value / 1000}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="proyectado"
          stroke="hsl(220, 10%, 55%)"
          strokeWidth={2}
          fill="url(#projectedGradient)"
          strokeDasharray="5 5"
        />
        <Area
          type="monotone"
          dataKey="ventas"
          stroke="hsl(174, 72%, 56%)"
          strokeWidth={2}
          fill="url(#salesGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={categoryData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          dataKey="value"
        >
          {categoryData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [`${value}%`, "Participación"]}
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
  );
}

export function RotationChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={rotationData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" horizontal={false} />
        <XAxis 
          type="number" 
          stroke="hsl(215, 15%, 55%)" 
          fontSize={12}
          tickLine={false}
        />
        <YAxis 
          type="category" 
          dataKey="name" 
          stroke="hsl(215, 15%, 55%)" 
          fontSize={12}
          tickLine={false}
          width={100}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: "hsl(220, 18%, 13%)",
            border: "1px solid hsl(220, 15%, 20%)",
            borderRadius: "8px",
          }}
          formatter={(value: number, name: string) => [
            name === "productos" ? `${value} productos` : `${value} días`,
            name === "productos" ? "Cantidad" : "Días promedio"
          ]}
        />
        <Bar dataKey="productos" fill="hsl(174, 72%, 56%)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
