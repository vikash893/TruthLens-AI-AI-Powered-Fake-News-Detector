import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { logger } from '../utils/logger';

export interface ExtractedDocument {
  extractedText: string;
  pageCount: number;
  fileSizeBytes: number;
  fileName: string;
}

export class DocumentService {
  async extractText(filePath: string, originalFileName: string): Promise<ExtractedDocument> {
    const ext = path.extname(originalFileName).toLowerCase();
    const stats = fs.statSync(filePath);

    if (ext === '.txt') {
      const text = fs.readFileSync(filePath, 'utf-8');
      return {
        extractedText: text.trim(),
        pageCount: 1,
        fileSizeBytes: stats.size,
        fileName: originalFileName
      };
    } else if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer, {
        max: 20 // Enforce max 20 pages limit
      });

      const extracted = pdfData.text.trim();
      logger.info(`Extracted ${extracted.length} chars from PDF (${pdfData.numpages} pages)`);

      return {
        extractedText: extracted,
        pageCount: pdfData.numpages,
        fileSizeBytes: stats.size,
        fileName: originalFileName
      };
    } else {
      throw new Error(`Unsupported document extension: ${ext}`);
    }
  }
}

export const documentService = new DocumentService();
