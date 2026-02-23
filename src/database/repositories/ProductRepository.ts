import { getDatabase } from '../database';
import { deletePhoto } from '@/services/photos/photoStorage';
import type { Product, CreateProductInput, UpdateProductInput } from '@/types/product';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function mapRowToProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    barcode: row.barcode as string | null,
    price: row.price as number,
    stock: row.stock as number,
    photoPath: row.photo_path as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const ProductRepository = {
  async getAll(): Promise<Product[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM products ORDER BY updated_at DESC'
    );
    return rows.map(mapRowToProduct);
  },

  async getById(id: string): Promise<Product | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<Record<string, unknown>>(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    return row ? mapRowToProduct(row) : null;
  },

  async getByBarcode(barcode: string): Promise<Product | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<Record<string, unknown>>(
      'SELECT * FROM products WHERE barcode = ?',
      [barcode]
    );
    return row ? mapRowToProduct(row) : null;
  },

  async search(query: string): Promise<Product[]> {
    const db = await getDatabase();
    const searchTerm = `%${query}%`;

    // SQLite LIKE is case-insensitive by default for ASCII
    // For more complex search, we fetch all and filter in JS
    const rows = await db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM products ORDER BY updated_at DESC'
    );

    const products = rows.map(mapRowToProduct);
    const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

    if (!normalizedQuery) {
      return products;
    }

    // Filter products that match the search query
    return products.filter(product => {
      const normalizedName = product.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const normalizedBarcode = product.barcode?.toLowerCase() || '';
      const priceString = product.price.toString();

      return (
        normalizedName.includes(normalizedQuery) ||
        normalizedBarcode.includes(normalizedQuery) ||
        priceString.includes(normalizedQuery)
      );
    });
  },

  async create(input: CreateProductInput): Promise<Product> {
    const db = await getDatabase();
    const id = generateId();
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO products (id, name, barcode, price, stock, photo_path, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.name,
        input.barcode ?? null,
        input.price ?? 0,
        input.stock ?? 0,
        input.photoPath ?? null,
        now,
        now,
      ]
    );

    const product = await this.getById(id);
    if (!product) throw new Error('Failed to create product');
    return product;
  },

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const sets: string[] = ['updated_at = ?'];
    const values: (string | number | null)[] = [now];

    if (input.name !== undefined) {
      sets.push('name = ?');
      values.push(input.name);
    }
    if (input.barcode !== undefined) {
      sets.push('barcode = ?');
      values.push(input.barcode);
    }
    if (input.price !== undefined) {
      sets.push('price = ?');
      values.push(input.price);
    }
    if (input.stock !== undefined) {
      sets.push('stock = ?');
      values.push(input.stock);
    }
    if (input.photoPath !== undefined) {
      sets.push('photo_path = ?');
      values.push(input.photoPath);
    }

    values.push(id);

    await db.runAsync(
      `UPDATE products SET ${sets.join(', ')} WHERE id = ?`,
      values
    );

    const product = await this.getById(id);
    if (!product) throw new Error('Product not found');
    return product;
  },

  async updateStock(id: string, delta: number): Promise<Product> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    await db.runAsync(
      'UPDATE products SET stock = MAX(0, stock + ?), updated_at = ? WHERE id = ?',
      [delta, now, id]
    );

    const product = await this.getById(id);
    if (!product) throw new Error('Product not found');
    return product;
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase();

    // Get product to delete photo if exists
    const product = await this.getById(id);
    if (product?.photoPath) {
      await deletePhoto(product.photoPath);
    }

    await db.runAsync('DELETE FROM products WHERE id = ?', [id]);
  },

  async count(): Promise<number> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM products'
    );
    return result?.count ?? 0;
  },
};
