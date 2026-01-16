import { defineConfig } from "prisma/config";

/**
 * Prisma 7+ requires the database URL to be defined in this config file
 * for migrations and CLI tools, rather than directly in the schema.prisma.
 */

const databaseUrl = process.env.DATABASE_URL;

// This check "narrows" the type from string | undefined to just string
if (!databaseUrl) {
  throw new Error(
    'Environment variable "DATABASE_URL" is missing. ' +
      "Please ensure it is defined in your .env file."
  );
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!, // The "!" tells TS this is definitely not null/undefined
  },
});
