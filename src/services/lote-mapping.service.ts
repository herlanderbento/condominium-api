import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoteMappingService {
  private mapping: Map<string, number> = new Map();

  constructor() {
    this.loadMapping();
  }

  private loadMapping() {
    try {
      const csvPath = path.join(process.cwd(), 'lotes.csv');
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n');

      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const [nomeUnidade, , id] = lines[i].split(';');
        if (nomeUnidade && id) {
          this.mapping.set(nomeUnidade.trim(), parseInt(id.trim()));
        }
      }
    } catch (error) {
      console.error('Error loading lot mapping:', error);
      throw new Error('Failed to load lot mapping');
    }
  }

  public getLoteIdByUnidade(unidade: string): number {
    const loteId = this.mapping.get(unidade);
    if (!loteId) {
      throw new Error(`No mapping found for unidade: ${unidade}`);
    }
    return loteId;
  }
} 