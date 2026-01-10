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

export interface OrderItem {
  partId: number;
  quantityRequired: number;
  quantityFulfilled: number;
}

export interface Order {
  id: number;
  or_number: string; // Order Reference Number
  technician: string;
  status: "open" | "closed";
  items: OrderItem[];
}

interface WarehouseContextType {
  inventory: Part[];
  orders: Order[];
  addStock: (partId: number, quantity: number) => void;
  deductStock: (partId: number, quantity: number) => void;
  fulfillOrderPart: (orderId: number, partId: number, quantity: number) => void;
  createPart: (part: Omit<Part, "id">) => void;
  findOrder: (orNumber: string) => Order | undefined;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

const initialInventory: Part[] = [
  { id: 1, sku: "ELEC-001", name: "Monitor LED 24\"", category: "Electronics", stock: 45, unitCost: 180, salePrice: 299, rotation: "high", daysInWarehouse: 12 },
  { id: 2, sku: "TOOL-015", name: "Industrial Drill", category: "Tools", stock: 23, unitCost: 95, salePrice: 159, rotation: "medium", daysInWarehouse: 35 },
  { id: 3, sku: "MAT-089", name: "Electric Cable 100m", category: "Materials", stock: 150, unitCost: 45, salePrice: 79, rotation: "high", daysInWarehouse: 8 },
  { id: 4, sku: "EQUI-022", name: "Air Compressor", category: "Equipment", stock: 0, unitCost: 450, salePrice: 699, rotation: "low", daysInWarehouse: 78 }, // Example of 0 stock
  { id: 5, sku: "ELEC-045", name: "Mechanical Keyboard", category: "Electronics", stock: 67, unitCost: 55, salePrice: 89, rotation: "high", daysInWarehouse: 5 },
  { id: 6, sku: "TOOL-089", name: "Circular Saw", category: "Tools", stock: 1, unitCost: 220, salePrice: 349, rotation: "medium", daysInWarehouse: 42 }, // Low stock example
];

const initialOrders: Order[] = [
  {
    id: 101,
    or_number: "OR-2024-001",
    technician: "Juan Perez",
    status: "open",
    items: [
      { partId: 1, quantityRequired: 2, quantityFulfilled: 0 },
      { partId: 4, quantityRequired: 1, quantityFulfilled: 0 }, // Requires the out-of-stock item
    ],
  },
  {
    id: 102,
    or_number: "OR-2024-002",
    technician: "Maria Garcia",
    status: "open",
    items: [
      { partId: 3, quantityRequired: 5, quantityFulfilled: 0 },
    ],
  },
];

export const WarehouseProvider = ({ children }: { children: ReactNode }) => {
  const [inventory, setInventory] = useState<Part[]>(initialInventory);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

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

  const fulfillOrderPart = (orderId: number, partId: number, quantity: number) => {
    // 1. Deduct from Inventory
    deductStock(partId, quantity);

    // 2. Update Order
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

  return (
    <WarehouseContext.Provider value={{ inventory, orders, addStock, deductStock, fulfillOrderPart, createPart, findOrder }}>
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
