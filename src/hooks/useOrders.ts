import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DbOrder {
  id: string;
  or_number: string;
  technician: string;
  department: "HVAC" | "ELECTROMECANICO" | "HERRERIA" | "MAQUINARIA PESADA";
  supplier_name: string | null;
  project_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  part_id: string;
  quantity_required: number;
  quantity_fulfilled: number;
}

export interface DbFulfillmentLog {
  id: string;
  order_id: string;
  part_id: string;
  quantity: number;
  operation_type: "add" | "remove";
  assigned_by: string;
  assigned_at: string;
  notes: string | null;
}

export interface OrderWithDetails extends DbOrder {
  items: DbOrderItem[];
  fulfillmentLogs: DbFulfillmentLog[];
  project?: { id: string; name: string };
}

// Fetch all orders with their items and logs
export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from("orders")
        .select(`
          *,
          project:projects(id, name),
          items:order_items(*),
          fulfillmentLogs:fulfillment_logs(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return orders as OrderWithDetails[];
    },
  });
};

// Fetch single order by OR number
export const useOrderByOrNumber = (orNumber: string) => {
  return useQuery({
    queryKey: ["order", orNumber],
    queryFn: async () => {
      if (!orNumber) return null;
      
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          project:projects(id, name),
          items:order_items(*),
          fulfillmentLogs:fulfillment_logs(*)
        `)
        .ilike("or_number", orNumber)
        .maybeSingle();

      if (error) throw error;
      return data as OrderWithDetails | null;
    },
    enabled: !!orNumber,
  });
};

// Create a new order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: {
      technician: string;
      department: DbOrder["department"];
      supplierName: string;
      projectId: string;
      items?: { partId: string; quantity: number }[];
    }) => {
      // Use database trigger for atomic OR number generation by passing empty string
      const { data, error } = await supabase
        .from("orders")
        .insert({
          or_number: "", // Trigger will generate the actual number
          technician: orderData.technician,
          department: orderData.department,
          supplier_name: orderData.supplierName || null,
          project_id: orderData.projectId,
          status: "open",
        })
        .select()
        .single();

      if (error) throw error;

      // Insert items if provided
      if (orderData.items && orderData.items.length > 0) {
        const itemsToInsert = orderData.items.map(item => ({
          order_id: data.id,
          part_id: item.partId,
          quantity_required: item.quantity,
          quantity_fulfilled: 0, // Initially unfulfilled
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      return data as DbOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      toast.error(`Error al crear orden: ${error.message}`);
    },
  });
};

// Add item to order (deduct stock and log)
export const useAddItemToOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      orderId: string;
      partId: string;
      quantity: number;
      assignedBy: string;
    }) => {
      // Use atomic RPC call
      const { error } = await supabase.rpc("add_item_to_order_atomic", {
        p_order_id: data.orderId,
        p_part_id: data.partId,
        p_quantity: data.quantity,
        p_assigned_by: data.assignedBy,
      });

      if (error) throw error;

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });
};

// Remove item from order (return stock and log)
export const useRemoveItemFromOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      orderId: string;
      partId: string;
      quantity: number;
      removedBy: string;
    }) => {
      // Use atomic RPC call
      const { error } = await supabase.rpc("remove_item_from_order_atomic", {
        p_order_id: data.orderId,
        p_part_id: data.partId,
        p_quantity: data.quantity,
        p_removed_by: data.removedBy,
      });

      if (error) throw error;

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });
};
