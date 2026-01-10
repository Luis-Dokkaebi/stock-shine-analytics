import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Package, 
  DollarSign, 
  Settings,
  BarChart3,
  Warehouse,
  Wrench,
  FileText,
  ChevronDown,
  ChevronRight,
  Snowflake,
  Zap,
  Hammer,
  Cog,
  ShoppingBag
} from "lucide-react";
import holtmontLogo from "@/assets/holtmont-logo.png";

const almacenSubItems = [
  { icon: Wrench, label: "Zona Técnica", path: "/technician" },
  { icon: Package, label: "Inventario", path: "/inventory" },
  { icon: BarChart3, label: "Análisis", path: "/sales" },
  { icon: DollarSign, label: "Costos Operativos", path: "/costs" },
  { icon: FileText, label: "Reportes", path: "/reports" },
];

const departments = [
  { icon: Snowflake, label: "HVAC", path: "/departments/hvac" },
  { icon: Zap, label: "Electromecánico", path: "/departments/electro" },
  { icon: Hammer, label: "Herrería", path: "/departments/herreria" },
  { icon: Cog, label: "Maquinaria", path: "/departments/maquinaria" },
  { icon: ShoppingBag, label: "Producto", path: "/departments/producto" },
];

export function Sidebar() {
  const location = useLocation();
  const [almacenOpen, setAlmacenOpen] = useState(true);
  const [departmentsOpen, setDepartmentsOpen] = useState(true);

  const isAlmacenActive = almacenSubItems.some(item => location.pathname === item.path);

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50"
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src={holtmontLogo} 
            alt="Holtmont Services" 
            className="h-12 w-auto object-contain"
          />
        </Link>
        <p className="text-xs text-muted-foreground mt-2 tracking-wider uppercase">
          Control de Almacén
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Dashboard Link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            to="/"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group
              ${location.pathname === "/" 
                ? "bg-primary/10 text-primary shadow-glow" 
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              }
            `}
          >
            <LayoutDashboard className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${location.pathname === "/" ? "text-primary" : ""}`} />
            <span className="font-medium">Dashboard</span>
            {location.pathname === "/" && (
              <motion.div layoutId="activeIndicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </Link>
        </motion.div>

        {/* Almacén General Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={() => setAlmacenOpen(!almacenOpen)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
              ${isAlmacenActive 
                ? "bg-primary/10 text-primary" 
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              }
            `}
          >
            <Warehouse className={`w-5 h-5 ${isAlmacenActive ? "text-primary" : ""}`} />
            <span className="font-medium flex-1 text-left">Almacén General</span>
            {almacenOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {almacenOpen && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-2">
              {almacenSubItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 text-sm group
                        ${isActive 
                          ? "bg-primary/10 text-primary" 
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                        }
                      `}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? "text-primary" : ""}`} />
                      <span>{item.label}</span>
                      {isActive && (
                        <motion.div layoutId="subActiveIndicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Departments Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setDepartmentsOpen(!departmentsOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium flex-1 text-left">Departamentos</span>
            {departmentsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {departmentsOpen && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-2">
              {departments.map((dept, index) => (
                <motion.div
                  key={dept.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={dept.path}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground group"
                  >
                    <dept.icon className="w-4 h-4" />
                    <span>{dept.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            to="/settings"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group
              ${location.pathname === "/settings" 
                ? "bg-primary/10 text-primary shadow-glow" 
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              }
            `}
          >
            <Settings className={`w-5 h-5 ${location.pathname === "/settings" ? "text-primary" : ""}`} />
            <span className="font-medium">Configuración</span>
          </Link>
        </motion.div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/50">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
            <Warehouse className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Holtmont Services</p>
            <p className="text-xs text-muted-foreground">Sistema WCS</p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
