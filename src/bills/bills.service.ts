import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { LotsService } from '../lots/lots.service';
import { Op } from 'sequelize';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import * as path from 'path';
import * as PDFDocument from 'pdfkit';
import { Bill } from './models/bill.model';

interface BillFilter {
  name?: string;
  minAmount?: number;
  maxAmount?: number;
  lotId?: number;
}

@Injectable()
export class BillsService {
  private readonly reportsDir: string;

  constructor(
    @InjectModel(Bill)
    private billModel: typeof Bill,
    private lotsService: LotsService,
  ) {
    this.reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async findAll(filters?: BillFilter): Promise<Bill[]> {
    const where: any = { active: true };

    if (filters) {
      if (filters.name) {
        where.payer_name = { [Op.iLike]: `%${filters.name}%` };
      }
      if (filters.minAmount) {
        where.amount = { ...where.amount, [Op.gte]: filters.minAmount };
      }
      if (filters.maxAmount) {
        where.amount = { ...where.amount, [Op.lte]: filters.maxAmount };
      }
      if (filters.lotId) {
        where.lot_id = filters.lotId;
      }
    }

    return this.billModel.findAll({
      where,
      include: ['lot'],
    });
  }

  async importFromCsv(filePath: string): Promise<Bill[]> {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const records: any[] = await new Promise((resolve, reject) => {
      parse(
        fileContent,
        {
          delimiter: ';',
          columns: true,
          skip_empty_lines: true,
        },
        (err, records) => {
          if (err) reject(err);
          resolve(records);
        },
      );
    });

    const bills: Bill[] = [];

    for (const record of records) {
      const lot = await this.lotsService.findByExternalName(record.unidade);

      const bill = await this.billModel.create({
        payer_name: record.nome,
        lot_id: lot.id,
        amount: parseFloat(record.valor),
        digitable_line: record.linha_digitavel,
        active: true,
      });

      bills.push(bill);
    }

    return bills;
  }

  async generatePdfReport(bills: Bill[]): Promise<{ base64: string; filePath: string }> {
    return new Promise((resolve) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        const fileName = `relatorio_boletos_${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;
        const filePath = path.join(this.reportsDir, fileName);
        
        // Save the PDF file
        fs.writeFileSync(filePath, pdfBuffer);
        
        // Return both base64 and file path
        resolve({
          base64: pdfBuffer.toString('base64'),
          filePath
        });
      });

      // Add header
      doc.fontSize(16).text('Relatório de Boletos', { align: 'center' });
      doc.moveDown();

      // Define column positions and widths
      const columns = [
        { name: 'id', width: 50, position: 50 },
        { name: 'nome_sacado', width: 200, position: 100 },
        { name: 'id_lote', width: 80, position: 300 },
        { name: 'valor', width: 100, position: 380 },
        { name: 'linha_digitavel', width: 200, position: 480 }
      ];

      // Starting position for the table
      const tableTop = 150;
      const rowHeight = 30;
      const cellPadding = 5;

      // Draw table header
      doc.fontSize(12).font('Helvetica-Bold');
      columns.forEach(column => {
        doc.text(column.name, column.position, tableTop);
      });

      // Draw horizontal line after header
      doc.moveTo(50, tableTop + rowHeight)
         .lineTo(680, tableTop + rowHeight)
         .stroke();

      // Draw vertical lines
      columns.forEach(column => {
        doc.moveTo(column.position, tableTop)
           .lineTo(column.position, tableTop + (rowHeight * (bills.length + 1)))
           .stroke();
      });

      // Draw last vertical line
      doc.moveTo(680, tableTop)
         .lineTo(680, tableTop + (rowHeight * (bills.length + 1)))
         .stroke();

      // Add table content
      doc.font('Helvetica');
      bills.forEach((bill, index) => {
        const y = tableTop + rowHeight + (index * rowHeight);
        
        // Draw row content
        doc.text(bill.id.toString(), columns[0].position + cellPadding, y + cellPadding);
        doc.text(bill.payer_name, columns[1].position + cellPadding, y + cellPadding);
        doc.text(bill.lot_id.toString(), columns[2].position + cellPadding, y + cellPadding);
        const amount = typeof bill.amount === 'string' ? parseFloat(bill.amount) : bill.amount;
        doc.text(amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 
                columns[3].position + cellPadding, y + cellPadding);
        
        // Truncate long digitable lines
        const digitableLine = bill.digitable_line.length > 20 
          ? bill.digitable_line.substring(0, 20) + '...' 
          : bill.digitable_line;
        doc.text(digitableLine, columns[4].position + cellPadding, y + cellPadding);

        // Draw horizontal line after each row
        doc.moveTo(50, y + rowHeight)
           .lineTo(680, y + rowHeight)
           .stroke();
      });

      doc.end();
    });
  }

  async splitPdf(inputPath: string, outputDir: string): Promise<void> {
    // This is a placeholder for PDF splitting logic
    // You would implement the actual PDF splitting here using a library like pdf-lib
    // For now, we'll create dummy PDFs for demonstration
    const bills = await this.findAll();

    for (const bill of bills) {
      const doc = new PDFDocument();
      const writeStream = fs.createWriteStream(`${outputDir}/${bill.id}.pdf`);
      doc.pipe(writeStream);

      doc.fontSize(16).text(`Bill for ${bill.payer_name}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Amount: ${bill.amount}`);
      doc.text(`Digitable Line: ${bill.digitable_line}`);

      doc.end();
    }
  }
}
