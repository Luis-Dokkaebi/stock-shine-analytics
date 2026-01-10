import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Warehouse, 
  Wrench, 
  Package, 
  FileText,
  BarChart3,
  DollarSign,
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
    { name: "HVAC", icon: Snowflake },
    { name: "Electromecánico", icon: Zap },
    { name: "Herrería", icon: Hammer },
    { name: "Maquinaria", icon: Cog },
    { name: "Producto", icon: ShoppingBag },
  ];

  const almacenSubcategories = [
    { 
      title: "Zona Técnica", 
      description: "Solicitud de herramientas y materiales",
      icon: Wrench,
      path: "/technician",
      color: "from-blue-500 to-blue-600"
    },
    { 
      title: "Inventario", 
      description: "Existencia y control de materiales",
      icon: Package,
      path: "/inventory",
      color: "from-emerald-500 to-emerald-600"
    },
    { 
      title: "Análisis", 
      description: "Análisis de movimientos y tendencias",
      icon: BarChart3,
      path: "/reports",
      color: "from-purple-500 to-purple-600"
    },
    { 
      title: "Costos Operativos", 
      description: "Control de costos y gastos",
      icon: DollarSign,
      path: "/costs",
      color: "from-amber-500 to-amber-600"
    },
    { 
      title: "Reportes", 
      description: "Reportes y documentación",
      icon: FileText,
      path: "/reports",
      color: "from-pink-500 to-pink-600"
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

      {/* Almacén General - Main Section with Subcategories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        {/* Almacén General Header */}
        <div className="flex items-center gap-3 p-4 rounded-t-xl bg-primary/10 border border-primary/20 border-b-0">
          <div className="p-3 rounded-lg bg-primary">
            <Warehouse className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">Almacén General</h2>
            <p className="text-sm text-muted-foreground">
              Sistema de control de inventario y gestión de almacén
            </p>
          </div>
        </div>

        {/* Subcategories Grid */}
        <div className="p-4 rounded-b-xl border border-primary/20 bg-card/50">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {almacenSubcategories.map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                onClick={() => navigate(module.path)}
                className="cursor-pointer group"
              >
                <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1">
                  <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${module.color} opacity-10 rounded-bl-full transition-all duration-300 group-hover:opacity-20`} />
                  
                  <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${module.color} text-white mb-3`}>
                    <module.icon className="w-5 h-5" />
                  </div>
                  
                  <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {module.description}
                  </p>
                  
                  <div className="flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                    Acceder
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Departments Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Departamentos
        </h3>
        <div className="flex flex-wrap gap-3">
          {departments.map((dept, index) => (
            <motion.div
              key={dept.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 + index * 0.05 }}
            >
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <dept.icon className="w-5 h-5" />
                {dept.name}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Index;
