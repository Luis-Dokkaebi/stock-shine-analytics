import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { getDepartmentConfig } from "@/config/departments";
import { Badge } from "@/components/ui/badge";

interface DepartmentHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function DepartmentHeader({ title, subtitle, children }: DepartmentHeaderProps) {
  const { dept } = useParams<{ dept: string }>();
  const config = getDepartmentConfig(dept || "hvac");
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-4 flex-wrap">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${config.color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-display font-bold">{title}</h1>
            <Badge variant="outline" className="text-xs">
              {config.name}
            </Badge>
          </div>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-2">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
}
