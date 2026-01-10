import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Part {
  id: number;
  sku: string;
  name: string;
  category: string;
  stock: number;
  unitCost: number;
  salePrice: number;
  rotation: "high" | "medium" | "low";
  daysInWarehouse: number;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
}

export interface FulfillmentLog {
  id: string;
  partId: number;
  quantity: number; // Can be negative for removals
  assignedBy: string;
  assignedAt: string; // ISO Date string
  timestamp: number;
  type: "add" | "remove"; // Track type of operation
}

export interface OrderItem {
  partId: number;
  quantityRequired: number;
  quantityFulfilled: number;
}

export interface Order {
  id: number;
  or_number: string; // Order Reference Number
  technician: string;
  department: "HVAC" | "ELECTROMECANICO" | "HERRERIA" | "MAQUINARIA PESADA";
  supplierName: string;
  projectId: number;
  status: "open" | "closed";
  items: OrderItem[];
  fulfillmentLogs: FulfillmentLog[];
}

// New: Track stock alerts for out-of-stock requests
export interface StockAlert {
  id: string;
  partId: number;
  partName: string;
  sku: string;
  requestedQuantity: number;
  orNumber: string;
  technician: string;
  createdAt: string;
  resolved: boolean;
}

interface WarehouseContextType {
  inventory: Part[];
  orders: Order[];
  projects: Project[];
  stockAlerts: StockAlert[];
  addStock: (partId: number, quantity: number) => void;
  deductStock: (partId: number, quantity: number) => void;
  fulfillOrderPart: (orderId: number, partId: number, quantity: number, assignedBy?: string) => void;
  createPart: (part: Omit<Part, "id">) => void;
  findOrder: (orNumber: string) => Order | undefined;
  createOrder: (technician: string, projectId: number, department: Order["department"], supplierName: string) => string;
  addItemToOrder: (orderId: number, partId: number, quantity: number, assignedBy?: string) => boolean;
  removeItemFromOrder: (orderId: number, partId: number, quantity: number, removedBy?: string) => boolean;
  addStockAlert: (alert: Omit<StockAlert, "id" | "createdAt" | "resolved">) => void;
  resolveStockAlert: (alertId: string) => void;
  clearResolvedAlerts: () => void;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

const initialInventory: Part[] = [
  { id: 1, sku: "ELEC-001", name: "Monitor LED 24\"", category: "Electronics", stock: 45, unitCost: 180, salePrice: 299, rotation: "high", daysInWarehouse: 12 },
  { id: 2, sku: "TOOL-015", name: "Industrial Drill", category: "Tools", stock: 23, unitCost: 95, salePrice: 159, rotation: "medium", daysInWarehouse: 35 },
  { id: 3, sku: "MAT-089", name: "Electric Cable 100m", category: "Materials", stock: 150, unitCost: 45, salePrice: 79, rotation: "high", daysInWarehouse: 8 },
  { id: 4, sku: "EQUI-022", name: "Air Compressor", category: "Equipment", stock: 0, unitCost: 450, salePrice: 699, rotation: "low", daysInWarehouse: 78 },
  { id: 5, sku: "ELEC-045", name: "Mechanical Keyboard", category: "Electronics", stock: 67, unitCost: 55, salePrice: 89, rotation: "high", daysInWarehouse: 5 },
  { id: 6, sku: "TOOL-089", name: "Circular Saw", category: "Tools", stock: 1, unitCost: 220, salePrice: 349, rotation: "medium", daysInWarehouse: 42 },
];

const initialProjects: Project[] = [
  { id: 1, name: "Alpha Tower Maintenance" },
  { id: 2, name: "Beta Complex Wiring" },
  { id: 3, name: "Gamma Station Upgrade" },
];

const initialOrders: Order[] = [
  {
    id: 101,
    or_number: "OR-2024-001",
    technician: "Juan Perez",
    department: "HVAC",
    supplierName: "Proveedor ABC",
    projectId: 1,
    status: "open",
    items: [
      { partId: 1, quantityRequired: 2, quantityFulfilled: 0 },
      { partId: 4, quantityRequired: 1, quantityFulfilled: 0 },
    ],
    fulfillmentLogs: [],
  },
  {
    id: 102,
    or_number: "OR-2024-002",
    technician: "Maria Garcia",
    department: "ELECTROMECANICO",
    supplierName: "Proveedor XYZ",
    projectId: 2,
    status: "open",
    items: [
      { partId: 3, quantityRequired: 5, quantityFulfilled: 0 },
    ],
    fulfillmentLogs: [],
  },
];

export const WarehouseProvider = ({ children }: { children: ReactNode }) => {
  const [inventory, setInventory] = useState<Part[]>(initialInventory);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [projects] = useState<Project[]>(initialProjects);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);

