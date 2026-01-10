import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ArrowUpDown, Package, AlertTriangle, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWarehouse } from "@/context/WarehouseContext";

const rotacionBadge = {
  high: { variant: "default" as const, className: "bg-success/20 text-success border-success/30" },
  medium: { variant: "default" as const, className: "bg-warning/20 text-warning border-warning/30" },
  low: { variant: "default" as const, className: "bg-destructive/20 text-destructive border-destructive/30" },
};

export function InventoryTable() {
  const [search, setSearch] = useState("");
  const { inventory } = useWarehouse();
  
  const filteredData = inventory.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
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
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Product</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Stock</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Unit Cost</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Sale Price</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Rotation</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Days in Whs</th>
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
                    {item.rotation.charAt(0).toUpperCase() + item.rotation.slice(1)}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={item.daysInWarehouse > 60 ? "text-destructive" : "text-muted-foreground"}>
                      {item.daysInWarehouse} days
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

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {filteredData.length} of {inventory.length} products</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success" />
            High: {inventory.filter(i => i.rotation === "high").length}
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning" />
            Medium: {inventory.filter(i => i.rotation === "medium").length}
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            Low: {inventory.filter(i => i.rotation === "low").length}
          </span>
        </div>
      </div>
    </div>
  );
}
