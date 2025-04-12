import { Injectable, Logger } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly outputDir: string;

  constructor() {
    // Cria um diretório temporário dentro do diretório do projeto
    this.outputDir = path.join(process.cwd(), 'temp_pdfs');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true, mode: 0o755 });
    }
  }

  async generateSamplePdf(): Promise<string> {
    try {
      this.logger.log('Generating sample PDF...');
      const pdfDoc = await PDFDocument.create();
      
      // Página 1 - MARCIA
      const page1 = pdfDoc.addPage();
      const { width, height } = page1.getSize();
      page1.drawText('BOLETO MARCIA', {
        x: width / 2 - 50,
        y: height / 2,
        size: 20,
      });

      // Página 2 - JOSE
      const page2 = pdfDoc.addPage();
      page2.drawText('BOLETO JOSE', {
        x: width / 2 - 50,
        y: height / 2,
        size: 20,
      });

      // Página 3 - MARCOS
      const page3 = pdfDoc.addPage();
      page3.drawText('BOLETO MARCOS', {
        x: width / 2 - 50,
        y: height / 2,
        size: 20,
      });

      const pdfBytes = await pdfDoc.save();
      const outputPath = path.join(this.outputDir, 'sample.pdf');
      fs.writeFileSync(outputPath, pdfBytes);
      
      this.logger.log(`Sample PDF generated at: ${outputPath}`);
      return outputPath;
    } catch (error) {
      this.logger.error('Error generating sample PDF:', error);
      throw new Error('Failed to generate sample PDF');
    }
  }

  async splitPdf(inputPath: string): Promise<string[]> {
    try {
      this.logger.log(`Starting PDF split process for: ${inputPath}`);
      
      if (!fs.existsSync(inputPath)) {
        throw new Error(`Input file not found: ${inputPath}`);
      }

      const pdfBytes = fs.readFileSync(inputPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const outputPaths: string[] = [];

      // Ordem fixa dos boletos: MARCIA, JOSE, MARCOS
      const order = ['MARCIA', 'JOSE', 'MARCOS'];

      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        this.logger.log(`Processing page ${i + 1}`);
        
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(copiedPage);

        const newPdfBytes = await newPdf.save();
        const outputPath = path.join(this.outputDir, `${i + 1}.pdf`);
        fs.writeFileSync(outputPath, newPdfBytes);
        outputPaths.push(outputPath);
        
        this.logger.log(`Page ${i + 1} saved as: ${outputPath}`);
      }

      this.logger.log('PDF split process completed successfully');
      return outputPaths;
    } catch (error) {
      this.logger.error('Error splitting PDF:', error);
      throw new Error(`Failed to split PDF: ${error.message}`);
    }
  }
} 