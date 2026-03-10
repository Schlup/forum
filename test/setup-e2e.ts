import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";

const schemaId = randomUUID();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const url = new URL(process.env.DATABASE_URL);
url.searchParams.set("schema", schemaId);

const databaseUrl = url.toString();
process.env.DATABASE_URL = databaseUrl;

let prisma: PrismaClient;
let pool: Pool;

beforeAll(async () => {
  execSync("pnpm prisma migrate deploy");

  pool = new Pool({ connectionString: databaseUrl });

  // Adicione este bloco para forçar o schema na conexão de setup
  pool.on("connect", (client) => {
    client.query(`SET search_path TO "${schemaId}", public`);
  });

  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
});
afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);
  await prisma.$disconnect();
  await pool.end();
});
