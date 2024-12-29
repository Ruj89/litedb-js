import { LiteCollection, LiteDatabase } from "./litedb";

interface Customer {
  id: number;
  name: string;
  age: number;
  phones: string[];
  isActive: boolean;
}

describe("LiteDatabase - Customer Collection", () => {
  let db: LiteDatabase;
  let customers: LiteCollection<Customer>;

  beforeEach(() => {
    db = new LiteDatabase();
    customers = db.getCollection<Customer>("customers");
  });

  test("should insert a new customer", () => {
    const newCustomer: Customer = {
      id: 1,
      name: "John Doe",
      age: 39,
      phones: ["8000-0000", "9000-0000"],
      isActive: true,
    };
    customers.insert(newCustomer);

    const result = customers.find((customer) => customer.id === 1);
    expect(result.length).toBe(1);
    expect(result[0]).toEqual(newCustomer);
  });

  test("should enforce only existing field", () => {
    customers.ensureIndex("name", true);
    expect(() => customers.ensureIndex("name", true)).toThrow("Index already exists on field: name")
  });

  test("should enforce unique index on name", () => {
    customers.ensureIndex("name", true);

    customers.insert({
      id: 1,
      name: "John Doe",
      age: 39,
      phones: ["8000-0000"],
      isActive: true,
    });

    expect(() => {
      customers.insert({
        id: 2,
        name: "John Doe", // Duplicate name
        age: 25,
        phones: ["7000-0000"],
        isActive: false,
      });
    }).toThrow("Duplicate key for unique index on 'name'");

    customers.ensureIndex("id", true);

    customers.insert({
      id: 2,
      name: "John Dohan",
      age: 39,
      phones: ["8000-0000"],
      isActive: true,
    });

    expect(() => customers.ensureIndex("age", true)).toThrow("Duplicate key error while creating unique index: age=39")
  });

  test("should find customers by condition", () => {
    customers.insert({
      id: 1,
      name: "John Doe",
      age: 39,
      phones: ["8000-0000", "9000-0000"],
      isActive: true,
    });
    customers.insert({
      id: 2,
      name: "Jane Smith",
      age: 25,
      phones: ["7000-0000"],
      isActive: true,
    });

    const result = customers.find((customer) => customer.age > 30);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("John Doe");
  });

  test("should update a customer", () => {
    customers.insert({
      id: 1,
      name: "John Doe",
      age: 39,
      phones: ["8000-0000"],
      isActive: true,
    });

    const customerToUpdate = customers.find((customer) => customer.id === 1)[0];
    customerToUpdate.name = "Jane Doe";
    customers.update(customerToUpdate);

    const updatedCustomer = customers.find((customer) => customer.id === 1)[0];
    expect(updatedCustomer.name).toBe("Jane Doe");
  });

  test("should delete a customer", () => {
    customers.insert({
      id: 1,
      name: "John Doe",
      age: 39,
      phones: ["8000-0000"],
      isActive: true,
    });

    customers.delete((customer) => customer.id === 1);

    const result = customers.find((customer) => customer.id === 1);
    expect(result.length).toBe(0);
  });

  test("should handle non-existent customer updates gracefully", () => {
    const nonExistentCustomer: Customer = {
      id: 999,
      name: "Ghost",
      age: 0,
      phones: [],
      isActive: false,
    };
    const result = customers.update(nonExistentCustomer);
    expect(result).toBe(false); // Assuming update returns false if the customer doesn't exist
  });

  test("should rebuild indexes after data modification", () => {
    customers.ensureIndex("name", false);

    // Insert initial data
    customers.insert({
      id: 1,
      name: "Alice",
      age: 30,
      phones: [],
      isActive: false
    });
    customers.insert({
      id: 2,
      name: "Bob",
      age: 25,
      phones: [],
      isActive: false
    });
    customers.insert({
      id: 3,
      name: "Charlie",
      age: 35,
      phones: [],
      isActive: false
    });

    // Validate the index was created correctly
    let results = customers.find((c) => c.name === "Alice");
    expect(results.length).toBe(1);

    // Update an item to trigger rebuildIndexes
    const alice = customers.find((c) => c.name === "Alice")[0];
    alice.name = "Alice Updated";
    customers.update(alice);

    // Validate the index after rebuild
    results = customers.find((c) => c.name === "Alice Updated");
    expect(results.length).toBe(1);

    // Validate the old index is removed
    results = customers.find((c) => c.name === "Alice");
    expect(results.length).toBe(0);

    // Delete an item to trigger rebuildIndexes
    customers.delete((c) => c.id === 3);

    // Validate the index after deletion
    results = customers.find((c) => c.name === "Charlie");
    expect(results.length).toBe(0);
  });
});
