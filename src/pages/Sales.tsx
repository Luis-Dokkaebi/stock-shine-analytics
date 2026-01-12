import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CheckCircle, Plus, Package, FileDown, Trash2, AlertTriangle, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { useOrders, useAddItemToOrder, useRemoveItemFromOrder, OrderWithDetails } from "@/hooks/useOrders";
import { useParts } from "@/hooks/useParts";
import { useProjects } from "@/hooks/useProjects";
import { useUnresolvedStockAlerts, useResolveStockAlert } from "@/hooks/useStockAlerts";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedPage } from "@/components/layout/AnimatedPage";

const Sales = () => {
  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useOrders();
  const { data: inventory = [], isLoading: partsLoading } = useParts();
  const { data: projects = [] } = useProjects();
  const { data: unresolvedAlerts = [] } = useUnresolvedStockAlerts();
  const addItemMutation = useAddItemToOrder();
  const removeItemMutation = useRemoveItemFromOrder();
  const resolveAlertMutation = useResolveStockAlert();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrNumber, setSelectedOrNumber] = useState("");
  const [searchError, setSearchError] = useState("");

  // Add item form state
  const [selectedPartId, setSelectedPartId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  const currentOrder = orders.find(o => o.or_number.toLowerCase() === selectedOrNumber.toLowerCase()) || null;
  
  // Get pending orders (orders with no items yet - waiting to be processed)
  const pendingOrders = orders.filter(o =>
    o.status === "open" &&
    (!o.items || o.items.length === 0 || o.items.every(i => i.quantity_fulfilled === 0))
  );
  
  // Get orders in progress (orders with some items fulfilled)
  const ordersInProgress = orders.filter(o =>
    o.status === "open" &&
    o.items &&
    o.items.length > 0 &&
    o.items.some(i => i.quantity_fulfilled > 0)
  );

  // Subscribe to realtime updates for orders
  useEffect(() => {
    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          refetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchOrders]);

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

  const getPartInfo = (partId: string) => {
    const part = inventory.find((p) => p.id === partId);
    if (!part) return { stock: 0, partName: "Unknown", sku: "N/A", salePrice: 0 };
    return {
      stock: part.stock,
      partName: part.name,
      sku: part.sku,
      salePrice: part.sale_price
    };
  };

  const getProjectName = (id: string) => {
    const p = projects.find(proj => proj.id === id);
    return p ? p.name : "Proyecto Desconocido";
  };

  const handleAddItem = async () => {
    if (!currentOrder) return;
    if (!selectedPartId) {
      toast.error("Seleccione un item");
      return;
    }
    if (quantity <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }

    const part = inventory.find(p => p.id === selectedPartId);
    if (!part) {
      toast.error("Item no encontrado");
      return;
    }

    if (part.stock < quantity) {
      toast.error(`Stock insuficiente. Disponible: ${part.stock}`);
      return;
    }

    try {
      await addItemMutation.mutateAsync({
        orderId: currentOrder.id,
        partId: selectedPartId,
        quantity,
        assignedBy: "Almacén User",
      });
      toast.success(`${quantity}x ${part.name} agregado a la orden`);
      setSelectedPartId("");
      setQuantity(1);
    } catch (error) {
      toast.error("Error al agregar item. Verifique el stock.");
    }
  };

  const handleRemoveItem = async (partId: string, currentQty: number) => {
    if (!currentOrder) return;
    
    const part = inventory.find(p => p.id === partId);
    
    try {
      await removeItemMutation.mutateAsync({
        orderId: currentOrder.id,
        partId,
        quantity: currentQty,
        removedBy: "Almacén User",
      });
      toast.success(`${part?.name || "Item"} eliminado de la orden (stock devuelto)`);
    } catch (error) {
      toast.error("Error al eliminar item");
    }
  };

  const handleDownloadPdf = () => {
    if (!currentOrder) return;
    
    // Transform data for PDF - map DB field names to expected format
    const pdfOrder = {
      or_number: currentOrder.or_number,
      technician: currentOrder.technician,
      department: currentOrder.department,
      supplierName: currentOrder.supplier_name || "",
      projectId: currentOrder.project_id,
      status: currentOrder.status,
      items: (currentOrder.items || []).map(item => ({
        partId: item.part_id,
        quantityRequired: item.quantity_required,
        quantityFulfilled: item.quantity_fulfilled,
      })),
      fulfillmentLogs: (currentOrder.fulfillmentLogs || []).map(log => ({
        id: log.id,
        partId: log.part_id,
        quantity: log.quantity,
        assignedBy: log.assigned_by,
        assignedAt: new Date(log.assigned_at).toLocaleString(),
        type: log.operation_type as "add" | "remove",
        timestamp: new Date(log.assigned_at).getTime(),
      })),
    };

    const pdfInventory = inventory.map(p => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      salePrice: p.sale_price,
    }));

    const pdfProjects = projects.map(p => ({
      id: p.id,
      name: p.name,
    }));

    generateOrderPdf({ 
      order: pdfOrder as any, 
      inventory: pdfInventory as any, 
      projects: pdfProjects as any 
    });
  };

  const handleFinalizeOrder = async () => {
    if (!currentOrder) return;
    
    const { error } = await supabase
      .from("orders")
      .update({ status: "closed" })
      .eq("id", currentOrder.id);

    if (error) {
      toast.error("Error al finalizar la orden");
      return;
    }

    toast.success("Orden finalizada correctamente");
    handleDownloadPdf();
    refetchOrders();
  };

  const isLoading = ordersLoading || partsLoading;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <AnimatedPage>
        <PageHeader
          title="Gestión de Almacén"
          subtitle="Buscar Órdenes de Trabajo y agregar herramientas"
        />

        <div className="grid gap-6">
        {/* Pending Orders Section - New requests from Zona Técnica */}
        {pendingOrders.length > 0 && (
          <DashboardCard 
            title={
              <div className="flex items-center gap-2 text-primary">
                <Package className="w-5 h-5" />
                Solicitudes Pendientes ({pendingOrders.length})
              </div>
            }
            className="border-primary/50 bg-primary/5"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Estas órdenes fueron creadas en Zona Técnica y están esperando que se carguen las herramientas.
            </p>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {pendingOrders.map(order => (
                <div 
                  key={order.id} 
                  className="p-4 bg-card border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedOrNumber(order.or_number);
                    setSearchError("");
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-primary">{order.or_number}</span>
                    <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-600 rounded">PENDIENTE</span>
                  </div>
                  <p className="text-sm font-medium">{order.technician}</p>
                  <p className="text-xs text-muted-foreground">{order.department}</p>
                  <p className="text-xs text-muted-foreground mt-1">{getProjectName(order.project_id)}</p>
                  {order.supplier_name && (
                    <p className="text-xs text-muted-foreground">Proveedor: {order.supplier_name}</p>
                  )}
                </div>
              ))}
            </div>
          </DashboardCard>
        )}

        {/* Orders in Progress Section */}
        {ordersInProgress.length > 0 && (
          <DashboardCard 
            title={
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                Órdenes en Proceso ({ordersInProgress.length})
              </div>
            }
            className="border-green-500/30 bg-green-500/5"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Estas órdenes ya tienen herramientas cargadas.
            </p>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {ordersInProgress.map(order => (
                <div 
                  key={order.id} 
                  className="p-4 bg-card border rounded-lg hover:border-green-500/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedOrNumber(order.or_number);
                    setSearchError("");
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-green-600">{order.or_number}</span>
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-600 rounded">{order.items?.length || 0} ITEMS</span>
                  </div>
                  <p className="text-sm font-medium">{order.technician}</p>
                  <p className="text-xs text-muted-foreground">{order.department}</p>
                  <p className="text-xs text-muted-foreground mt-1">{getProjectName(order.project_id)}</p>
                </div>
              ))}
            </div>
          </DashboardCard>
        )}

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
                      {alert.part_name} <span className="text-muted-foreground font-mono text-xs">({alert.sku})</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Solicitado: {alert.requested_quantity} unidades | O.T.: {alert.or_number} | Técnico: {alert.technician}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => resolveAlertMutation.mutate(alert.id)}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/20"
                    disabled={resolveAlertMutation.isPending}
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
                placeholder="Ingrese número de O.T. (ej: OR-2026-001)"
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
            <DashboardCard title={`Orden de Trabajo: ${currentOrder.or_number}`}>
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
                  <p className="font-medium text-foreground">{currentOrder.supplier_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Proyecto</p>
                  <p className="font-medium text-foreground">{getProjectName(currentOrder.project_id)}</p>
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
                        <SelectItem key={part.id} value={part.id} disabled={part.stock === 0}>
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

                <Button 
                  onClick={handleAddItem} 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={addItemMutation.isPending}
                >
                  {addItemMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Agregar a Orden
                </Button>
              </div>
            </DashboardCard>

            {/* Items in Order */}
            <DashboardCard 
              title="Items Entregados"
              action={
                currentOrder.items && currentOrder.items.length > 0 ? (
                  <div className="flex gap-2">
                    {currentOrder.status === "open" && (
                      <Button 
                        onClick={handleFinalizeOrder}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Finalizar Carga
                      </Button>
                    )}
                    {currentOrder.status === "completed" && (
                      <Button 
                        onClick={handleDownloadPdf}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <FileDown className="w-4 h-4 mr-2" />
                        Descargar Orden de Salida PDF
                      </Button>
                    )}
                  </div>
                ) : null
              }
            >
              {!currentOrder.items || currentOrder.items.length === 0 ? (
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
                    <div className="col-span-2 text-center">Progreso (E/R)</div>
                    <div className="col-span-2 text-center">Estado</div>
                    <div className="col-span-2 text-center">Acciones</div>
                  </div>

                  <div className="divide-y">
                    {currentOrder.items.map((item) => {
                      const { partName, sku } = getPartInfo(item.part_id);
                      const isFulfilled = item.quantity_fulfilled >= item.quantity_required;
                      const isPartiallyFulfilled = item.quantity_fulfilled > 0 && item.quantity_fulfilled < item.quantity_required;

                      return (
                        <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center text-sm">
                          <div className="col-span-4">
                            <p className="font-medium">{partName}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground font-mono">{sku}</p>
                          </div>
                          <div className="col-span-2 text-center font-medium">
                            <span className={isFulfilled ? "text-green-600" : "text-amber-600"}>
                              {item.quantity_fulfilled}
                            </span>
                            <span className="text-muted-foreground"> / {item.quantity_required}</span>
                          </div>
                          <div className="col-span-2 flex justify-center">
                            {isFulfilled ? (
                              <div className="flex items-center gap-2 text-green-500 font-medium">
                                <CheckCircle className="w-4 h-4" /> Entregado
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-amber-500 font-medium">
                                <AlertTriangle className="w-4 h-4" /> Pendiente
                              </div>
                            )}
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
                                    Esta acción eliminará <strong>{item.quantity_fulfilled}x {partName}</strong> de la orden.
                                    El stock será devuelto al inventario y quedará registrado en el historial y en el PDF con cantidad negativa.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleRemoveItem(item.part_id, item.quantity_fulfilled)}
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
            {currentOrder.fulfillmentLogs && currentOrder.fulfillmentLogs.length > 0 && (
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
                      const part = inventory.find(p => p.id === log.part_id);
                      const isRemoval = log.operation_type === "remove" || log.quantity < 0;
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
                          <div className="col-span-2 text-muted-foreground">{log.assigned_by}</div>
                          <div className="col-span-2 text-right text-muted-foreground font-mono text-xs">
                            {new Date(log.assigned_at).toLocaleString()}
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
      </AnimatedPage>
    </MainLayout>
  );
};

export default Sales;
