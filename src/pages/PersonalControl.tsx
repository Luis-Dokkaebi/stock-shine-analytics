import { MainLayout } from "@/components/layout/MainLayout";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  HardHat, 
  Receipt, 
  Building2, 
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  Calendar,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const moduleConfig: Record<string, { 
  name: string; 
  icon: React.ComponentType<any>; 
  color: string;
  description: string;
}> = {
  epp: { 
    name: "Entrega EPP", 
    icon: HardHat, 
    color: "from-orange-500 to-red-600",
    description: "Control de equipo de protección personal"
  },
  vales: { 
    name: "Vales / Resguardo", 
    icon: Receipt, 
    color: "from-cyan-500 to-teal-600",
    description: "Gestión de vales y resguardos de personal"
  },
  "centro-costo": { 
    name: "Centro Costo / Cargo", 
    icon: Building2, 
    color: "from-indigo-500 to-violet-600",
    description: "Asignación de costos por persona"
  },
  "tiempo-extra": { 
    name: "Tiempo Extra", 
    icon: Clock, 
    color: "from-rose-500 to-pink-600",
    description: "Control y registro de tiempo extra"
  },
};

// Mock data for EPP
const mockEPPData = [
  { id: 1, empleado: "Juan Pérez", equipo: "Casco de seguridad", fecha: "2024-01-10", estado: "Entregado" },
  { id: 2, empleado: "María García", equipo: "Guantes industriales", fecha: "2024-01-09", estado: "Pendiente" },
  { id: 3, empleado: "Carlos López", equipo: "Lentes de seguridad", fecha: "2024-01-09", estado: "Entregado" },
  { id: 4, empleado: "Ana Martínez", equipo: "Botas de seguridad", fecha: "2024-01-08", estado: "Entregado" },
  { id: 5, empleado: "Pedro Sánchez", equipo: "Chaleco reflectante", fecha: "2024-01-08", estado: "Pendiente" },
];

// Mock data for Vales
const mockValesData = [
  { id: 1, empleado: "Juan Pérez", tipo: "Herramienta", descripcion: "Taladro inalámbrico", fecha: "2024-01-10", estado: "Activo" },
  { id: 2, empleado: "María García", tipo: "Equipo", descripcion: "Multímetro digital", fecha: "2024-01-09", estado: "Devuelto" },
  { id: 3, empleado: "Carlos López", tipo: "Herramienta", descripcion: "Juego de llaves", fecha: "2024-01-08", estado: "Activo" },
  { id: 4, empleado: "Ana Martínez", tipo: "Material", descripcion: "Cable eléctrico 50m", fecha: "2024-01-07", estado: "Consumido" },
];

// Mock data for Centro Costo
const mockCentroCostoData = [
  { id: 1, empleado: "Juan Pérez", departamento: "HVAC", proyecto: "Torre Norte", cargo: "Técnico Sr.", costoMensual: 25000 },
  { id: 2, empleado: "María García", departamento: "Electromecánico", proyecto: "Plaza Central", cargo: "Supervisora", costoMensual: 32000 },
  { id: 3, empleado: "Carlos López", departamento: "Herrería", proyecto: "Centro Comercial", cargo: "Soldador", costoMensual: 22000 },
  { id: 4, empleado: "Ana Martínez", departamento: "Maquinaria", proyecto: "Bodega Industrial", cargo: "Operadora", costoMensual: 28000 },
];

// Mock data for Tiempo Extra
const mockTiempoExtraData = [
  { id: 1, empleado: "Juan Pérez", fecha: "2024-01-10", horasExtra: 3, motivo: "Urgencia en proyecto", autorizado: "Sí" },
  { id: 2, empleado: "María García", fecha: "2024-01-09", horasExtra: 2, motivo: "Cierre de mes", autorizado: "Sí" },
  { id: 3, empleado: "Carlos López", fecha: "2024-01-09", horasExtra: 4, motivo: "Mantenimiento nocturno", autorizado: "Pendiente" },
  { id: 4, empleado: "Ana Martínez", fecha: "2024-01-08", horasExtra: 2.5, motivo: "Capacitación", autorizado: "Sí" },
];

