import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Settings,
  BarChart3,
  Warehouse
} from "lucide-react";
import holtmontLogo from "@/assets/holtmont-logo.png";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Package, label: "Inventario", path: "/inventory" },
  { icon: TrendingUp, label: "Análisis de Ventas", path: "/sales" },
  { icon: DollarSign, label: "Costos Operativos", path: "/costs" },
  { icon: BarChart3, label: "Reportes", path: "/reports" },
  { icon: Settings, label: "Configuración", path: "/settings" },
];

export function Sidebar() {
  const location = useLocation();

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
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group
                  ${isActive 
                    ? "bg-primary/10 text-primary shadow-glow" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                  }
                `}
              >
                <item.icon 
                  className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? "text-primary" : ""
                  }`} 
                />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
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
