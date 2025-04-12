import { Module } from '@nestjs/common';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { Bill } from './models/bill.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { LotsModule } from '../lots/lots.module';
import { PdfService } from './services/pdf.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Bill]),
    LotsModule,
  ],
  controllers: [BillsController],
  providers: [BillsService, PdfService],
})
export class BillsModule {}