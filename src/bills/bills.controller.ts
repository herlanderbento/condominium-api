import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BillsService } from './bills.service';
import { PdfService } from './services/pdf.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('bills')
export class BillsController {
  private readonly logger = new Logger(BillsController.name);

  constructor(
    private readonly billsService: BillsService,
    private readonly pdfService: PdfService,
  ) {}

  @Get()
  async findAll(
    @Query('name') name?: string,
    @Query('valor_inicial') minAmount?: number,
    @Query('valor_final') maxAmount?: number,
    @Query('id_lote') lotId?: number,
    @Query('relatorio') report?: string,
  ) {
    const bills = await this.billsService.findAll({
      name,
      minAmount,
      maxAmount,
      lotId,
    });

    if (report === '1') {
      const { base64, filePath } = await this.billsService.generatePdfReport(bills);
      this.logger.log(`PDF report generated at: ${filePath}`);
      return {
        base64,
        filePath
      };
    }

    return bills;
  }

  @Post('import-csv')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const tempPath = path.join(process.cwd(), 'temp', file.originalname);
    fs.writeFileSync(tempPath, file.buffer);

    try {
      const bills = await this.billsService.importFromCsv(tempPath);
      fs.unlinkSync(tempPath);
      return bills;
    } catch (error) {
      fs.unlinkSync(tempPath);
      throw new BadRequestException('Failed to process CSV file');
    }
  }

  @Post('generate-sample-pdf')
  async generateSamplePdf() {
    try {
      this.logger.log('Generating sample PDF...');
      const outputPath = await this.pdfService.generateSamplePdf();
      return { path: outputPath };
    } catch (error) {
      this.logger.error('Error generating sample PDF:', error);
      throw new BadRequestException('Failed to generate sample PDF');
    }
  }

  @Post('split-pdf')
  @UseInterceptors(FileInterceptor('file'))
  async splitPdf(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.endsWith('.pdf')) {
      throw new BadRequestException('File must be a PDF');
    }

    const tempPath = path.join(process.cwd(), 'temp', file.originalname);

    try {
      // Ensure temp directory exists
      if (!fs.existsSync('temp')) {
        fs.mkdirSync('temp', { recursive: true, mode: 0o755 });
      }

      this.logger.log(`Saving uploaded file to: ${tempPath}`);
      fs.writeFileSync(tempPath, file.buffer);

      this.logger.log('Starting PDF split process...');
      const outputPaths = await this.pdfService.splitPdf(tempPath);
      
      this.logger.log('Cleaning up temporary file...');
      fs.unlinkSync(tempPath);
      
      this.logger.log('PDF split completed successfully');
      return { paths: outputPaths };
    } catch (error) {
      this.logger.error('Error processing PDF:', error);
      
      // Clean up temp file if it exists
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      
      throw new BadRequestException(`Failed to process PDF: ${error.message}`);
    }
  }
}
