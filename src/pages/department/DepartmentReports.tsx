import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DepartmentHeader } from "@/components/department/DepartmentHeader";
import { FileText, Download, Calendar, PieChart, BarChart3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { getDepartmentConfig } from "@/config/departments";

const reportTypes = [
  { icon: PieChart, title: "Reporte de Inventario", description: "Valor total, distribución por categoría", lastGenerated: "Hace 2 horas" },
  { icon: TrendingUp, title: "Análisis de Uso", description: "Tendencias y proyecciones", lastGenerated: "Hace 1 día" },
  { icon: BarChart3, title: "Rotación de Inventario", description: "Productos por nivel de rotación", lastGenerated: "Hace 3 días" },
  { icon: FileText, title: "Costos Operativos", description: "Desglose de gastos", lastGenerated: "Hace 1 semana" },
];

const DepartmentReports = () => {
  const { dept } = useParams<{ dept: string }>();
  const config = getDepartmentConfig(dept || "hvac");

  return (
    <MainLayout>
      <DepartmentHeader title="Reportes" subtitle="Generación y exportación de informes">
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="w-4 h-4" />
          Programar
        </Button>
        <Button size="sm" className="gap-2 gradient-primary text-primary-foreground">
          <FileText className="w-4 h-4" />
          Nuevo Reporte
        </Button>
      </DepartmentHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {reportTypes.map((report, index) => (
          <motion.div
            key={report.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <report.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                  <p className="text-xs text-muted-foreground">Última: {report.lastGenerated}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
            </div>
          </motion.div>
        ))}
      </div>

      <DashboardCard title="Exportar Datos" subtitle={`Exportar información de ${config.name}`}>
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
          <div>
            <p className="font-medium">Exportar a Excel/CSV</p>
            <p className="text-sm text-muted-foreground">Descargar datos del departamento</p>
          </div>
          <Button variant="outline">Exportar</Button>
        </div>
      </DashboardCard>
    </MainLayout>
  );
};

export default DepartmentReports;
