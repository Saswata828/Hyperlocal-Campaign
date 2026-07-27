import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../services/api";

// --- STORES QUERY & MUTATION HOOKS ---

export function useStores() {
  return useQuery({
    queryKey: ["stores"],
    queryFn: () => apiService.getStores(),
    refetchOnWindowFocus: false,
    staleTime: 5000,
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storeData: any) => apiService.createStore(storeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiService.updateStore(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
}

export function useDeleteStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiService.deleteStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
}

// --- PRODUCTS QUERY & MUTATION HOOKS ---

export function useProducts(params?: { search?: string; category?: string }) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => apiService.getProducts(params),
    refetchOnWindowFocus: false,
    staleTime: 5000,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productData: any) => apiService.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// --- AI CAMPAIGN MUTATION HOOKS ---

export function useGenerateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (campaignParams: any) => apiService.generateCampaign(campaignParams),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
    },
  });
}

// --- DASHBOARD ANALYTICS HOOKS ---

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboardMetrics"],
    queryFn: () => apiService.getDashboardMetrics(),
    refetchOnWindowFocus: false,
    refetchInterval: 10000, // Sync metrics every 10 seconds for real-time refresh support
  });
}
