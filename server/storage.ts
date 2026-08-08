// Compatibility shim: the original 15,000-line storage.ts was split into
// domain modules under server/storage/ (see server/storage/README.md).
// All existing imports of "./storage" keep working through this re-export.
export * from "./storage/index";
