import { 
  Snowflake, 
  Zap, 
  Hammer, 
  Cog, 
  ShoppingBag 
} from "lucide-react";

export interface DepartmentConfig {
  key: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  dbKey: string; // Key used in database
}

export const departmentConfigs: Record<string, DepartmentConfig> = {
  hvac: { 
    key: "hvac", 
    name: "HVAC", 
    icon: Snowflake, 
    color: "from-cyan-500 to-blue-600",
    dbKey: "hvac"
  },
  electro: { 
    key: "electro", 
    name: "Electromecánico", 
    icon: Zap, 
    color: "from-yellow-500 to-orange-600",
    dbKey: "electro"
  },
  herreria: { 
    key: "herreria", 
    name: "Herrería", 
    icon: Hammer, 
    color: "from-gray-500 to-gray-700",
    dbKey: "herreria"
  },
  maquinaria: { 
    key: "maquinaria", 
    name: "Maquinaria", 
    icon: Cog, 
    color: "from-emerald-500 to-green-600",
    dbKey: "maquinaria"
  },
  producto: { 
    key: "producto", 
    name: "Producto", 
    icon: ShoppingBag, 
    color: "from-purple-500 to-pink-600",
    dbKey: "producto"
  },
};

export const getDepartmentConfig = (deptKey: string): DepartmentConfig => {
  return departmentConfigs[deptKey] || departmentConfigs.hvac;
};
