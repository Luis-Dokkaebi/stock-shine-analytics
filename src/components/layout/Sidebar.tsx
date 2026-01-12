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

// Each department has the same sub-items structure
const getDepartmentSubItems = (deptKey: string) => [
  { icon: Wrench, label: "Zona Técnica", path: `/departments/${deptKey}/technician` },
  { icon: Package, label: "Inventario", path: `/departments/${deptKey}/inventory` },
  { icon: BarChart3, label: "Análisis", path: `/departments/${deptKey}/sales` },
  { icon: DollarSign, label: "Costos Operativos", path: `/departments/${deptKey}/costs` },
  { icon: FileText, label: "Reportes", path: `/departments/${deptKey}/reports` },
];

const departments = [
  { icon: Snowflake, label: "HVAC", key: "hvac" },
  { icon: Zap, label: "Electromecánico", key: "electro" },
  { icon: Hammer, label: "Herrería", key: "herreria" },
  { icon: Cog, label: "Maquinaria", key: "maquinaria" },
  { icon: ShoppingBag, label: "Producto", key: "producto" },
];

export function Sidebar() {
  const location = useLocation();
  const [almacenOpen, setAlmacenOpen] = useState(true);
  const [openDepartments, setOpenDepartments] = useState<Record<string, boolean>>({});

  const isAlmacenActive = almacenSubItems.some(item => location.pathname === item.path);

  const toggleDepartment = (key: string) => {
    setOpenDepartments(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isDepartmentActive = (deptKey: string) => {
    return location.pathname.startsWith(`/departments/${deptKey}`);
  };

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

        {/* Departments Section - Each with sub-items */}
        {departments.map((dept, deptIndex) => {
          const subItems = getDepartmentSubItems(dept.key);
          const isOpen = openDepartments[dept.key];
          const isActive = isDepartmentActive(dept.key);

          return (
            <motion.div
              key={dept.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + deptIndex * 0.05 }}
            >
              <button
                onClick={() => toggleDepartment(dept.key)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
                  ${isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                  }
                `}
              >
                <dept.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                <span className="font-medium flex-1 text-left">{dept.label}</span>
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {isOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-2">
                  {subItems.map((item, index) => {
                    const isItemActive = location.pathname === item.path;
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
                            ${isItemActive 
                              ? "bg-primary/10 text-primary" 
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                            }
                          `}
                        >
                          <item.icon className={`w-4 h-4 ${isItemActive ? "text-primary" : ""}`} />
                          <span>{item.label}</span>
                          {isItemActive && (
                            <motion.div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
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
