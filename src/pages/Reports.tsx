import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { FileText, Download, Calendar, Filter, PieChart, BarChart3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const reportTypes = [
  {
    icon: PieChart,
    title: "Reporte de Inventario",
    description: "Valor total, distribución por categoría y análisis de existencias",
    lastGenerated: "Hace 2 horas",
  },
  {
    icon: TrendingUp,
    title: "Análisis de Ventas",
    description: "Tendencias, comparativas y proyecciones de ventas",
    lastGenerated: "Hace 1 día",
  },
  {
    icon: BarChart3,
    title: "Rotación de Inventario",
    description: "Productos por nivel de rotación y penalizaciones",
    lastGenerated: "Hace 3 días",
  },
  {
    icon: FileText,
    title: "Costos Operativos",
    description: "Desglose de gastos y análisis de eficiencia",
    lastGenerated: "Hace 1 semana",
  },
];

const Reports = () => {
  return (
    <MainLayout>
      <PageHeader 
        title="Reportes" 
        subtitle="Generación y exportación de informes"
      >
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="w-4 h-4" />
          Programar Reporte
        </Button>
        <Button size="sm" className="gap-2 gradient-primary text-primary-foreground">
          <FileText className="w-4 h-4" />
          Nuevo Reporte
        </Button>
      </PageHeader>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {reportTypes.map((report, index) => (
          <motion.div
            key={report.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300 shadow-card"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <report.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Última generación: {report.lastGenerated}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Export Options */}
      <DashboardCard 
        title="Exportar a Google Sheets" 
        subtitle="Conecta tus datos con hojas de cálculo externas"
        delay={0.5}
      >
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-success" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 3H4.5C3.67 3 3 3.67 3 4.5v15c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zM9 17H6v-3h3v3zm0-5H6V9h3v3zm4 5h-3v-3h3v3zm0-5h-3V9h3v3zm4 5h-3v-3h3v3zm0-5h-3V9h3v3z"/>
              </svg>
            </div>
            <div>
              <p className="font-medium">Google Sheets Integration</p>
              <p className="text-sm text-muted-foreground">Sincroniza automáticamente tus datos de inventario</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            Conectar
          </Button>
        </div>
      </DashboardCard>
    </MainLayout>
  );
};

export default Reports;
