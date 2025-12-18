import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  description?: string;
  delay?: number;
  gradient?: boolean;
  children?: ReactNode;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  description,
  delay = 0,
  gradient = false,
  children,
}: MetricCardProps) {
  const changeColors = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`
        relative overflow-hidden rounded-xl p-6 shadow-card transition-all duration-300
        ${gradient 
          ? "gradient-card border border-primary/20 shadow-glow" 
          : "bg-card border border-border hover:border-primary/30"
        }
      `}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <Icon className="w-full h-full" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center
            ${gradient ? "gradient-primary" : "bg-primary/10"}
          `}>
            <Icon className={`w-6 h-6 ${gradient ? "text-primary-foreground" : "text-primary"}`} />
          </div>
          {change && (
            <span className={`text-sm font-medium ${changeColors[changeType]}`}>
              {change}
            </span>
          )}
        </div>

        <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
        <p className="text-3xl font-display font-bold tracking-tight">{value}</p>
        
        {description && (
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        )}

        {children}
      </div>
    </motion.div>
  );
}
