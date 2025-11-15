// OCR Service for extracting text from documents
// For production, consider using AWS Textract or Google Document AI

export interface ExtractedText {
  text: string;
  confidence: number;
  blocks?: Array<{
    text: string;
    boundingBox?: any;
  }>;
}

export class OCRService {
  /**
   * Extract text from an image or PDF file
   * This is a simplified version - in production, use AWS Textract or similar
   */
  async extractText(filePath: string, fileType: string): Promise<ExtractedText> {
    // For now, return a placeholder structure
    // In production, integrate with:
    // - AWS Textract for PDFs and images
    // - Google Document AI
    // - Tesseract.js for local processing (slower, less accurate)
    
    try {
      // If using Tesseract.js (for development/testing)
      if (process.env.USE_TESSERACT === 'true') {
        const Tesseract = require('tesseract.js');
        const { data } = await Tesseract.recognize(filePath, 'eng', {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              // Progress logging
            }
          }
        });
        
        return {
          text: data.text,
          confidence: data.confidence,
          blocks: data.words?.map((w: any) => ({
            text: w.text,
            boundingBox: w.bbox
          }))
        };
      }
      
      // Placeholder for production OCR service
      return {
        text: '',
        confidence: 0,
        blocks: []
      };
    } catch (error) {
      console.error('OCR extraction error:', error);
      throw new Error('Failed to extract text from document');
    }
  }

  /**
   * Extract structured data from extracted text based on document type
   */
  extractStructuredData(text: string, documentType: string): Record<string, any> {
    const data: Record<string, any> = {};

    switch (documentType) {
      case 'bank_statement':
        return this.extractBankStatementData(text);
      case 'pay_stub':
        return this.extractPayStubData(text);
      case 'tax_return':
        return this.extractTaxReturnData(text);
      default:
        return data;
    }
  }

  private extractBankStatementData(text: string): Record<string, any> {
    const data: Record<string, any> = {};
    
    // Extract account balance
    const balanceMatch = text.match(/balance[:\s]*\$?([\d,]+\.?\d*)/i);
    if (balanceMatch) {
      data.currentBalance = parseFloat(balanceMatch[1].replace(/,/g, ''));
    }

    // Extract transactions (simplified pattern)
    const transactionPattern = /(\d{1,2}\/\d{1,2}\/?\d{0,4})\s+([^\n]+?)\s+([-+]?)\$?([\d,]+\.?\d*)/gi;
    const transactions: any[] = [];
    let match;
    
    while ((match = transactionPattern.exec(text)) !== null) {
      transactions.push({
        date: match[1],
        description: match[2].trim(),
        amount: parseFloat(match[4].replace(/,/g, '')) * (match[3] === '-' ? -1 : 1)
      });
    }
    
    data.transactions = transactions;

    // Extract account number
    const accountMatch = text.match(/account[#:\s]*(\d+)/i);
    if (accountMatch) {
      data.accountNumber = accountMatch[1];
    }

    return data;
  }

  private extractPayStubData(text: string): Record<string, any> {
    const data: Record<string, any> = {};
    
    // Extract gross pay
    const grossMatch = text.match(/gross[:\s]*pay[:\s]*\$?([\d,]+\.?\d*)/i) ||
                   text.match(/gross[:\s]*\$?([\d,]+\.?\d*)/i);
    if (grossMatch) {
      data.grossPay = parseFloat(grossMatch[1].replace(/,/g, ''));
    }

    // Extract net pay
    const netMatch = text.match(/net[:\s]*pay[:\s]*\$?([\d,]+\.?\d*)/i) ||
                text.match(/net[:\s]*\$?([\d,]+\.?\d*)/i);
    if (netMatch) {
      data.netPay = parseFloat(netMatch[1].replace(/,/g, ''));
    }

    // Extract pay period
    const periodMatch = text.match(/pay[:\s]*period[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})\s*-\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
    if (periodMatch) {
      data.payPeriodStart = periodMatch[1];
      data.payPeriodEnd = periodMatch[2];
    }

    // Extract employer name
    const employerMatch = text.match(/employer[:\s]*([^\n]+)/i);
    if (employerMatch) {
      data.employer = employerMatch[1].trim();
    }

    // Extract YTD gross
    const ytdMatch = text.match(/ytd[:\s]*gross[:\s]*\$?([\d,]+\.?\d*)/i);
    if (ytdMatch) {
      data.ytdGross = parseFloat(ytdMatch[1].replace(/,/g, ''));
    }

    return data;
  }

  private extractTaxReturnData(text: string): Record<string, any> {
    const data: Record<string, any> = {};
    
    // Extract adjusted gross income
    const agiMatch = text.match(/adjusted[:\s]*gross[:\s]*income[:\s]*\$?([\d,]+\.?\d*)/i) ||
                    text.match(/agi[:\s]*\$?([\d,]+\.?\d*)/i);
    if (agiMatch) {
      data.adjustedGrossIncome = parseFloat(agiMatch[1].replace(/,/g, ''));
    }

    // Extract total income
    const incomeMatch = text.match(/total[:\s]*income[:\s]*\$?([\d,]+\.?\d*)/i);
    if (incomeMatch) {
      data.totalIncome = parseFloat(incomeMatch[1].replace(/,/g, ''));
    }

    // Extract tax year
    const yearMatch = text.match(/(20\d{2})[:\s]*tax[:\s]*return/i) ||
                     text.match(/tax[:\s]*year[:\s]*(20\d{2})/i);
    if (yearMatch) {
      data.taxYear = yearMatch[1];
    }

    // Extract filing status
    const statusMatch = text.match(/filing[:\s]*status[:\s]*([^\n]+)/i);
    if (statusMatch) {
      data.filingStatus = statusMatch[1].trim();
    }

    return data;
  }
}

