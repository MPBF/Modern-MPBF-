// Composed storage: DatabaseStorage is assembled from domain fragments via a
// chain of inheritance (see server/storage/README.md). All methods share one
// prototype chain, so `this` works exactly as in the original single class.
export * from "./core";
import { MiscStorage } from "./misc";

export class DatabaseStorage extends MiscStorage {}

export const storage = new DatabaseStorage();
