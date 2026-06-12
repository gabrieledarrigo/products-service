import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { LoggerModule } from 'nestjs-pino';
import { ProductsModule } from './products/products.module';
import { Product } from './products/products.model';

/**
 * Root application module.
 *
 * Configures environment variables loading, MySQL database connection
 * via Sequelize ORM, structured JSON logging via Pino, and registers
 * the ProductsModule.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        models: [Product],
        synchronize: true,
        autoLoadModels: true,
      }),
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.get<string>('APP_ENV') === 'local' ? 'debug' : 'info',
          transport:
            configService.get<string>('APP_ENV') === 'local'
              ? { target: 'pino-pretty' }
              : undefined,
        },
      }),
    }),
    ProductsModule,
  ],
})
export class AppModule {}
