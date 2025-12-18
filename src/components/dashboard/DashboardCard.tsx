import { motion } from "framer-motion";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  delay?: number;
  className?: string;
  action?: ReactNode;
}

export function DashboardCard({ 
  title, 
  subtitle, 
  children, 
  delay = 0,
  className = "",
  action
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`
        bg-card border border-border rounded-xl overflow-hidden shadow-card
        hover:border-primary/20 transition-colors duration-300
        ${className}
      `}
    >
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h3 className="text-lg font-display font-semibold">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
}
