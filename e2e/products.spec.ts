import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import { randomUUID } from 'node:crypto';
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

  const buildProduct = (overrides: Partial<Product> = {}): Partial<Product> => ({
    name: 'Widget Pro',
    productToken: randomUUID(),
    price: 29.99,
    stock: 100,
    ...overrides,
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

  describe('GET /api/v1/products', () => {
    const seedProducts = async (count: number): Promise<void> => {
      const products = Array.from({ length: count }, (_, index) => {
        return buildProduct({ name: `Product ${index}` });
      });

      await Product.bulkCreate(products);
    };

    afterEach(async () => {
      await Product.truncate({ force: true });
    });

    it('should return the first page with default pagination', async () => {
      await seedProducts(3);

      const response = await request(app.getHttpServer()).get('/api/v1/products');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        totalItems: 3,
        currentPage: 1,
        totalPages: 1,
        limit: 20,
      });
      expect(response.body.products).toHaveLength(3);
    });

    it('should return the requested page with a custom page and limit', async () => {
      await seedProducts(12);

      const response = await request(app.getHttpServer()).get('/api/v1/products?page=2&limit=5');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        totalItems: 12,
        currentPage: 2,
        totalPages: 3,
        limit: 5,
      });
      expect(response.body.products).toHaveLength(5);
    });

    it('should return an empty list when no products exist', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/products');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        totalItems: 0,
        currentPage: 1,
        totalPages: 0,
        limit: 20,
      });
      expect(response.body.products).toEqual([]);
    });

    it('should return an empty list when page exceeds total pages', async () => {
      await seedProducts(2);

      const response = await request(app.getHttpServer()).get('/api/v1/products?page=5&limit=20');

      expect(response.status).toBe(200);
      expect(response.body.products).toEqual([]);
      expect(response.body.totalItems).toBe(2);
    });

    it('should return 400 when limit exceeds the maximum', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/products?limit=101');

      expect(response.status).toBe(400);
    });

    it('should return 400 when limit is below the minimum', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/products?limit=0');

      expect(response.status).toBe(400);
    });

    it('should return 400 when page is below the minimum', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/products?page=0');

      expect(response.status).toBe(400);
    });

    it('should exclude soft-deleted products from the results', async () => {
      await seedProducts(2);

      const [productToDelete] = await Product.bulkCreate([buildProduct({ name: 'To Delete' })]);
      await productToDelete.destroy();

      const response = await request(app.getHttpServer()).get('/api/v1/products');

      expect(response.status).toBe(200);
      expect(response.body.totalItems).toBe(2);
      expect(response.body.products).toHaveLength(2);
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should return the product when it exists', async () => {
      const product = await Product.create(buildProduct());

      const response = await request(app.getHttpServer()).get(`/api/v1/products/${product.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: product.id,
        name: 'Widget Pro',
        productToken: product.productToken,
        stock: 100,
      });
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should return 404 when the product does not exist', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/products/999999');

      expect(response.status).toBe(404);
    });

    it('should return 404 when the product has been soft-deleted', async () => {
      const product = await Product.create(buildProduct());
      await product.destroy();

      const response = await request(app.getHttpServer()).get(`/api/v1/products/${product.id}`);

      expect(response.status).toBe(404);
    });

    it('should return 400 when the id is not a valid integer', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/products/not-a-number');

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/v1/products/:id/stock', () => {
    it('should update the stock and return 200 with the updated product', async () => {
      const product = await Product.create(buildProduct());

      const response = await request(app.getHttpServer())
        .put(`/api/v1/products/${product.id}/stock`)
        .send({ stock: 50 });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: product.id,
        stock: 50,
      });
    });

    it('should accept a stock of 0 as a valid value', async () => {
      const product = await Product.create(buildProduct());

      const response = await request(app.getHttpServer())
        .put(`/api/v1/products/${product.id}/stock`)
        .send({ stock: 0 });

      expect(response.status).toBe(200);
      expect(response.body.stock).toBe(0);
    });

    it('should return 400 when the stock is negative', async () => {
      const product = await Product.create(buildProduct());

      const response = await request(app.getHttpServer())
        .put(`/api/v1/products/${product.id}/stock`)
        .send({ stock: -1 });

      expect(response.status).toBe(400);
    });

    it('should return 400 when the stock field is missing', async () => {
      const product = await Product.create(buildProduct());

      const response = await request(app.getHttpServer())
        .put(`/api/v1/products/${product.id}/stock`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 404 when the product does not exist', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/v1/products/999999/stock')
        .send({ stock: 50 });

      expect(response.status).toBe(404);
    });

    it('should return 404 when the product has been soft-deleted', async () => {
      const product = await Product.create(buildProduct());
      await product.destroy();

      const response = await request(app.getHttpServer())
        .put(`/api/v1/products/${product.id}/stock`)
        .send({ stock: 50 });

      expect(response.status).toBe(404);
    });

    it('should return 400 when the id is not a valid integer', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/v1/products/not-a-number/stock')
        .send({ stock: 50 });

      expect(response.status).toBe(400);
    });
  });
});
