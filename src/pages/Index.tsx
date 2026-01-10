import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { 
  Warehouse, 
  Wrench, 
  Package, 
  FileText,
  Users,
  HardHat,
  Receipt,
  Building2,
  Clock,
  Snowflake,
  Zap,
  Hammer,
  Cog,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import holtmontLogo from "@/assets/holtmont-logo.png";

const Index = () => {
  const navigate = useNavigate();

  const departments = [
    { name: "Almacén General", icon: Warehouse },
    { name: "HVAC", icon: Snowflake },
    { name: "Electromecánico", icon: Zap },
    { name: "Herrería", icon: Hammer },
    { name: "Maquinaria", icon: Cog },
    { name: "Producto", icon: ShoppingBag },
  ];

  const warehouseModules = [
    { 
      title: "Zona Técnica", 
      description: "Solicitud de herramientas y materiales por técnicos",
      icon: Wrench,
      path: "/technician",
      color: "from-blue-500 to-blue-600"
    },
    { 
      title: "Gestión de Almacén", 
      description: "Control de entradas, salidas e inventario",
      icon: Package,
      path: "/sales",
      color: "from-emerald-500 to-emerald-600"
    },
    { 
      title: "Inventario", 
      description: "Existencia, identificación y costos de materiales",
      icon: FileText,
      path: "/inventory",
      color: "from-amber-500 to-amber-600"
    },
    { 
      title: "Reportes", 
      description: "Análisis y reportes de movimientos",
      icon: FileText,
      path: "/reports",
      color: "from-purple-500 to-purple-600"
    },
  ];

  const personnelModules = [
    { 
      title: "Entrega EPP", 
      description: "Control de equipo de protección personal",
      icon: HardHat,
      path: "/settings",
      color: "from-orange-500 to-orange-600"
    },
    { 
      title: "Vales / Resguardo", 
      description: "Gestión de vales y resguardos de personal",
      icon: Receipt,
      path: "/settings",
      color: "from-cyan-500 to-cyan-600"
    },
    { 
      title: "Centro Costo / Cargo", 
      description: "Asignación de costos por personal",
      icon: Building2,
      path: "/costs",
      color: "from-pink-500 to-pink-600"
    },
    { 
      title: "Tiempo Extra", 
      description: "Control y registro de tiempo extra",
      icon: Clock,
      path: "/settings",
      color: "from-indigo-500 to-indigo-600"
    },
  ];

  return (
    <MainLayout>
      {/* Header with Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center mb-8"
      >
        <img 
          src={holtmontLogo} 
          alt="Holtmont" 
          className="h-16 object-contain"
        />
      </motion.div>

      {/* Departments Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Departamentos
        </h3>
        <div className="flex flex-wrap gap-2">
          {departments.map((dept, index) => (
            <motion.div
              key={dept.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <dept.icon className="w-4 h-4" />
                {dept.name}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Control Almacén Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Warehouse className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold">Control Almacén</h2>
            <p className="text-sm text-muted-foreground">
              Inventario, entradas, salidas y gestión de materiales
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {warehouseModules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={() => navigate(module.path)}
              className="cursor-pointer group"
            >
              <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${module.color} opacity-10 rounded-bl-full transition-all duration-300 group-hover:opacity-20`} />
                
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${module.color} text-white mb-4`}>
                  <module.icon className="w-6 h-6" />
                </div>
                
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {module.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {module.description}
                </p>
                
                <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Acceder
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Control Personal Directo Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-secondary">
            <Users className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold">Control Personal Directo</h2>
            <p className="text-sm text-muted-foreground">
              EPP, vales, centro de costo y tiempo extra
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {personnelModules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              onClick={() => navigate(module.path)}
              className="cursor-pointer group"
            >
              <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${module.color} opacity-10 rounded-bl-full transition-all duration-300 group-hover:opacity-20`} />
                
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${module.color} text-white mb-4`}>
                  <module.icon className="w-6 h-6" />
                </div>
                
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {module.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {module.description}
                </p>
                
                <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Acceder
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Index;
