export interface Product {
  id: string;
  name: string;
  barcode: string | null;
  price: number;
  stock: number;
  photoPath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  barcode?: string | null;
  price?: number;
  stock?: number;
  photoPath?: string | null;
}

export interface UpdateProductInput {
  name?: string;
  barcode?: string | null;
  price?: number;
  stock?: number;
  photoPath?: string | null;
}
