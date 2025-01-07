const litedb_native = require("../build/Release/litedb_native");

export interface NativeLiteDatabase {
  getCollection<T>(name: string): LiteCollection<T>;
}

export interface Query<T> {
  (item: T): boolean;
}

export interface LiteCollection<T> {
  insert(item: T): T;
  update(item: T): boolean;
  delete(query: Query<T>): number;
  find(query?: Query<T>): T[];
  ensureIndex(field: keyof T, unique?: boolean): void;
}

export class LiteDatabase {
  private nativeDb: NativeLiteDatabase;

  constructor() {
    this.nativeDb = new litedb_native.LiteDatabase();
  }

  getCollection<T>(name: string): LiteCollection<T> {
    return this.nativeDb.getCollection(name);
  }
}
