try {
  const app = require("../src/app");
  module.exports = app;
} catch (e) {
  console.error("BOOT_ERROR:", e);
  throw e;
}