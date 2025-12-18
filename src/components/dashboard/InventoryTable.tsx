import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ArrowUpDown, Package, AlertTriangle, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const inventoryData = [
  { id: 1, sku: "ELEC-001", nombre: "Monitor LED 24\"", categoria: "Electrónicos", cantidad: 45, costoUnit: 180, precioVenta: 299, rotacion: "alta", diasAlmacen: 12 },
  { id: 2, sku: "HERR-015", nombre: "Taladro Industrial", categoria: "Herramientas", cantidad: 23, costoUnit: 95, precioVenta: 159, rotacion: "media", diasAlmacen: 35 },
  { id: 3, sku: "MAT-089", nombre: "Cable Eléctrico 100m", categoria: "Materiales", cantidad: 150, costoUnit: 45, precioVenta: 79, rotacion: "alta", diasAlmacen: 8 },
  { id: 4, sku: "EQUI-022", nombre: "Compresor de Aire", categoria: "Equipos", cantidad: 8, costoUnit: 450, precioVenta: 699, rotacion: "baja", diasAlmacen: 78 },
  { id: 5, sku: "ELEC-045", nombre: "Teclado Mecánico", categoria: "Electrónicos", cantidad: 67, costoUnit: 55, precioVenta: 89, rotacion: "alta", diasAlmacen: 5 },
  { id: 6, sku: "HERR-089", nombre: "Sierra Circular", categoria: "Herramientas", cantidad: 12, costoUnit: 220, precioVenta: 349, rotacion: "media", diasAlmacen: 42 },
  { id: 7, sku: "MAT-156", nombre: "Tubería PVC 2\"", categoria: "Materiales", cantidad: 200, costoUnit: 12, precioVenta: 22, rotacion: "alta", diasAlmacen: 15 },
  { id: 8, sku: "EQUI-011", nombre: "Generador Portátil", categoria: "Equipos", cantidad: 3, costoUnit: 890, precioVenta: 1299, rotacion: "baja", diasAlmacen: 120 },
];

const rotacionBadge = {
  alta: { variant: "default" as const, className: "bg-success/20 text-success border-success/30" },
  media: { variant: "default" as const, className: "bg-warning/20 text-warning border-warning/30" },
  baja: { variant: "default" as const, className: "bg-destructive/20 text-destructive border-destructive/30" },
};

export function InventoryTable() {
  const [search, setSearch] = useState("");
  
  const filteredData = inventoryData.filter(item =>
    item.nombre.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase()) ||
    item.categoria.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, SKU o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary/50 border-border focus:border-primary"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">SKU</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Producto</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Categoría</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Cantidad</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Costo Unit.</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Precio Venta</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Rotación</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Días en Almacén</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredData.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-secondary/30 transition-colors"
              >
                <td className="p-4">
                  <code className="text-sm text-primary font-mono">{item.sku}</code>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium">{item.nombre}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{item.categoria}</td>
                <td className="p-4 text-right font-medium">{item.cantidad}</td>
                <td className="p-4 text-right text-muted-foreground">${item.costoUnit.toLocaleString()}</td>
                <td className="p-4 text-right font-medium text-primary">${item.precioVenta.toLocaleString()}</td>
                <td className="p-4 text-center">
                  <Badge className={rotacionBadge[item.rotacion].className}>
                    {item.rotacion === "alta" ? "Alta" : item.rotacion === "media" ? "Media" : "Baja"}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={item.diasAlmacen > 60 ? "text-destructive" : "text-muted-foreground"}>
                      {item.diasAlmacen} días
                    </span>
                    {item.diasAlmacen > 60 && (
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Mostrando {filteredData.length} de {inventoryData.length} productos</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success" />
            Alta rotación: {inventoryData.filter(i => i.rotacion === "alta").length}
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning" />
            Media: {inventoryData.filter(i => i.rotacion === "media").length}
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            Baja: {inventoryData.filter(i => i.rotacion === "baja").length}
          </span>
        </div>
      </div>
    </div>
  );
}
