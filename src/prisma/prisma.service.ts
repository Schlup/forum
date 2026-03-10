import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { ConfigService } from "@nestjs/config";
import { Env } from "../env";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService<Env, true>) {
    const connectionString = config.get("DATABASE_URL", { infer: true });

    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not defined");
    }

    // Extrai o schema da URL (se não existir, usa public)
    const url = new URL(connectionString);
    const schema = url.searchParams.get("schema") || "public";

    const pool = new Pool({ connectionString });

    // Força o driver 'pg' a usar o schema correto para todas as queries
    pool.on("connect", (client) => {
      client.query(`SET search_path TO "${schema}", public`);
    });

    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: ["warn", "error"],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
