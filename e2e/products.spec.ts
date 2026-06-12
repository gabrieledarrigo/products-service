import { describe, it, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';
import { ProductsModule } from '../src/products/products.module';
import { Product } from '../src/products/products.model';

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
});
