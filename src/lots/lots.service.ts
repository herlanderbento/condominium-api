import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Lot } from './models/lots.model';


@Injectable()
export class LotsService {
  constructor(
    @InjectModel(Lot)
    private lotModel: typeof Lot,
  ) { }

  async findAll(): Promise<Lot[]> {
    return this.lotModel.findAll({
      where: { active: true },
    });
  }

  async findById(id: number): Promise<Lot> {
    return this.lotModel.findByPk(id);
  }

  async findByName(name: string): Promise<Lot> {
    return this.lotModel.findOne({
      where: {
        name,
        active: true,
      },
    });
  }

  async findByExternalName(externalName: string): Promise<Lot> {
    const paddedName = externalName.padStart(4, '0');
    const lot = await this.findByName(paddedName);
    
    if (!lot) {
      throw new Error(`Lot not found for external name: ${externalName} (searched for: ${paddedName})`);
    }

    return lot;
  }

  async checkRequiredLots(): Promise<{ exists: boolean; message: string }> {
    const requiredLots = ['0017', '0018', '0019'];
    const existingLots = await this.lotModel.findAll({
      where: {
        name: requiredLots,
        active: true,
      },
    });

    const existingLotNames = existingLots.map(lot => lot.name);
    const missingLots = requiredLots.filter(name => !existingLotNames.includes(name));

    if (missingLots.length > 0) {
      return {
        exists: false,
        message: `Missing required lots: ${missingLots.join(', ')}`
      };
    }

    return {
      exists: true,
      message: 'All required lots exist in the database'
    };
  }

  async createRequiredLots(): Promise<Lot[]> {
    const requiredLots = [
      { id: 3, name: '0017' },
      { id: 6, name: '0018' },
      { id: 7, name: '0019' }
    ];

    const createdLots: Lot[] = [];

    for (const lotData of requiredLots) {
      const [lot, created] = await this.lotModel.findOrCreate({
        where: { id: lotData.id },
        defaults: {
          name: lotData.name,
          active: true,
        }
      });

      if (!created) {
        // If lot exists, update its name
        await lot.update({ name: lotData.name, active: true });
      }

      createdLots.push(lot);
    }

    return createdLots;
  }
}