  const addStock = (partId: number, quantity: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === partId ? { ...item, stock: item.stock + quantity } : item
      )
    );
  };

  const deductStock = (partId: number, quantity: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === partId ? { ...item, stock: Math.max(0, item.stock - quantity) } : item
      )
    );
  };

  const fulfillOrderPart = (orderId: number, partId: number, quantity: number, assignedBy: string = "Almacén User") => {
    // 1. Deduct from Inventory
    deductStock(partId, quantity);

    // 2. Update Order and Add Log
    const now = new Date();
    const newLog: FulfillmentLog = {
      id: crypto.randomUUID(),
      partId,
      quantity,
      assignedBy,
      assignedAt: now.toLocaleString(),
      timestamp: now.getTime(),
      type: "add",
    };

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== orderId) return order;

        return {
          ...order,
          items: order.items.map((item) =>
            item.partId === partId
              ? { ...item, quantityFulfilled: item.quantityFulfilled + quantity }
              : item
          ),
          fulfillmentLogs: [...order.fulfillmentLogs, newLog],
        };
      })
    );
  };

  const createPart = (part: Omit<Part, "id">) => {
    const newId = Math.max(...inventory.map((i) => i.id)) + 1;
    setInventory((prev) => [...prev, { ...part, id: newId }]);
  };

  const findOrder = (orNumber: string) => {
    return orders.find((o) => o.or_number.toLowerCase() === orNumber.toLowerCase());
  };

  const createOrder = (technician: string, projectId: number, department: Order["department"], supplierName: string) => {
    const lastOrder = orders[orders.length - 1];
    let nextNum = 1;
    if (lastOrder) {
      const parts = lastOrder.or_number.split("-");
      const lastNum = parseInt(parts[2], 10);
      if (!isNaN(lastNum)) nextNum = lastNum + 1;
    }

    const year = new Date().getFullYear();
    const orNumber = `OR-${year}-${nextNum.toString().padStart(3, "0")}`;

    const newOrder: Order = {
      id: Math.floor(Math.random() * 100000) + 1000,
      or_number: orNumber,
      technician,
      department,
      supplierName,
      projectId,
      status: "open",
      items: [], // Items are NOT saved here - only added via Sales
      fulfillmentLogs: []
    };

    setOrders(prev => [...prev, newOrder]);
    return orNumber;
  };

  const addItemToOrder = (orderId: number, partId: number, quantity: number, assignedBy: string = "Almacén User") => {
    const part = inventory.find(p => p.id === partId);
    if (!part || part.stock < quantity) {
      return false; // Not enough stock
    }

    // Deduct from inventory
    deductStock(partId, quantity);

    // Add item to order and log
    const now = new Date();
    const newLog: FulfillmentLog = {
      id: crypto.randomUUID(),
      partId,
      quantity,
      assignedBy,
      assignedAt: now.toLocaleString(),
      timestamp: now.getTime(),
      type: "add",
    };

    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id !== orderId) return order;

        const existingItem = order.items.find(item => item.partId === partId);
        let updatedItems;
        if (existingItem) {
          updatedItems = order.items.map(item =>
            item.partId === partId
              ? { ...item, quantityRequired: item.quantityRequired + quantity, quantityFulfilled: item.quantityFulfilled + quantity }
              : item
          );
        } else {
          updatedItems = [...order.items, { partId, quantityRequired: quantity, quantityFulfilled: quantity }];
        }

        return {
          ...order,
          items: updatedItems,
          fulfillmentLogs: [...order.fulfillmentLogs, newLog],
        };
      })
    );

    return true;
  };

  const removeItemFromOrder = (orderId: number, partId: number, quantity: number, removedBy: string = "Almacén User") => {
    // Return stock to inventory
    addStock(partId, quantity);

    // Add negative log and update items
    const now = new Date();
    const newLog: FulfillmentLog = {
      id: crypto.randomUUID(),
      partId,
      quantity: -quantity, // Negative quantity for removal
      assignedBy: removedBy,
      assignedAt: now.toLocaleString(),
      timestamp: now.getTime(),
      type: "remove",
    };

    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id !== orderId) return order;

        const updatedItems = order.items.map(item =>
          item.partId === partId
            ? { 
                ...item, 
                quantityRequired: Math.max(0, item.quantityRequired - quantity), 
                quantityFulfilled: Math.max(0, item.quantityFulfilled - quantity) 
              }
            : item
        ).filter(item => item.quantityFulfilled > 0); // Remove items with 0 quantity

        return {
          ...order,
          items: updatedItems,
          fulfillmentLogs: [...order.fulfillmentLogs, newLog],
        };
      })
    );

    return true;
  };

  const addStockAlert = (alert: Omit<StockAlert, "id" | "createdAt" | "resolved">) => {
    const newAlert: StockAlert = {
      ...alert,
      id: crypto.randomUUID(),
      createdAt: new Date().toLocaleString(),
      resolved: false,
    };
    setStockAlerts(prev => [...prev, newAlert]);
  };

  const resolveStockAlert = (alertId: string) => {
    setStockAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const clearResolvedAlerts = () => {
    setStockAlerts(prev => prev.filter(alert => !alert.resolved));
  };

  return (
    <WarehouseContext.Provider value={{ 
      inventory, 
      orders, 
      projects, 
      stockAlerts,
      addStock, 
      deductStock, 
      fulfillOrderPart, 
      createPart, 
      findOrder, 
      createOrder, 
      addItemToOrder,
      removeItemFromOrder,
      addStockAlert,
      resolveStockAlert,
      clearResolvedAlerts
    }}>
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error("useWarehouse must be used within a WarehouseProvider");
  }
  return context;
};
