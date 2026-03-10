import { INestApplication } from "@nestjs/common";
import { AppModule } from "../app.module";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { PrismaService } from "../prisma/prisma.service";
import { hash } from "bcryptjs";
import { access } from "fs";

describe("Authenticate (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get<PrismaService>(PrismaService);

    await app.init();
  });

  test("[POST] /sessions", async () => {
    await prisma.user.create({
      data: {
        name: "John Doe",
        email: "john.doe@example.com",
        password: await hash("password123", 8),
      },
    });

    const response = await request(app.getHttpServer()).post("/sessions").send({
      email: "john.doe@example.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(201);

    expect(response.body).toEqual({
      access_token: expect.any(String),
    });
  });
});
