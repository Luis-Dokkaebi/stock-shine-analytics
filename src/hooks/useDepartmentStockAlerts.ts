import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbStockAlert {
  id: string;
  part_id: string;
  part_name: string;
  sku: string;
  requested_quantity: number;
  or_number: string;
  technician: string;
  resolved: boolean;
  created_at: string;
  resolved_at: string | null;
  department: string;
}

export const useDepartmentStockAlerts = (department: string) => {
  return useQuery({
    queryKey: ["stockAlerts", department],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_alerts")
        .select("*")
        .eq("department", department)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DbStockAlert[];
    },
  });
};

export const useUnresolvedDepartmentStockAlerts = (department: string) => {
  return useQuery({
    queryKey: ["stockAlerts", department, "unresolved"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_alerts")
        .select("*")
        .eq("department", department)
        .eq("resolved", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DbStockAlert[];
    },
  });
};

export const useCreateDepartmentStockAlert = (department: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alert: {
      partId: string;
      partName: string;
      sku: string;
      requestedQuantity: number;
      orNumber: string;
      technician: string;
    }) => {
      const { error } = await supabase
        .from("stock_alerts")
        .insert({
          part_id: alert.partId,
          part_name: alert.partName,
          sku: alert.sku,
          requested_quantity: alert.requestedQuantity,
          or_number: alert.orNumber,
          technician: alert.technician,
          department,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stockAlerts", department] });
    },
  });
};

export const useResolveDepartmentStockAlert = (department: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("stock_alerts")
        .update({ 
          resolved: true, 
          resolved_at: new Date().toISOString() 
        })
        .eq("id", alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stockAlerts", department] });
    },
  });
};
