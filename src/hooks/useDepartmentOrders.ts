import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DbOrder {
  id: string;
  or_number: string;
  technician: string;
  department: string;
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
  department: string;
}

export interface OrderWithDetails extends DbOrder {
  items: DbOrderItem[];
  fulfillmentLogs: DbFulfillmentLog[];
  project?: { id: string; name: string };
}

// Fetch orders by department
export const useDepartmentOrders = (department: string) => {
  return useQuery({
    queryKey: ["orders", department],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from("orders")
        .select(`
          *,
          project:projects(id, name),
          items:order_items(*),
          fulfillmentLogs:fulfillment_logs(*)
        `)
        .eq("department", department)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return orders as OrderWithDetails[];
    },
  });
};

// Add item to order with department tracking
export const useAddDepartmentItemToOrder = (department: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      orderId: string;
      partId: string;
      quantity: number;
      assignedBy: string;
    }) => {
      // Get current part stock (from specific department)
      const { data: part, error: partError } = await supabase
        .from("parts")
        .select("stock")
        .eq("id", data.partId)
        .eq("department", department)
        .single();

      if (partError) throw partError;
      if (part.stock < data.quantity) {
        throw new Error("Stock insuficiente");
      }

      // Deduct from stock
      const { error: stockError } = await supabase
        .from("parts")
        .update({ stock: part.stock - data.quantity })
        .eq("id", data.partId);

      if (stockError) throw stockError;

      // Update or insert order item
      const { data: existingItem } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", data.orderId)
        .eq("part_id", data.partId)
        .maybeSingle();

      if (existingItem) {
        const { error: updateError } = await supabase
          .from("order_items")
          .update({ 
            quantity_fulfilled: existingItem.quantity_fulfilled + data.quantity 
          })
          .eq("id", existingItem.id);

        if (updateError) throw updateError;
      } else {
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

      // Log the fulfillment with department
      const { error: logError } = await supabase
        .from("fulfillment_logs")
        .insert({
          order_id: data.orderId,
          part_id: data.partId,
          quantity: data.quantity,
          operation_type: "add",
          assigned_by: data.assignedBy,
          department,
        });

      if (logError) throw logError;

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", department] });
      queryClient.invalidateQueries({ queryKey: ["parts", department] });
    },
    onError: (error) => {
      toast.error(`Error al agregar item: ${error.message}`);
    },
  });
};
