// Document Processor - Extracts structured data from various document types

import { OCRService, ExtractedText } from './ocr-service';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

export interface ProcessedDocumentData {
  // Financial Stability Metrics
  monthlyIncome?: number;
  monthlyIncomeVariance?: number;
  employmentDuration?: number;
  averageMonthlyBalance?: number;
  overdraftFrequency?: number;
  savingsRate?: number;
  debtToIncomeRatio?: number;
  paymentTimeliness?: number;
  
  // Additional extracted data
  transactions?: Array<{
    date: string;
    description: string;
    amount: number;
  }>;
  accountNumber?: string;
  employer?: string;
  payPeriod?: {
    start: string;
    end: string;
  };
  taxYear?: string;
}

export class DocumentProcessor {
  private ocrService: OCRService;

  constructor() {
    this.ocrService = new OCRService();
  }

  async processBankStatement(filePath: string): Promise<ProcessedDocumentData> {
    if (!existsSync(filePath)) {
      throw new Error('File not found');
    }

    // Extract text using OCR
    const extracted = await this.ocrService.extractText(filePath, 'image/pdf');
    const structuredData = this.ocrService.extractStructuredData(extracted.text, 'bank_statement');

    // Process transactions to calculate metrics
    const data: ProcessedDocumentData = {
      transactions: structuredData.transactions || []
    };

    if (structuredData.transactions && structuredData.transactions.length > 0) {
      data.averageMonthlyBalance = this.calculateAverageBalance(structuredData.transactions);
      data.overdraftFrequency = this.countOverdrafts(structuredData.transactions);
      data.paymentTimeliness = this.calculatePaymentTimeliness(structuredData.transactions);
      data.savingsRate = this.calculateSavingsRate(structuredData.transactions);
    }

    if (structuredData.currentBalance) {
      data.averageMonthlyBalance = structuredData.currentBalance;
    }

    return data;
  }

  async processPayStub(filePath: string): Promise<ProcessedDocumentData> {
    if (!existsSync(filePath)) {
      throw new Error('File not found');
    }

    const extracted = await this.ocrService.extractText(filePath, 'image/pdf');
    const structuredData = this.ocrService.extractStructuredData(extracted.text, 'pay_stub');

    const data: ProcessedDocumentData = {};

    if (structuredData.grossPay) {
      // Determine if this is weekly, bi-weekly, monthly, etc.
      const isMonthly = structuredData.payPeriodStart && structuredData.payPeriodEnd;
      if (isMonthly) {
        data.monthlyIncome = structuredData.grossPay;
      } else {
        // Assume bi-weekly if not specified
        data.monthlyIncome = structuredData.grossPay * 2.17; // Approximate monthly
      }
    }

    if (structuredData.employer) {
      data.employer = structuredData.employer;
    }

    if (structuredData.payPeriodStart && structuredData.payPeriodEnd) {
      data.payPeriod = {
        start: structuredData.payPeriodStart,
        end: structuredData.payPeriodEnd
      };
    }

    return data;
  }

  async processTaxReturn(filePath: string): Promise<ProcessedDocumentData> {
    if (!existsSync(filePath)) {
      throw new Error('File not found');
    }

    const extracted = await this.ocrService.extractText(filePath, 'image/pdf');
    const structuredData = this.ocrService.extractStructuredData(extracted.text, 'tax_return');

    const data: ProcessedDocumentData = {};

    // Use AGI or total income
    const annualIncome = structuredData.adjustedGrossIncome || structuredData.totalIncome;
    if (annualIncome) {
      data.monthlyIncome = annualIncome / 12;
    }

    if (structuredData.taxYear) {
      data.taxYear = structuredData.taxYear;
    }

    return data;
  }

  private calculateAverageBalance(transactions: Array<{ date: string; amount: number }>): number {
    // Group transactions by month and calculate running balance
    const monthlyBalances: number[] = [];
    let balance = 0;

    // Sort transactions by date
    const sorted = transactions.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    let currentMonth = '';
    let monthBalance = 0;
    let dayCount = 0;

    for (const transaction of sorted) {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

      if (currentMonth !== monthKey && currentMonth !== '') {
        monthlyBalances.push(monthBalance / dayCount);
        monthBalance = 0;
        dayCount = 0;
      }

      balance += transaction.amount;
      monthBalance += balance;
      dayCount++;
      currentMonth = monthKey;
    }

    if (dayCount > 0) {
      monthlyBalances.push(monthBalance / dayCount);
    }

    return monthlyBalances.length > 0
      ? monthlyBalances.reduce((a, b) => a + b, 0) / monthlyBalances.length
      : balance;
  }

  private countOverdrafts(transactions: Array<{ amount: number }>): number {
    let balance = 0;
    let overdraftCount = 0;

    for (const transaction of transactions) {
      balance += transaction.amount;
      if (balance < 0) {
        overdraftCount++;
      }
    }

    return overdraftCount;
  }

  private calculatePaymentTimeliness(transactions: Array<{ date: string; description: string; amount: number }>): number {
    // Identify bill payments (recurring negative amounts)
    const billPayments = transactions.filter(t => 
      t.amount < 0 && 
      (t.description.toLowerCase().includes('payment') ||
       t.description.toLowerCase().includes('bill') ||
       t.description.toLowerCase().includes('utility'))
    );

    if (billPayments.length === 0) return 50; // Default if no bills found

    // Calculate consistency (simplified - in production, use actual due dates)
    // For now, assume payments are on time if they occur regularly
    const paymentDates = billPayments.map(t => new Date(t.date).getTime());
    const intervals: number[] = [];

    for (let i = 1; i < paymentDates.length; i++) {
      intervals.push(paymentDates[i] - paymentDates[i - 1]);
    }

    if (intervals.length === 0) return 50;

    // Calculate variance in intervals (lower variance = more consistent)
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => {
      return sum + Math.pow(interval - avgInterval, 2);
    }, 0) / intervals.length;

    // Convert to 0-100 score (lower variance = higher score)
    const coefficientOfVariation = Math.sqrt(variance) / avgInterval;
    return Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 100)));
  }

  private calculateSavingsRate(transactions: Array<{ amount: number }>): number {
    const deposits = transactions.filter(t => t.amount > 0);
    const withdrawals = transactions.filter(t => t.amount < 0);

    const totalDeposits = deposits.reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = Math.abs(withdrawals.reduce((sum, t) => sum + t.amount, 0));

    if (totalDeposits === 0) return 0;

    const netSavings = totalDeposits - totalWithdrawals;
    return (netSavings / totalDeposits) * 100;
  }
}

