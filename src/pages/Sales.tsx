import { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle, AlertCircle, ShoppingCart, Truck } from "lucide-react";
import { useWarehouse, Order } from "@/context/WarehouseContext";
import { toast } from "sonner";
import { animate } from "animejs";

const Sales = () => {
  const { findOrder, inventory, fulfillOrderPart } = useWarehouse();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [searchError, setSearchError] = useState("");

  const handleSearch = () => {
    const order = findOrder(searchQuery);
    if (order) {
      setCurrentOrder(order);
      setSearchError("");
    } else {
      setCurrentOrder(null);
      setSearchError("Order Reference (O.R.) not found.");
    }
  };

  const getPartStatus = (partId: number) => {
    const part = inventory.find((p) => p.id === partId);
    if (!part) return { stock: 0, status: "unknown", partName: "Unknown" };
    return {
      stock: part.stock,
      status: part.stock > 0 ? "green" : "red",
      partName: part.name,
      sku: part.sku
    };
  };

  const handleRequisition = (partId: number, requiredQty: number, rowId: string) => {
    if (!currentOrder) return;

    // Use the new atomic function
    fulfillOrderPart(currentOrder.id, partId, requiredQty);

    // Anime.JS Animation
    const element = document.getElementById(rowId);
    if (element) {
      animate(element, {
        translateX: [0, 100],
        opacity: [1, 0],
        duration: 800,
        easing: 'inOutQuad',
        onComplete: () => {
           toast.success("Part requisitioned successfully!");
           // Reset transform for React re-renders (optional, depending on list management)
           element.style.transform = 'none';
           element.style.opacity = '1';
        }
      });
    }
  };

  const handleOrderFromPlant = (partName: string) => {
    toast.info(`Order generated for plant: ${partName}`);
    // In a real app, this would trigger an API call or status change
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Gestión de Ventas (Warehouse Management)"
        subtitle="Manage Orders, Check Stock, and Requisition Parts"
      />

      <div className="grid gap-6">
        {/* Search Section */}
        <DashboardCard title="Search Order" className="w-full">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Enter O.R. Number (e.g., OR-2024-001)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>Search O.R.</Button>
          </div>
          {searchError && <p className="text-destructive mt-2">{searchError}</p>}
        </DashboardCard>

        {/* Order Details */}
        {currentOrder && (
          <DashboardCard title={`Order Details: ${currentOrder.or_number}`}>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Technician: <span className="font-medium text-foreground">{currentOrder.technician}</span></p>
              <p className="text-sm text-muted-foreground">Status: <span className="font-medium text-foreground uppercase">{currentOrder.status}</span></p>
            </div>

            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-4 bg-secondary/50 font-medium text-sm">
                <div className="col-span-4">Part</div>
                <div className="col-span-2 text-center">Required</div>
                <div className="col-span-2 text-center">In Stock (Ex.dis)</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-2 text-right">Action</div>
              </div>

              <div className="divide-y">
                {currentOrder.items.map((item, index) => {
                  const { stock, status, partName, sku } = getPartStatus(item.partId);
                  const rowId = `row-${currentOrder.id}-${item.partId}`;
                  const remainingNeeded = item.quantityRequired - item.quantityFulfilled;
                  const isCompleted = remainingNeeded <= 0;
                  const isAvailable = stock >= remainingNeeded;

                  return (
                    <div key={item.partId} id={rowId} className="grid grid-cols-12 gap-4 p-4 items-center text-sm">
                      <div className="col-span-4">
                        <p className="font-medium">{partName}</p>
                        <p className="text-xs text-muted-foreground">{sku}</p>
                      </div>
                      <div className="col-span-2 text-center">
                        {item.quantityRequired}
                        {isCompleted && <span className="text-green-600 ml-1">(Done)</span>}
                      </div>
                      <div className="col-span-2 text-center font-mono">{stock}</div>
                      <div className="col-span-2 flex justify-center">
                         {isCompleted ? (
                          <span className="text-muted-foreground font-medium">Fulfilled</span>
                        ) : isAvailable ? (
                          <div className="flex items-center gap-2 text-green-500 font-medium">
                            <CheckCircle className="w-4 h-4" /> Available
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-500 font-medium">
                            <AlertCircle className="w-4 h-4" /> Missing
                          </div>
                        )}
                      </div>
                      <div className="col-span-2 text-right">
                        {isCompleted ? (
                           <Button size="sm" variant="outline" className="w-full" disabled>
                             Completed
                           </Button>
                        ) : isAvailable ? (
                          <Button
                            size="sm"
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => handleRequisition(item.partId, remainingNeeded, rowId)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" /> Requisition
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="w-full"
                            onClick={() => handleOrderFromPlant(partName)}
                          >
                            <Truck className="w-4 h-4 mr-2" /> Order Plant
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </DashboardCard>
        )}
      </div>
    </MainLayout>
  );
};

export default Sales;
