import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Package, AlertTriangle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDepartmentParts } from "@/hooks/useDepartmentParts";

interface DepartmentInventoryTableProps {
  department: string;
}

const rotacionBadge = {
  high: { className: "bg-success/20 text-success border-success/30" },
  medium: { className: "bg-warning/20 text-warning border-warning/30" },
  low: { className: "bg-destructive/20 text-destructive border-destructive/30" },
};

export function DepartmentInventoryTable({ department }: DepartmentInventoryTableProps) {
  const [search, setSearch] = useState("");
  const { data: partsData = [], isLoading } = useDepartmentParts(department);
  
  const inventory = partsData.map(part => ({
    id: part.id,
    sku: part.sku,
    name: part.name,
    category: part.category,
    stock: part.stock,
    unitCost: part.unit_cost,
    salePrice: part.sale_price,
    rotation: (part.rotation || "medium") as "high" | "medium" | "low",
    daysInWarehouse: part.days_in_warehouse || 0,
  }));
  
  const filteredData = inventory.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (inventory.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">No hay productos en este inventario</p>
        <p className="text-sm mt-1">Agregue productos usando el botón "Realizar Entrada"</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">SKU</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Producto</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Categoría</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Stock</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Costo Unit.</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Precio Venta</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Rotación</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Días Almacén</th>
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
                    <span className="font-medium">{item.name}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">{item.category}</td>
                <td className="p-4 text-right font-medium">{item.stock}</td>
                <td className="p-4 text-right text-muted-foreground">${item.unitCost.toLocaleString()}</td>
                <td className="p-4 text-right font-medium text-primary">${item.salePrice.toLocaleString()}</td>
                <td className="p-4 text-center">
                  <Badge className={rotacionBadge[item.rotation].className}>
                    {item.rotation === "high" ? "Alta" : item.rotation === "medium" ? "Media" : "Baja"}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={item.daysInWarehouse > 60 ? "text-destructive" : "text-muted-foreground"}>
                      {item.daysInWarehouse} días
                    </span>
                    {item.daysInWarehouse > 60 && (
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Mostrando {filteredData.length} de {inventory.length} productos</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success" />
            Alta: {inventory.filter(i => i.rotation === "high").length}
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning" />
            Media: {inventory.filter(i => i.rotation === "medium").length}
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            Baja: {inventory.filter(i => i.rotation === "low").length}
          </span>
        </div>
      </div>
    </div>
  );
}
