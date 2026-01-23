import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Plus, 
  FolderPlus, 
  Package,
  Wrench,
  Zap,
  Hammer,
  Cog,
  ShoppingBag,
  Warehouse,
  Tag,
  DollarSign,
  Grid3X3,
  List,
  ChevronRight,
  FolderOpen,
} from "lucide-react";
import { useDepartmentParts, useCreateDepartmentPart, DbPart } from "@/hooks/useDepartmentParts";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Department {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const departments: Department[] = [
  { id: "hvac", name: "HVAC", icon: Zap, color: "text-blue-400", bgColor: "bg-blue-500/10" },
  { id: "electromecanica", name: "Electromecánica", icon: Cog, color: "text-amber-400", bgColor: "bg-amber-500/10" },
  { id: "herreria", name: "Herrería", icon: Hammer, color: "text-orange-400", bgColor: "bg-orange-500/10" },
  { id: "maquinaria", name: "Maquinaria", icon: Wrench, color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
  { id: "producto", name: "Producto", icon: ShoppingBag, color: "text-purple-400", bgColor: "bg-purple-500/10" },
  { id: "general", name: "Almacén General", icon: Warehouse, color: "text-cyan-400", bgColor: "bg-cyan-500/10" },
];

const ItemCatalog = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    sku: "",
    name: "",
    category: "",
    stock: 0,
    unit_cost: 0,
    sale_price: 0,
    rotation: "medium" as "high" | "medium" | "low",
    days_in_warehouse: 0,
  });

  const { data: parts = [], isLoading } = useDepartmentParts(selectedDepartment);
  const createPartMutation = useCreateDepartmentPart(selectedDepartment);

  const currentDepartment = departments.find(d => d.id === selectedDepartment) || departments[5];

  const filteredParts = parts.filter(part =>
    part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredParts.length;
  const totalUnits = filteredParts.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = filteredParts.reduce((sum, p) => sum + (p.sale_price * p.stock), 0);

  const categories = [...new Set(parts.map(p => p.category))];

  const handleCreateItem = async () => {
    if (!newItem.sku.trim() || !newItem.name.trim()) {
      toast.error("SKU y nombre son requeridos");
      return;
    }

    const existingSku = parts.find(p => p.sku.toLowerCase() === newItem.sku.toLowerCase());
    if (existingSku) {
      toast.error("Este SKU ya existe en el inventario");
      return;
    }

    createPartMutation.mutate(newItem, {
      onSuccess: () => {
        setAddItemOpen(false);
        setNewItem({
          sku: "",
          name: "",
          category: "",
          stock: 0,
          unit_cost: 0,
          sale_price: 0,
          rotation: "medium",
          days_in_warehouse: 0,
        });
        toast.success("Artículo agregado exitosamente");
      },
    });
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-2rem)] gap-0 -m-6">
        {/* Sidebar de Categorías */}
        <aside className="w-72 border-r border-border bg-card/50 flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar departamentos..."
                className="pl-9 bg-background/50"
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
                Departamentos
              </p>
              <nav className="space-y-1">
                {departments.map((dept) => {
                  const Icon = dept.icon;
                  const isSelected = selectedDepartment === dept.id;
                  return (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedDepartment(dept.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                        isSelected
                          ? `${dept.bgColor} ${dept.color} shadow-sm`
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <div className={`p-1.5 rounded-md ${isSelected ? dept.bgColor : "bg-muted/50 group-hover:bg-muted"}`}>
                        <Icon className={`w-4 h-4 ${isSelected ? dept.color : ""}`} />
                      </div>
                      <span className="flex-1 text-left">{dept.name}</span>
                      <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? "opacity-100" : ""}`} />
                    </button>
                  );
                })}
              </nav>

              {categories.length > 0 && (
                <>
                  <div className="h-px bg-border my-4" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
                    Categorías en {currentDepartment.name}
                  </p>
                  <nav className="space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSearchQuery(category)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                      >
                        <FolderOpen className="w-4 h-4" />
                        <span className="flex-1 text-left truncate">{category}</span>
                        <Badge variant="secondary" className="text-xs">
                          {parts.filter(p => p.category === category).length}
                        </Badge>
                      </button>
                    ))}
                  </nav>
                </>
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Contenido Principal */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header con breadcrumb y acciones */}
          <header className="p-6 border-b border-border bg-card/30">
            <div className="flex items-center justify-between mb-6">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">Todos los artículos</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-foreground">{currentDepartment.name}</span>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setAddItemOpen(true)}
                  className="gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25"
                >
                  <Plus className="w-4 h-4" />
                  AGREGAR ARTÍCULO
                </Button>
                <Button variant="outline" className="gap-2">
                  <FolderPlus className="w-4 h-4" />
                  AGREGAR CARPETA
                </Button>
              </div>
            </div>

            {/* Barra de búsqueda y controles */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={`Buscar en ${currentDepartment.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/50"
                />
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground">Actualizado en ↓</span>
                <div className="flex border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Estadísticas */}
          <div className="px-6 py-4 border-b border-border bg-card/20">
            <div className="flex items-center gap-8 text-sm">
              <div>
                <span className="text-muted-foreground">Carpetas: </span>
                <span className="font-semibold text-foreground">{categories.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Elementos: </span>
                <span className="font-semibold text-foreground">{totalItems}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Cantidad total: </span>
                <span className="font-semibold text-foreground">{totalUnits.toLocaleString()} unidades</span>
              </div>
              <div>
                <span className="text-muted-foreground">Valor total: </span>
                <span className="font-semibold text-primary">USD {totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Grid de productos */}
          <ScrollArea className="flex-1 p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse bg-card/50">
                    <CardContent className="p-0">
                      <div className="h-40 bg-muted rounded-t-lg" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredParts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Sin artículos</h3>
                <p className="text-muted-foreground mb-4">
                  No hay artículos en {currentDepartment.name}. Agrega el primero.
                </p>
                <Button onClick={() => setAddItemOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Agregar Artículo
                </Button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedDepartment}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={viewMode === "grid" 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "space-y-3"
                  }
                >
                  {filteredParts.map((part, index) => (
                    <ProductCard 
                      key={part.id} 
                      part={part} 
                      viewMode={viewMode}
                      department={currentDepartment}
                      index={index}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Paginación */}
            {filteredParts.length > 0 && (
              <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-border">
                <span className="text-sm text-muted-foreground">Espectáculo:</span>
                <Select defaultValue="20">
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">por página</span>
              </div>
            )}
          </ScrollArea>
        </main>
      </div>

      {/* Dialog para agregar artículo */}
      <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${currentDepartment.bgColor}`}>
                <currentDepartment.icon className={`w-5 h-5 ${currentDepartment.color}`} />
              </div>
              Agregar Artículo - {currentDepartment.name}
            </DialogTitle>
            <DialogDescription>
              Registrar un nuevo artículo en el inventario de {currentDepartment.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={newItem.sku}
                  onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                  placeholder="ej: HVAC-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Input
                  id="category"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  placeholder="ej: Herramientas"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre / Descripción *</Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="ej: Cortadora de césped John Deere - 60 pulgadas"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Inicial</Label>
                <Input
                  id="stock"
                  type="number"
                  value={newItem.stock}
                  onChange={(e) => setNewItem({ ...newItem, stock: Number(e.target.value) })}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_cost">Costo (USD)</Label>
                <Input
                  id="unit_cost"
                  type="number"
                  value={newItem.unit_cost}
                  onChange={(e) => setNewItem({ ...newItem, unit_cost: Number(e.target.value) })}
                  min={0}
                  step={0.01}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale_price">Precio Venta (USD)</Label>
                <Input
                  id="sale_price"
                  type="number"
                  value={newItem.sale_price}
                  onChange={(e) => setNewItem({ ...newItem, sale_price: Number(e.target.value) })}
                  min={0}
                  step={0.01}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rotación</Label>
              <Select
                value={newItem.rotation}
                onValueChange={(value: "high" | "medium" | "low") => setNewItem({ ...newItem, rotation: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rotación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Alta rotación</SelectItem>
                  <SelectItem value="medium">Media rotación</SelectItem>
                  <SelectItem value="low">Baja rotación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateItem}
              disabled={createPartMutation.isPending}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              {createPartMutation.isPending ? "Guardando..." : "Agregar Artículo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

// Componente de tarjeta de producto
interface ProductCardProps {
  part: DbPart;
  viewMode: "grid" | "list";
  department: Department;
  index: number;
}

const ProductCard = ({ part, viewMode, department, index }: ProductCardProps) => {
  const isNew = new Date(part.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: index * 0.02 }}
      >
        <Card className="bg-card/50 hover:bg-card transition-all duration-200 border-border/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`w-16 h-16 rounded-lg ${department.bgColor} flex items-center justify-center`}>
              <department.icon className={`w-8 h-8 ${department.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {isNew && (
                  <Badge className="bg-red-500 text-white text-xs">NUEVO</Badge>
                )}
                <h3 className="font-semibold text-foreground truncate">{part.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground font-mono">{part.sku}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">{part.stock} unidades</p>
              <p className="text-sm text-primary font-semibold">USD {part.sale_price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">{part.category}</Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
    >
      <Card className="bg-card/50 hover:bg-card hover:shadow-elevated transition-all duration-300 border-border/50 overflow-hidden group cursor-pointer">
        <CardContent className="p-0">
          {/* Imagen/Placeholder */}
          <div className={`h-40 ${department.bgColor} flex items-center justify-center relative overflow-hidden`}>
            <department.icon className={`w-16 h-16 ${department.color} opacity-50 group-hover:scale-110 transition-transform duration-300`} />
            
            {/* Badge de nuevo */}
            {isNew && (
              <Badge className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold">
                NUEVO
              </Badge>
            )}

            {/* Acciones hover */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button className="p-2 bg-background/90 rounded-lg hover:bg-background transition-colors">
                <Package className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-4">
            <h3 className="font-semibold text-foreground leading-tight mb-1 line-clamp-2">
              {part.name}
            </h3>
            <p className="text-xs text-muted-foreground font-mono mb-3">{part.sku}</p>

            {/* Info */}
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-muted-foreground">{part.stock} unidad{part.stock !== 1 ? "es" : ""}</span>
              <span className="font-bold text-primary">USD {part.sale_price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs bg-muted/50">
                <Tag className="w-3 h-3 mr-1" />
                {part.category}
              </Badge>
              {part.rotation === "high" && (
                <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">
                  Alta rotación
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ItemCatalog;
