const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { notFoundHandler, errorHandler } = require("./middleware/error");

const authRoutes = require("./routes/auth.routes");
const formsRoutes = require("./routes/forms.routes");
const questionsRoutes = require("./routes/questions.routes");
const submissionsRoutes = require("./routes/submissions.routes");

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./src/swagger.yaml");
const healthRoutes = require("./routes/health.routes");
const publicRoutes = require("./routes/public.routes");


const app = express();

console.log({
  authRoutes: typeof authRoutes,
  formsRoutes: typeof formsRoutes,
  questionsRoutes: typeof questionsRoutes,
  responsesRoutes: typeof responsesRoutes,
  submissionsRoutes: typeof submissionsRoutes,
  publicRoutes: typeof publicRoutes,
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/public", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/forms", formsRoutes);
app.use("/api/forms", questionsRoutes);   // nested under /forms/:formId/questions...
app.use("/api/forms", submissionsRoutes); // /forms/:formId/submissions...
app.use("/health", healthRoutes);
app.use(notFoundHandler);
app.use(errorHandler);


module.exports = app;