import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LotsModule } from './lots/lots.module';
import { BillsModule } from './bills/bills.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import databaseConfig from './config/database.config';


@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      useFactory: () => ({
        ...databaseConfig(),
      }),
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    LotsModule,
    BillsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
