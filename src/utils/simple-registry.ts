/**
 * Simple registry for managing plugin-based filters and content types
 */
export class SimpleRegistry<T> {
  private items = new Map<string, T>();

  /**
   * Register an item
   */
  register(id: string, item: T) {
    this.items.set(id, item);
  }

  /**
   * Get an item by ID
   */
  get(id: string): T | undefined {
    return this.items.get(id);
  }

  /**
   * Get all registered items
   */
  getAll(): T[] {
    return Array.from(this.items.values());
  }

  /**
   * Get all registered item IDs
   */
  getAllIds() {
    return Array.from(this.items.keys());
  }

  /**
   * Check if an ID is registered
   */
  has(id: string) {
    return this.items.has(id);
  }

  /**
   * Clear all registered items
   */
  clear() {
    this.items.clear();
  }

  /**
   * Get the number of registered items
   */
  size() {
    return this.items.size;
  }
}
