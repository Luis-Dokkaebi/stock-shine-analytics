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
    }) => {
      // Generate OR number client-side since trigger might not work with typing
      const { data: lastOrder } = await supabase
        .from("orders")
        .select("or_number")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let nextNum = 1;
      if (lastOrder?.or_number) {
        const parts = lastOrder.or_number.split("-");
        const lastNum = parseInt(parts[2], 10);
        if (!isNaN(lastNum)) nextNum = lastNum + 1;
      }
      
      const year = new Date().getFullYear();
      const orNumber = `OR-${year}-${nextNum.toString().padStart(3, "0")}`;

      const { data, error } = await supabase
        .from("orders")
        .insert({
          or_number: orNumber,
          technician: orderData.technician,
          department: orderData.department,
          supplier_name: orderData.supplierName || null,
          project_id: orderData.projectId,
          status: "open",
        })
        .select()
        .single();

      if (error) throw error;
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
      // First, check stock
      const { data: part, error: partError } = await supabase
        .from("parts")
        .select("stock")
        .eq("id", data.partId)
        .single();

      if (partError) throw partError;
      if (part.stock < data.quantity) {
        throw new Error("Stock insuficiente");
      }

      // Deduct stock
      const { error: stockError } = await supabase
        .from("parts")
        .update({ stock: part.stock - data.quantity })
        .eq("id", data.partId);

      if (stockError) throw stockError;

      // Check if item already exists in order
      const { data: existingItem } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", data.orderId)
        .eq("part_id", data.partId)
        .maybeSingle();

      if (existingItem) {
        // Update existing item
        const { error: updateError } = await supabase
          .from("order_items")
          .update({
            quantity_required: existingItem.quantity_required + data.quantity,
            quantity_fulfilled: existingItem.quantity_fulfilled + data.quantity,
          })
          .eq("id", existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Insert new item
        const { error: insertError } = await supabase
          .from("order_items")
          .insert({
            order_id: data.orderId,
            part_id: data.partId,
            quantity_required: data.quantity,
            quantity_fulfilled: data.quantity,
          });

        if (insertError) throw insertError;
      }

      // Add fulfillment log
      const { error: logError } = await supabase
        .from("fulfillment_logs")
        .insert({
          order_id: data.orderId,
          part_id: data.partId,
          quantity: data.quantity,
          operation_type: "add",
          assigned_by: data.assignedBy,
        });

      if (logError) throw logError;

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
      // Return stock
      const { data: part, error: partError } = await supabase
        .from("parts")
        .select("stock")
        .eq("id", data.partId)
        .single();

      if (partError) throw partError;

      const { error: stockError } = await supabase
        .from("parts")
        .update({ stock: part.stock + data.quantity })
        .eq("id", data.partId);

      if (stockError) throw stockError;

      // Update or remove order item
      const { data: existingItem } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", data.orderId)
        .eq("part_id", data.partId)
        .single();

      if (existingItem) {
        const newQty = existingItem.quantity_fulfilled - data.quantity;
        if (newQty <= 0) {
          // Remove item completely
          await supabase
            .from("order_items")
            .delete()
            .eq("id", existingItem.id);
        } else {
          await supabase
            .from("order_items")
            .update({
              quantity_required: newQty,
              quantity_fulfilled: newQty,
            })
            .eq("id", existingItem.id);
        }
      }

      // Add removal log (negative quantity)
      const { error: logError } = await supabase
        .from("fulfillment_logs")
        .insert({
          order_id: data.orderId,
          part_id: data.partId,
          quantity: -data.quantity,
          operation_type: "remove",
          assigned_by: data.removedBy,
        });

      if (logError) throw logError;

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });
};
