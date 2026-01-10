import { MainLayout } from "@/components/layout/MainLayout";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Snowflake, 
  Zap, 
  Hammer, 
  Cog, 
  ShoppingBag,
  Package,
  Users,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const departmentConfig: Record<string, { name: string; icon: React.ComponentType<any>; color: string }> = {
  hvac: { name: "HVAC", icon: Snowflake, color: "from-cyan-500 to-blue-600" },
  electro: { name: "Electromecánico", icon: Zap, color: "from-yellow-500 to-orange-600" },
  herreria: { name: "Herrería", icon: Hammer, color: "from-gray-500 to-gray-700" },
  maquinaria: { name: "Maquinaria", icon: Cog, color: "from-emerald-500 to-green-600" },
  producto: { name: "Producto", icon: ShoppingBag, color: "from-purple-500 to-pink-600" },
};

// Mock data for demonstration
const mockStats = {
  totalParts: 156,
  activeOrders: 8,
  technicians: 12,
  pendingRequests: 5,
};

const mockRecentOrders = [
  { id: "OR-2024-001", technician: "Juan Pérez", status: "pending", parts: 3, date: "2024-01-10" },
  { id: "OR-2024-002", technician: "María García", status: "completed", parts: 5, date: "2024-01-09" },
  { id: "OR-2024-003", technician: "Carlos López", status: "in_progress", parts: 2, date: "2024-01-09" },
  { id: "OR-2024-004", technician: "Ana Martínez", status: "completed", parts: 4, date: "2024-01-08" },
];

const mockTopParts = [
  { name: "Filtro de aire industrial", stock: 45, usage: 78 },
  { name: "Compresor 5HP", stock: 12, usage: 65 },
  { name: "Válvula de control", stock: 28, usage: 52 },
  { name: "Motor eléctrico 3HP", stock: 8, usage: 45 },
];

const statusConfig = {
  pending: { label: "Pendiente", color: "bg-yellow-500", icon: Clock },
  in_progress: { label: "En Proceso", color: "bg-blue-500", icon: AlertTriangle },
  completed: { label: "Completado", color: "bg-green-500", icon: CheckCircle },
};

const Department = () => {
  const { dept } = useParams<{ dept: string }>();
  const config = departmentConfig[dept || "hvac"] || departmentConfig.hvac;
  const Icon = config.icon;

  return (
    <MainLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-xl bg-gradient-to-br ${config.color}`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">{config.name}</h1>
            <p className="text-muted-foreground">Panel de control del departamento</p>
          </div>
          <Badge variant="outline" className="ml-auto text-sm">
            Prototipo
          </Badge>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Partes Asignadas", value: mockStats.totalParts, icon: Package, color: "text-blue-500" },
          { label: "Órdenes Activas", value: mockStats.activeOrders, icon: ClipboardList, color: "text-emerald-500" },
          { label: "Técnicos", value: mockStats.technicians, icon: Users, color: "text-purple-500" },
          { label: "Solicitudes Pendientes", value: mockStats.pendingRequests, icon: AlertTriangle, color: "text-amber-500" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Órdenes Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentOrders.map((order) => {
                  const status = statusConfig[order.status as keyof typeof statusConfig];
                  const StatusIcon = status.icon;
                  return (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${status.color}`} />
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.technician}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="gap-1">
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{order.parts} partes</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Parts Usage */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Partes Más Utilizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTopParts.map((part, index) => (
                  <div key={part.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{part.name}</span>
                      <span className="text-sm text-muted-foreground">Stock: {part.stock}</span>
                    </div>
                    <Progress value={part.usage} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">{part.usage}% de rotación</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              📋 Este es un <strong>prototipo</strong> del panel de departamento. 
              Los datos mostrados son de ejemplo para demostración.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
};

export default Department;
