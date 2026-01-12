import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DbPart {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  unit_cost: number;
  sale_price: number;
  rotation: "high" | "medium" | "low";
  days_in_warehouse: number;
  department: string;
  created_at: string;
  updated_at: string;
}

export const useDepartmentParts = (department: string) => {
  const queryClient = useQueryClient();

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel(`parts-realtime-${department}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "parts" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["parts", department] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, department]);

  return useQuery({
    queryKey: ["parts", department],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parts")
        .select("*")
        .eq("department", department)
        .order("name");

      if (error) throw error;
      return data as DbPart[];
    },
  });
};

export const useAddDepartmentStock = (department: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ partId, quantity }: { partId: string; quantity: number }) => {
      const { data: part, error: fetchError } = await supabase
        .from("parts")
        .select("stock")
        .eq("id", partId)
        .single();

      if (fetchError) throw fetchError;

      const newStock = (part?.stock || 0) + quantity;

      const { error } = await supabase
        .from("parts")
        .update({ stock: newStock })
        .eq("id", partId);

      if (error) throw error;
      return newStock;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts", department] });
      toast.success("Stock agregado exitosamente");
    },
    onError: (error) => {
      toast.error(`Error al agregar stock: ${error.message}`);
    },
  });
};

export const useCreateDepartmentPart = (department: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (part: Omit<DbPart, "id" | "created_at" | "updated_at" | "department">) => {
      const { data, error } = await supabase
        .from("parts")
        .insert({ ...part, department })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts", department] });
      toast.success("Parte creada exitosamente");
    },
    onError: (error) => {
      toast.error(`Error al crear parte: ${error.message}`);
    },
  });
};
