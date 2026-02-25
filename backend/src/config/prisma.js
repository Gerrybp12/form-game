if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString =
  process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL / DIRECT_DATABASE_URL");
}

const pool = new Pool({
  connectionString,
  // Neon biasanya butuh SSL; kalau URL sudah pakai ?sslmode=require biasanya aman.
  ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : undefined,
});

const adapter = new PrismaPg(pool);

// Cache prisma di dev supaya hot-reload ga bikin banyak koneksi
const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

module.exports = prisma;