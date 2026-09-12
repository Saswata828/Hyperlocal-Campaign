import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useProducts } from "./useQueries";
import { apiService } from "../services/api";

// Mock the API service
vi.mock("../services/api", () => ({
  apiService: {
    getProducts: vi.fn(),
  },
}));

describe("useProducts", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should fetch products without params", async () => {
    const mockProducts = [{ id: "1", name: "Product 1" }];
    vi.mocked(apiService.getProducts).mockResolvedValueOnce(mockProducts);

    const { result } = renderHook(() => useProducts(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProducts);
    expect(apiService.getProducts).toHaveBeenCalledWith(undefined);
  });

  it("should fetch products with params", async () => {
    const mockProducts = [{ id: "2", name: "Product 2" }];
    const params = { search: "test", category: "electronics" };
    vi.mocked(apiService.getProducts).mockResolvedValueOnce(mockProducts);

    const { result } = renderHook(() => useProducts(params), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProducts);
    expect(apiService.getProducts).toHaveBeenCalledWith(params);
  });

  it("should handle API errors", async () => {
    const mockError = new Error("API Error");
    vi.mocked(apiService.getProducts).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useProducts(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(mockError);
  });
});
