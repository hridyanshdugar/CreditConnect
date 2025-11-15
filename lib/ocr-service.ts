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
      case 'credit_card_statement':
        return this.extractCreditCardStatementData(text);
      case 'loan_statement':
        return this.extractLoanStatementData(text);
      case 'debt_statement':
        return this.extractDebtStatementData(text);
      case 'bill':
        return this.extractBillData(text);
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

  private extractCreditCardStatementData(text: string): Record<string, any> {
    const data: Record<string, any> = {};
    
    // Extract current balance
    const balanceMatch = text.match(/balance[:\s]*\$?([\d,]+\.?\d*)/i) ||
                        text.match(/current[:\s]*balance[:\s]*\$?([\d,]+\.?\d*)/i) ||
                        text.match(/new[:\s]*balance[:\s]*\$?([\d,]+\.?\d*)/i);
    if (balanceMatch) {
      data.currentBalance = parseFloat(balanceMatch[1].replace(/,/g, ''));
    }

    // Extract credit limit
    const limitMatch = text.match(/credit[:\s]*limit[:\s]*\$?([\d,]+\.?\d*)/i) ||
                      text.match(/available[:\s]*credit[:\s]*\$?([\d,]+\.?\d*)/i);
    if (limitMatch) {
      data.creditLimit = parseFloat(limitMatch[1].replace(/,/g, ''));
    }

    // Extract minimum payment
    const minPaymentMatch = text.match(/minimum[:\s]*payment[:\s]*\$?([\d,]+\.?\d*)/i) ||
                            text.match(/min[:\s]*payment[:\s]*\$?([\d,]+\.?\d*)/i);
    if (minPaymentMatch) {
      data.minimumPayment = parseFloat(minPaymentMatch[1].replace(/,/g, ''));
    }

    // Extract payment due date
    const dueDateMatch = text.match(/payment[:\s]*due[:\s]*date[:\s]*(\d{1,2}\/\d{1,2}\/?\d{0,4})/i) ||
                        text.match(/due[:\s]*date[:\s]*(\d{1,2}\/\d{1,2}\/?\d{0,4})/i);
    if (dueDateMatch) {
      data.paymentDueDate = dueDateMatch[1];
    }

    // Extract transactions
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
    const accountMatch = text.match(/account[#:\s]*([\d\s*]+)/i) ||
                        text.match(/card[#:\s]*([\d\s*]+)/i);
    if (accountMatch) {
      data.accountNumber = accountMatch[1].trim();
    }

    // Calculate credit utilization
    if (data.currentBalance && data.creditLimit) {
      data.creditUtilization = (data.currentBalance / data.creditLimit) * 100;
    }

    return data;
  }

  private extractLoanStatementData(text: string): Record<string, any> {
    const data: Record<string, any> = {};
    
    // Extract loan balance
    const balanceMatch = text.match(/balance[:\s]*\$?([\d,]+\.?\d*)/i) ||
                        text.match(/principal[:\s]*balance[:\s]*\$?([\d,]+\.?\d*)/i) ||
                        text.match(/outstanding[:\s]*balance[:\s]*\$?([\d,]+\.?\d*)/i);
    if (balanceMatch) {
      data.loanBalance = parseFloat(balanceMatch[1].replace(/,/g, ''));
    }

    // Extract monthly payment
    const paymentMatch = text.match(/monthly[:\s]*payment[:\s]*\$?([\d,]+\.?\d*)/i) ||
                        text.match(/payment[:\s]*amount[:\s]*\$?([\d,]+\.?\d*)/i) ||
                        text.match(/payment[:\s]*due[:\s]*\$?([\d,]+\.?\d*)/i);
    if (paymentMatch) {
      data.monthlyPayment = parseFloat(paymentMatch[1].replace(/,/g, ''));
    }

    // Extract interest rate
    const rateMatch = text.match(/interest[:\s]*rate[:\s]*([\d.]+)%?/i) ||
                     text.match(/apr[:\s]*([\d.]+)%?/i);
    if (rateMatch) {
      data.interestRate = parseFloat(rateMatch[1]);
    }

    // Extract loan type
    const loanTypeMatch = text.match(/(auto|car|vehicle|mortgage|home|personal|student|business)[:\s]*loan/i);
    if (loanTypeMatch) {
      data.loanType = loanTypeMatch[1].toLowerCase();
    }

    // Extract payment due date
    const dueDateMatch = text.match(/payment[:\s]*due[:\s]*date[:\s]*(\d{1,2}\/\d{1,2}\/?\d{0,4})/i) ||
                        text.match(/due[:\s]*date[:\s]*(\d{1,2}\/\d{1,2}\/?\d{0,4})/i);
    if (dueDateMatch) {
      data.paymentDueDate = dueDateMatch[1];
    }

    // Extract account number
    const accountMatch = text.match(/account[#:\s]*(\d+)/i) ||
                        text.match(/loan[#:\s]*(\d+)/i);
    if (accountMatch) {
      data.accountNumber = accountMatch[1];
    }

    // Extract original loan amount
    const originalMatch = text.match(/original[:\s]*loan[:\s]*amount[:\s]*\$?([\d,]+\.?\d*)/i) ||
                            text.match(/principal[:\s]*amount[:\s]*\$?([\d,]+\.?\d*)/i);
    if (originalMatch) {
      data.originalAmount = parseFloat(originalMatch[1].replace(/,/g, ''));
    }

    return data;
  }

  private extractDebtStatementData(text: string): Record<string, any> {
    const data: Record<string, any> = {};
    
    // Extract total debt
    const debtMatch = text.match(/total[:\s]*debt[:\s]*\$?([\d,]+\.?\d*)/i) ||
                      text.match(/outstanding[:\s]*debt[:\s]*\$?([\d,]+\.?\d*)/i) ||
                      text.match(/balance[:\s]*\$?([\d,]+\.?\d*)/i);
    if (debtMatch) {
      data.totalDebt = parseFloat(debtMatch[1].replace(/,/g, ''));
    }

    // Extract monthly payment
    const paymentMatch = text.match(/monthly[:\s]*payment[:\s]*\$?([\d,]+\.?\d*)/i) ||
                        text.match(/payment[:\s]*amount[:\s]*\$?([\d,]+\.?\d*)/i);
    if (paymentMatch) {
      data.monthlyPayment = parseFloat(paymentMatch[1].replace(/,/g, ''));
    }

    // Extract debt type
    const debtTypeMatch = text.match(/(credit card|medical|collection|personal loan|other)[:\s]*debt/i);
    if (debtTypeMatch) {
      data.debtType = debtTypeMatch[1].toLowerCase();
    }

    // Extract creditor name
    const creditorMatch = text.match(/creditor[:\s]*([^\n]+)/i) ||
                        text.match(/lender[:\s]*([^\n]+)/i);
    if (creditorMatch) {
      data.creditor = creditorMatch[1].trim();
    }

    return data;
  }

  private extractBillData(text: string): Record<string, any> {
    const data: Record<string, any> = {};
    
    // Extract bill amount
    const amountMatch = text.match(/amount[:\s]*due[:\s]*\$?([\d,]+\.?\d*)/i) ||
                      text.match(/total[:\s]*due[:\s]*\$?([\d,]+\.?\d*)/i) ||
                      text.match(/balance[:\s]*\$?([\d,]+\.?\d*)/i);
    if (amountMatch) {
      data.billAmount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    // Extract due date
    const dueDateMatch = text.match(/due[:\s]*date[:\s]*(\d{1,2}\/\d{1,2}\/?\d{0,4})/i) ||
                        text.match(/payment[:\s]*due[:\s]*(\d{1,2}\/\d{1,2}\/?\d{0,4})/i);
    if (dueDateMatch) {
      data.dueDate = dueDateMatch[1];
    }

    // Extract bill type
    const billTypeMatch = text.match(/(electric|electricity|gas|water|sewer|internet|phone|rent|mortgage|insurance|utility)/i);
    if (billTypeMatch) {
      data.billType = billTypeMatch[1].toLowerCase();
    }

    // Extract service provider
    const providerMatch = text.match(/from[:\s]*([^\n]+)/i) ||
                        text.match(/service[:\s]*provider[:\s]*([^\n]+)/i);
    if (providerMatch) {
      data.serviceProvider = providerMatch[1].trim();
    }

    // Extract account number
    const accountMatch = text.match(/account[#:\s]*(\d+)/i);
    if (accountMatch) {
      data.accountNumber = accountMatch[1];
    }

    // Extract payment status
    const statusMatch = text.match(/(paid|unpaid|overdue|past due)/i);
    if (statusMatch) {
      data.paymentStatus = statusMatch[1].toLowerCase();
    }

    return data;
  }
}

