import { Controller, Get, Param, Post } from '@nestjs/common';
import { LotsService } from './lots.service';
import { Lot } from './models/lots.model';

@Controller('lots')
export class LotsController {
  constructor(private readonly lotsService: LotsService) {}

  @Get()
  async findAll(): Promise<Lot[]> {
    return this.lotsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Lot> {
    return this.lotsService.findById(id);
  }

  @Get('check/required')
  async checkRequiredLots() {
    return this.lotsService.checkRequiredLots();
  }

  @Post('create/required')
  async createRequiredLots(): Promise<Lot[]> {
    return this.lotsService.createRequiredLots();
  }
}
