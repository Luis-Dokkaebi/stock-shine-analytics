import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save, Bell, Shield, Database, Palette } from "lucide-react";
import { motion } from "framer-motion";

const Settings = () => {
  return (
    <MainLayout>
      <PageHeader 
        title="Configuración" 
        subtitle="Ajustes del sistema y preferencias"
      >
        <Button size="sm" className="gap-2 gradient-primary text-primary-foreground">
          <Save className="w-4 h-4" />
          Guardar Cambios
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <DashboardCard 
          title="Configuración General" 
          subtitle="Información de la empresa"
          delay={0.1}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Nombre de Empresa</Label>
              <Input 
                id="company" 
                defaultValue="Holtmont Services" 
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warehouse">Nombre del Almacén</Label>
              <Input 
                id="warehouse" 
                defaultValue="Almacén Principal" 
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Input 
                id="currency" 
                defaultValue="USD ($)" 
                className="bg-secondary/50"
              />
            </div>
          </div>
        </DashboardCard>

        {/* Notifications */}
        <DashboardCard 
          title="Notificaciones" 
          subtitle="Alertas y avisos del sistema"
          delay={0.2}
        >
          <div className="space-y-4">
            {[
              { label: "Alertas de stock bajo", description: "Notificar cuando un producto alcance el mínimo", defaultChecked: true },
              { label: "Reportes automáticos", description: "Enviar reportes semanales por email", defaultChecked: true },
              { label: "Alertas de baja rotación", description: "Notificar productos sin movimiento", defaultChecked: false },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
              >
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Switch defaultChecked={item.defaultChecked} />
              </motion.div>
            ))}
          </div>
        </DashboardCard>

        {/* Rotation Parameters */}
        <DashboardCard 
          title="Parámetros de Rotación" 
          subtitle="Configuración del modelo de penalización"
          delay={0.3}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="highRotation">Alta Rotación (días)</Label>
                <Input 
                  id="highRotation" 
                  type="number" 
                  defaultValue="30" 
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="highPenalty">Penalización (%)</Label>
                <Input 
                  id="highPenalty" 
                  type="number" 
                  defaultValue="0" 
                  className="bg-secondary/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mediumRotation">Media Rotación (días)</Label>
                <Input 
                  id="mediumRotation" 
                  type="number" 
                  defaultValue="60" 
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mediumPenalty">Penalización (%)</Label>
                <Input 
                  id="mediumPenalty" 
                  type="number" 
                  defaultValue="0.5" 
                  className="bg-secondary/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lowRotation">Baja Rotación (días)</Label>
                <Input 
                  id="lowRotation" 
                  type="number" 
                  defaultValue="90" 
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lowPenalty">Penalización (%)</Label>
                <Input 
                  id="lowPenalty" 
                  type="number" 
                  defaultValue="1.5" 
                  className="bg-secondary/50"
                />
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* System Info */}
        <DashboardCard 
          title="Información del Sistema" 
          subtitle="Estado y versión"
          delay={0.4}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-primary" />
                <span>Base de Datos</span>
              </div>
              <span className="text-success font-medium">Conectada</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <span>Seguridad</span>
              </div>
              <span className="text-success font-medium">Activa</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-primary" />
                <span>Versión</span>
              </div>
              <span className="text-muted-foreground">v1.0.0</span>
            </div>
          </div>
        </DashboardCard>
      </div>
    </MainLayout>
  );
};

export default Settings;
