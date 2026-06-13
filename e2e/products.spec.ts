import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';
import { ProductsModule } from '../src/products/products.module';
import { Product } from '../src/products/products.model';
import { CreateProductRequestDto } from '../src/products/dtos/products.request.dto';

describe('Products (e2e)', () => {
  let app: INestApplication;
  let container: StartedMySqlContainer;

  beforeAll(async () => {
    container = await new MySqlContainer('mysql:8.0')
      .withDatabase('ecommerce_test')
      .withUsername('test')
      .withUserPassword('test')
      .start();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        SequelizeModule.forRoot({
          dialect: 'mysql',
          host: container.getHost(),
          port: container.getPort(),
          username: container.getUsername(),
          password: container.getUserPassword(),
          database: container.getDatabase(),
          models: [Product],
          synchronize: true,
          autoLoadModels: true,
          logging: false,
        }),
        ProductsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    await app.init();
  }, 60000);

  afterEach(async () => {
    await Product.destroy({ where: {}, truncate: true, force: true });
  });

  afterAll(async () => {
    await app.close();
    await container.stop();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('POST /api/v1/products', () => {
    const validPayload: CreateProductRequestDto = {
      name: 'Widget Pro',
      productToken: '550e8400-e29b-41d4-a716-446655440000',
      price: 29.99,
      stock: 100,
    };

    it('should create a product and return 201 with the complete product', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send(validPayload);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(Number),
        productToken: validPayload.productToken,
        name: validPayload.name,
        stock: validPayload.stock,
      });
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should return 400 when name is missing', async () => {
      const { name: _name, ...payload } = validPayload;

      const response = await request(app.getHttpServer()).post('/api/v1/products').send(payload);

      expect(response.status).toBe(400);
    });

    it('should return 400 when name is empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({ ...validPayload, name: '' });

      expect(response.status).toBe(400);
    });

    it('should return 400 when price is negative', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({ ...validPayload, price: -1 });

      expect(response.status).toBe(400);
    });

    it('should return 400 when price exceeds decimal(10,4) max', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({ ...validPayload, price: 10000000 });

      expect(response.status).toBe(400);
    });

    it('should return 400 when stock is negative', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({ ...validPayload, stock: -1 });

      expect(response.status).toBe(400);
    });

    it('should return 400 when productToken is not a valid UUID v4', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({ ...validPayload, productToken: 'not-a-uuid' });

      expect(response.status).toBe(400);
    });

    it('should return 409 when a product with the same productToken already exists', async () => {
      await request(app.getHttpServer()).post('/api/v1/products').send(validPayload);

      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({ ...validPayload, name: 'Another Name' });

      expect(response.status).toBe(409);
    });
  });
});
