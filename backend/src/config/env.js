const { z } = require("zod");
require("dotenv").config();

const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.string().default("development"),

  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string().min(32, "JWT_SECRET minimal 32 karakter"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  CORS_ORIGIN: z.string().optional(), // "http://localhost:3000,http://127.0.0.1:3000"
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // tampilkan error yang enak dibaca
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.format());
  process.exit(1);
}

module.exports = parsed.data;