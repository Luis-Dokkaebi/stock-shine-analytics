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
  created_at: string;
  updated_at: string;
}

export const useParts = () => {
  const queryClient = useQueryClient();

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("parts-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "parts" },
        () => {
          // Invalidate and refetch parts when any change occurs
          queryClient.invalidateQueries({ queryKey: ["parts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["parts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parts")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as DbPart[];
    },
  });
};

export const useUpdatePartStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ partId, newStock }: { partId: string; newStock: number }) => {
      const { error } = await supabase
        .from("parts")
        .update({ stock: newStock })
        .eq("id", partId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
    },
  });
};

export const useCreatePart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (part: Omit<DbPart, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("parts")
        .insert(part)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
      toast.success("Parte creada exitosamente");
    },
    onError: (error) => {
      toast.error(`Error al crear parte: ${error.message}`);
    },
  });
};