const PersonalControl = () => {
  const { module } = useParams<{ module: string }>();
  const config = moduleConfig[module || "epp"] || moduleConfig.epp;
  const Icon = config.icon;

  const renderContent = () => {
    switch (module) {
      case "epp":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardHat className="w-5 h-5" />
                Registro de Entregas EPP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEPPData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.empleado}</TableCell>
                      <TableCell>{item.equipo}</TableCell>
                      <TableCell>{item.fecha}</TableCell>
                      <TableCell>
                        <Badge variant={item.estado === "Entregado" ? "default" : "secondary"}>
                          {item.estado === "Entregado" ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                          {item.estado}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "vales":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Control de Vales y Resguardos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockValesData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.empleado}</TableCell>
                      <TableCell>{item.tipo}</TableCell>
                      <TableCell>{item.descripcion}</TableCell>
                      <TableCell>{item.fecha}</TableCell>
                      <TableCell>
                        <Badge variant={item.estado === "Activo" ? "default" : item.estado === "Devuelto" ? "secondary" : "outline"}>
                          {item.estado}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "centro-costo":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Asignación Centro de Costo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead className="text-right">Costo Mensual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCentroCostoData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.empleado}</TableCell>
                      <TableCell>{item.departamento}</TableCell>
                      <TableCell>{item.proyecto}</TableCell>
                      <TableCell>{item.cargo}</TableCell>
                      <TableCell className="text-right font-mono">
                        ${item.costoMensual.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      case "tiempo-extra":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Registro de Tiempo Extra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Horas Extra</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Autorizado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTiempoExtraData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.empleado}</TableCell>
                      <TableCell>{item.fecha}</TableCell>
                      <TableCell className="font-mono">{item.horasExtra}h</TableCell>
                      <TableCell>{item.motivo}</TableCell>
                      <TableCell>
                        <Badge variant={item.autorizado === "Sí" ? "default" : "secondary"}>
                          {item.autorizado}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  // Stats based on module
  const getStats = () => {
    switch (module) {
      case "epp":
        return [
          { label: "Total Entregas", value: 24, icon: HardHat },
          { label: "Pendientes", value: 5, icon: AlertTriangle },
          { label: "Este Mes", value: 12, icon: Calendar },
          { label: "Empleados", value: 45, icon: Users },
        ];
      case "vales":
        return [
          { label: "Vales Activos", value: 18, icon: Receipt },
          { label: "Devueltos", value: 32, icon: CheckCircle },
          { label: "Este Mes", value: 8, icon: Calendar },
          { label: "Por Empleado", value: 2.4, icon: Users },
        ];
      case "centro-costo":
        return [
          { label: "Empleados Asignados", value: 45, icon: Users },
          { label: "Proyectos Activos", value: 8, icon: Building2 },
          { label: "Costo Total", value: "1.2M", icon: FileText },
          { label: "Departamentos", value: 5, icon: Building2 },
        ];
      case "tiempo-extra":
        return [
          { label: "Horas Este Mes", value: 156, icon: Clock },
          { label: "Solicitudes Pendientes", value: 3, icon: AlertTriangle },
          { label: "Empleados", value: 28, icon: Users },
          { label: "Promedio/Empleado", value: "5.5h", icon: Calendar },
        ];
      default:
        return [];
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-xl bg-gradient-to-br ${config.color}`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">{config.name}</h1>
            <p className="text-muted-foreground">{config.description}</p>
          </div>
          <Badge variant="outline" className="ml-auto text-sm">
            Prototipo - Datos Mock
          </Badge>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {getStats().map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-3 mb-6"
      >
        <Button className="gap-2">
          <Icon className="w-4 h-4" />
          Nuevo Registro
        </Button>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Exportar
        </Button>
      </motion.div>

      {/* Content Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {renderContent()}
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              📋 Este es un <strong>prototipo</strong> del módulo {config.name}. 
              Los datos mostrados son de ejemplo para demostración.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
};

export default PersonalControl;
