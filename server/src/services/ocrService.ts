import Tesseract from 'tesseract.js';
import { logger } from '../utils/logger';

export interface OCRResult {
  extractedText: string;
  confidence: number;
  disclaimer: string;
}

export class OCRService {
  async extractTextFromImage(filePath: string): Promise<OCRResult> {
    logger.info(`Running Tesseract OCR on image: ${filePath}`);
    try {
      const result = await Tesseract.recognize(filePath, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text' && m.progress % 0.25 === 0) {
            logger.info(`OCR progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      const text = result.data.text.trim();
      logger.info(`OCR extracted ${text.length} characters with confidence ${result.data.confidence}%`);

      return {
        extractedText: text,
        confidence: Math.round(result.data.confidence) / 100,
        disclaimer: 'Text extracted via optical character recognition. OCR extraction does NOT authenticate the image or prove its veracity.'
      };
    } catch (err: any) {
      logger.error(`OCR processing failed: ${err.message}`);
      throw new Error(`Failed to extract text from image: ${err.message}`);
    }
  }
}

export const ocrService = new OCRService();
