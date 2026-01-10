import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CheckCircle, Plus, History, Printer, Package, FileDown, Trash2, AlertTriangle, X } from "lucide-react";
import { useWarehouse } from "@/context/WarehouseContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { generateOrderPdf } from "@/utils/generateOrderPdf";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Sales = () => {
  const { orders, inventory, addItemToOrder, removeItemFromOrder, projects, stockAlerts, resolveStockAlert } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrNumber, setSelectedOrNumber] = useState("");
  const [searchError, setSearchError] = useState("");

  // Add item form state
  const [selectedPartId, setSelectedPartId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  const currentOrder = orders.find(o => o.or_number.toLowerCase() === selectedOrNumber.toLowerCase()) || null;
  
  // Filter unresolved alerts
  const unresolvedAlerts = stockAlerts.filter(a => !a.resolved);

  const handleSearch = () => {
    const orderExists = orders.some(o => o.or_number.toLowerCase() === searchQuery.trim().toLowerCase());
    if (orderExists) {
      setSelectedOrNumber(searchQuery.trim());
      setSearchError("");
    } else {
      setSelectedOrNumber("");
      setSearchError("Orden de Trabajo no encontrada.");
    }
  };

  const getPartInfo = (partId: number) => {
    const part = inventory.find((p) => p.id === partId);
    if (!part) return { stock: 0, partName: "Unknown", sku: "N/A" };
    return {
      stock: part.stock,
      partName: part.name,
      sku: part.sku
    };
  };

  const getProjectName = (id: number) => {
    const p = projects.find(proj => proj.id === id);
    return p ? p.name : "Proyecto Desconocido";
  };

  const handleAddItem = () => {
    if (!currentOrder) return;
    if (!selectedPartId) {
      toast.error("Seleccione un item");
      return;
    }
    if (quantity <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    const part = inventory.find(p => p.id === parseInt(selectedPartId));
    if (!part) {
      toast.error("Item no encontrado");
      return;
    }

    if (part.stock < quantity) {
      toast.error(`Stock insuficiente. Disponible: ${part.stock}`);
      return;
    }

    const success = addItemToOrder(currentOrder.id, parseInt(selectedPartId), quantity, "Almacén User");

    if (success) {
      toast.success(`${quantity}x ${part.name} agregado a la orden`);
      setSelectedPartId("");
      setQuantity(1);
    } else {
      toast.error("Error al agregar item. Verifique el stock.");
    }
  };

  const handleRemoveItem = (partId: number, currentQty: number) => {
    if (!currentOrder) return;
    
    const part = inventory.find(p => p.id === partId);
    const success = removeItemFromOrder(currentOrder.id, partId, currentQty, "Almacén User");
    
    if (success) {
      toast.success(`${part?.name || "Item"} eliminado de la orden (stock devuelto)`);
    } else {
      toast.error("Error al eliminar item");
    }
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Gestión de Almacén"
        subtitle="Buscar Órdenes de Trabajo y agregar herramientas"
      />

      <div className="grid gap-6">
        {/* Stock Alerts Section */}
        {unresolvedAlerts.length > 0 && (
          <DashboardCard 
            title={
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                Alertas de Stock ({unresolvedAlerts.length})
              </div>
            }
            className="border-amber-500/50 bg-amber-500/5"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Los siguientes items fueron solicitados por técnicos pero no hay stock disponible.
            </p>
            <div className="space-y-2">
              {unresolvedAlerts.map(alert => (
                <div 
                  key={alert.id} 
                  className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {alert.partName} <span className="text-muted-foreground font-mono text-xs">({alert.sku})</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Solicitado: {alert.requestedQuantity} unidades | O.T.: {alert.orNumber} | Técnico: {alert.technician}
                    </p>
                    <p className="text-xs text-muted-foreground">{alert.createdAt}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => resolveStockAlert(alert.id)}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/20"
                  >
                    <X className="w-4 h-4 mr-1" /> Marcar Resuelta
                  </Button>
                </div>
              ))}
            </div>
          </DashboardCard>
        )}

        {/* Search Section */}
        <DashboardCard title="Buscar Orden de Trabajo" className="w-full">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Ingrese número de O.T. (ej: OR-2024-001)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>Buscar O.T.</Button>
          </div>
          {searchError && <p className="text-destructive mt-2">{searchError}</p>}
        </DashboardCard>

        {/* Order Details */}
        {currentOrder && (
          <>
            <DashboardCard
              title={`Orden de Trabajo: ${currentOrder.or_number}`}
              action={
                <Link to={`/print-order/${currentOrder.or_number}`} target="_blank">
                  <Button variant="outline" size="sm">
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir Remisión
                  </Button>
                </Link>
              }
            >
              <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Técnico</p>
                  <p className="font-medium text-foreground">{currentOrder.technician}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Departamento</p>
                  <p className="font-medium text-foreground">{currentOrder.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Proveedor</p>
                  <p className="font-medium text-foreground">{currentOrder.supplierName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Proyecto</p>
                  <p className="font-medium text-foreground">{getProjectName(currentOrder.projectId)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <span className="font-medium text-foreground uppercase px-2 py-1 bg-secondary rounded text-xs">{currentOrder.status}</span>
                </div>
              </div>
            </DashboardCard>

            {/* Add Items Section */}
            <DashboardCard title="Agregar Herramientas a la Orden">
              <p className="text-sm text-muted-foreground mb-4">
                Seleccione las herramientas que el técnico solicita. Solo se pueden agregar items con stock disponible.
              </p>
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Seleccionar Herramienta</Label>
                  <Select value={selectedPartId} onValueChange={setSelectedPartId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Buscar herramienta..." />
                    </SelectTrigger>
                    <SelectContent>
                      {inventory.map(part => (
                        <SelectItem key={part.id} value={part.id.toString()} disabled={part.stock === 0}>
                          {part.name} - Stock: {part.stock} {part.stock === 0 && "(Sin stock)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-24 space-y-2">
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  />
                </div>

                <Button onClick={handleAddItem} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" /> Agregar a Orden
                </Button>
              </div>
            </DashboardCard>

            {/* Items in Order */}
            <DashboardCard 
              title="Items Entregados"
              action={
                currentOrder.items.length > 0 ? (
                  <Button 
                    onClick={() => generateOrderPdf({ order: currentOrder, inventory, projects })}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Descargar Orden de Salida PDF
                  </Button>
                ) : null
              }
            >
              {currentOrder.items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No hay items registrados en esta orden.</p>
                  <p className="text-sm mt-1">Agregue las herramientas que el técnico solicita.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 gap-4 p-4 bg-secondary/50 font-medium text-sm">
                    <div className="col-span-4">Item</div>
                    <div className="col-span-2">SKU</div>
                    <div className="col-span-2 text-center">Cantidad</div>
                    <div className="col-span-2 text-center">Estado</div>
                    <div className="col-span-2 text-center">Acciones</div>
                  </div>

                  <div className="divide-y">
                    {currentOrder.items.map((item) => {
                      const { partName, sku } = getPartInfo(item.partId);
                      return (
                        <div key={item.partId} className="grid grid-cols-12 gap-4 p-4 items-center text-sm">
                          <div className="col-span-4">
                            <p className="font-medium">{partName}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground font-mono">{sku}</p>
                          </div>
                          <div className="col-span-2 text-center font-medium">
                            {item.quantityFulfilled}
                          </div>
                          <div className="col-span-2 flex justify-center">
                            <div className="flex items-center gap-2 text-green-500 font-medium">
                              <CheckCircle className="w-4 h-4" /> Entregado
                            </div>
                          </div>
                          <div className="col-span-2 flex justify-center">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar herramienta?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción eliminará <strong>{item.quantityFulfilled}x {partName}</strong> de la orden.
                                    El stock será devuelto al inventario y quedará registrado en el historial y en el PDF con cantidad negativa.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleRemoveItem(item.partId, item.quantityFulfilled)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </DashboardCard>

            {/* Fulfillment History Logs */}
            {currentOrder.fulfillmentLogs.length > 0 && (
              <DashboardCard title="Historial de Movimientos">
                <div className="rounded-md border bg-muted/20">
                  <div className="grid grid-cols-12 gap-4 p-3 bg-secondary/30 text-xs font-medium uppercase text-muted-foreground">
                    <div className="col-span-4">Item</div>
                    <div className="col-span-2 text-center">Cantidad</div>
                    <div className="col-span-2">Tipo</div>
                    <div className="col-span-2">Usuario</div>
                    <div className="col-span-2 text-right">Fecha/Hora</div>
                  </div>
                  <div className="divide-y">
                    {currentOrder.fulfillmentLogs.map(log => {
                      const part = inventory.find(p => p.id === log.partId);
                      const isRemoval = log.type === "remove" || log.quantity < 0;
                      return (
                        <div 
                          key={log.id} 
                          className={`grid grid-cols-12 gap-4 p-3 text-sm ${isRemoval ? 'bg-destructive/5' : ''}`}
                        >
                          <div className="col-span-4 font-medium">{part?.name || "Item Desconocido"}</div>
                          <div className={`col-span-2 text-center font-mono ${isRemoval ? 'text-destructive font-bold' : 'text-green-600'}`}>
                            {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                          </div>
                          <div className="col-span-2">
                            {isRemoval ? (
                              <span className="text-destructive text-xs font-medium">ELIMINADO</span>
                            ) : (
                              <span className="text-green-600 text-xs font-medium">AGREGADO</span>
                            )}
                          </div>
                          <div className="col-span-2 text-muted-foreground">{log.assignedBy}</div>
                          <div className="col-span-2 text-right text-muted-foreground font-mono text-xs">
                            {log.assignedAt}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </DashboardCard>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Sales;