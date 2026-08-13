// Minimal multer mock for route-registration tests (avoids an ESM
// circular-import crash in server/routes/shared.ts under ts-jest).
function multer() {
  const passthrough = () => (req, res, next) => next();
  return {
    single: passthrough,
    array: passthrough,
    fields: passthrough,
    none: passthrough,
    any: passthrough,
  };
}
multer.memoryStorage = () => ({});
multer.diskStorage = () => ({});
module.exports = multer;
module.exports.default = multer;
