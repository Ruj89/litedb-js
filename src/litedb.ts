type Query<T> = (item: T) => boolean;

export interface LiteCollection<T> {
  insert(item: T): T;
  update(item: T): boolean;
  delete(query: Query<T>): number;
  find(query?: Query<T>): T[];
  ensureIndex(field: keyof T, unique?: boolean): void;
}

export class LiteDatabase {
  private collections: Map<string, any>;

  constructor() {
    this.collections = new Map();
  }

  /**
   * Get a collection by name. Creates it if it doesn't exist.
   */
  getCollection<T>(name: string): LiteCollection<T> {
    if (!this.collections.has(name)) {
      this.collections.set(name, new LiteCollectionImpl<T>());
    }
    return this.collections.get(name) as LiteCollection<T>;
  }
}

class LiteCollectionImpl<T> implements LiteCollection<T> {
  private data: T[];
  private indexes: Map<keyof T, Map<any, T[]>>;
  private uniqueIndexes: Set<keyof T>;

  constructor() {
    this.data = [];
    this.indexes = new Map();
    this.uniqueIndexes = new Set();
  }

  /**
   * Insert a new item into the collection.
   */
  insert(item: T): T {
    for (const [field, index] of this.indexes.entries()) {
      const value = item[field];
      if (this.uniqueIndexes.has(field) && index.has(value)) {
        throw new Error(`Duplicate key for unique index on '${String(field)}'`);
      }
      if (!index.has(value)) {
        index.set(value, []);
      }
      index.get(value)!.push(item);
    }

    this.data.push(item);
    return item;
  }

  /**
   * Update an existing item in the collection.
   */
  update(item: T): boolean {
    const index = this.data.findIndex((i) => i === item);
    if (index === -1) {
      return false;
    }

    this.data[index] = item;
    this.rebuildIndexes();
    return true;
  }

  /**
   * Delete items that match the query.
   */
  delete(query: Query<T>): number {
    const initialLength = this.data.length;
    this.data = this.data.filter((item) => !query(item));
    this.rebuildIndexes();
    return initialLength - this.data.length;
  }

  /**
   * Find items matching the query. If no query is provided, return all items.
   */
  find(query?: Query<T>): T[] {
    return query ? this.data.filter(query) : [...this.data];
  }

  /**
   * Ensure an index on a specific field.
   */
  ensureIndex(field: keyof T, unique: boolean = false): void {
    if (this.indexes.has(field)) {
      throw new Error(`Index already exists on field: ${String(field)}`);
    }

    const index = new Map<any, T[]>();
    for (const item of this.data) {
      const value = item[field];
      if (unique && index.has(value)) {
        throw new Error(`Duplicate key error while creating unique index: ${String(field)}=${value}`);
      }
      if (!index.has(value)) {
        index.set(value, []);
      }
      index.get(value)!.push(item);
    }

    this.indexes.set(field, index);
    if (unique) {
      this.uniqueIndexes.add(field);
    }
  }

  /**
   * Rebuild indexes after data modification.
   */
  private rebuildIndexes(): void {
    for (const [field, index] of this.indexes.entries()) {
      index.clear();
      for (const item of this.data) {
        const value = item[field];
        if (!index.has(value)) {
          index.set(value, []);
        }
        index.get(value)!.push(item);
      }
    }
  }
}
