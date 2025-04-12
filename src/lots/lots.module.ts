import { Module } from '@nestjs/common';
import { LotsService } from './lots.service';
import { LotsController } from './lots.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Lot } from './models/lots.model';

@Module({
  imports: [SequelizeModule.forFeature([Lot])],
  controllers: [LotsController],
  providers: [LotsService],
  exports: [LotsService],
})
export class LotsModule {}
