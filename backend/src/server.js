const env = require("./config/env");
const app = require("./app");

app.listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT}`);
  console.log(`Docs: http://localhost:${env.PORT}/api/docs`);
});