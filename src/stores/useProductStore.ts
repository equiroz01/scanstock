import { create } from 'zustand';
import type { Product, CreateProductInput, UpdateProductInput } from '@/types/product';
import { ProductRepository } from '@/database/repositories/ProductRepository';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;

  loadProducts: () => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  addProduct: (input: CreateProductInput) => Promise<Product>;
  updateProduct: (id: string, input: UpdateProductInput) => Promise<Product>;
  updateStock: (id: string, delta: number) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductByBarcode: (barcode: string) => Promise<Product | null>;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,
  searchQuery: '',

  loadProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const products = await ProductRepository.getAll();
      set({ products, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load products',
        isLoading: false
      });
    }
  },

  searchProducts: async (query: string) => {
    set({ isLoading: true, error: null, searchQuery: query });
    try {
      const products = query.trim()
        ? await ProductRepository.search(query)
        : await ProductRepository.getAll();
      set({ products, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to search products',
        isLoading: false
      });
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  addProduct: async (input: CreateProductInput) => {
    set({ error: null });
    try {
      const product = await ProductRepository.create(input);
      set(state => ({ products: [product, ...state.products] }));
      return product;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add product';
      set({ error: message });
      throw new Error(message);
    }
  },

  updateProduct: async (id: string, input: UpdateProductInput) => {
    set({ error: null });
    try {
      const product = await ProductRepository.update(id, input);
      set(state => ({
        products: state.products.map(p => p.id === id ? product : p)
      }));
      return product;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update product';
      set({ error: message });
      throw new Error(message);
    }
  },

  updateStock: async (id: string, delta: number) => {
    set({ error: null });
    try {
      const product = await ProductRepository.updateStock(id, delta);
      set(state => ({
        products: state.products.map(p => p.id === id ? product : p)
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update stock'
      });
    }
  },

  deleteProduct: async (id: string) => {
    set({ error: null });
    try {
      await ProductRepository.delete(id);
      set(state => ({
        products: state.products.filter(p => p.id !== id)
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete product'
      });
    }
  },

  getProductByBarcode: async (barcode: string) => {
    try {
      return await ProductRepository.getByBarcode(barcode);
    } catch {
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));
