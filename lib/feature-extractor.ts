// Feature Extractor - Converts processed document data into UserData format for risk calculation

import { ProcessedDocumentData } from './document-processor';
import { UserData } from './risk-calculator';
import db from './db';

export class FeatureExtractor {
  /**
   * Extract and aggregate features from all processed documents for a user
   */
  extractFeatures(userId: string): UserData {
    // Get all processed financial data for this user
    const allData = db.prepare(`
      SELECT processed_data, data_type, month_year, created_at
      FROM financial_data 
      WHERE user_id = ? AND processed_data IS NOT NULL
      ORDER BY created_at DESC
    `).all(userId) as Array<{
      processed_data: string;
      data_type: string;
      month_year: string | null;
      created_at: string;
    }>;

    if (allData.length === 0) {
      return {};
    }

    // Parse all processed data
    const processedDocs: ProcessedDocumentData[] = allData.map(row => 
      JSON.parse(row.processed_data)
    );

    const userData: UserData = {};

    // Extract income-related features
    this.extractIncomeFeatures(processedDocs, userData);

    // Extract balance and cash flow features
    this.extractCashFlowFeatures(processedDocs, userData);

    // Extract payment behavior features
    this.extractPaymentFeatures(processedDocs, userData);

    // Extract debt features
    this.extractDebtFeatures(processedDocs, userData);

    // Set default values for missing critical fields
    this.setDefaults(userData);

    return userData;
  }

  private extractIncomeFeatures(
    docs: ProcessedDocumentData[],
    userData: UserData
  ): void {
    const payStubs = docs.filter(d => d.monthlyIncome !== undefined);
    const taxReturns = docs.filter(d => d.taxYear !== undefined);

    // Calculate monthly income from pay stubs
    if (payStubs.length > 0) {
      const incomes = payStubs.map(d => d.monthlyIncome!);
      userData.monthlyIncome = this.average(incomes);

      if (payStubs.length > 1) {
        userData.monthlyIncomeVariance = this.calculateCoefficientOfVariation(incomes);
      }

      // Estimate employment duration based on pay stub dates
      // This would be more accurate with actual employment start dates
      if (payStubs.length >= 2) {
        userData.employmentDuration = payStubs.length * 2; // Assume bi-weekly pay
      }
    }

    // Use tax return for annual income verification
    if (taxReturns.length > 0) {
      const taxIncome = taxReturns[0].monthlyIncome;
      if (taxIncome) {
        // Verify pay stub income matches tax return
        if (userData.monthlyIncome) {
          const annualFromStubs = userData.monthlyIncome * 12;
          const annualFromTax = taxIncome * 12;
          const difference = Math.abs(annualFromStubs - annualFromTax) / annualFromTax;
          
          // If difference is significant, use tax return as more reliable
          if (difference > 0.2) {
            userData.monthlyIncome = taxIncome;
          }
        } else {
          userData.monthlyIncome = taxIncome;
        }
      }
    }

    // Count income streams (multiple employers, business income, etc.)
    const uniqueEmployers = new Set(
      docs
        .filter(d => d.employer)
        .map(d => d.employer!)
    );
    userData.multipleIncomeStreams = uniqueEmployers.size;
  }

  private extractCashFlowFeatures(
    docs: ProcessedDocumentData[],
    userData: UserData
  ): void {
    const bankStatements = docs.filter(d => d.averageMonthlyBalance !== undefined);

    if (bankStatements.length > 0) {
      const balances = bankStatements.map(d => d.averageMonthlyBalance!);
      userData.averageMonthlyBalance = this.average(balances);

      // Calculate overdraft frequency
      const overdraftCounts = bankStatements
        .filter(d => d.overdraftFrequency !== undefined)
        .map(d => d.overdraftFrequency!);
      
      if (overdraftCounts.length > 0) {
        userData.overdraftFrequency = this.average(overdraftCounts);
      }

      // Calculate savings rate
      const savingsRates = bankStatements
        .filter(d => d.savingsRate !== undefined)
        .map(d => d.savingsRate!);
      
      if (savingsRates.length > 0) {
        userData.savingsRate = this.average(savingsRates);
      }

      // Estimate emergency fund coverage
      if (userData.monthlyIncome && userData.averageMonthlyBalance) {
        const monthsOfExpenses = userData.averageMonthlyBalance / (userData.monthlyIncome * 0.7); // Assume 70% expenses
        userData.emergencyFundCoverage = Math.max(0, monthsOfExpenses);
      }
    }
  }

  private extractPaymentFeatures(
    docs: ProcessedDocumentData[],
    userData: UserData
  ): void {
    const bankStatements = docs.filter(d => d.paymentTimeliness !== undefined);

    if (bankStatements.length > 0) {
      const timelinessScores = bankStatements.map(d => d.paymentTimeliness!);
      userData.paymentTimeliness = this.average(timelinessScores);
      
      // Use same score for bill payment consistency
      userData.billPaymentConsistency = userData.paymentTimeliness;
      
      // Assume rent and utility payments follow similar pattern
      userData.rentPaymentHistory = userData.paymentTimeliness;
      userData.utilityPaymentPatterns = userData.paymentTimeliness;
    }
  }

  private extractDebtFeatures(
    docs: ProcessedDocumentData[],
    userData: UserData
  ): void {
    // Extract debt payments from transactions
    const allTransactions: Array<{ amount: number; description: string }> = [];
    
    docs.forEach(doc => {
      if (doc.transactions) {
        allTransactions.push(...doc.transactions);
      }
    });

    // Identify recurring debt payments (loans, credit cards, etc.)
    const debtPayments = this.identifyDebtPayments(allTransactions);
    const monthlyDebtPayments = this.calculateMonthlyDebtPayments(debtPayments);

    if (userData.monthlyIncome && monthlyDebtPayments > 0) {
      userData.debtToIncomeRatio = monthlyDebtPayments / userData.monthlyIncome;
    }

    // Calculate credit utilization (simplified)
    // In production, this would come from credit reports
    if (debtPayments.length > 0) {
      userData.creditUtilization = Math.min(100, (monthlyDebtPayments / (userData.monthlyIncome || 1)) * 100);
    }
  }

  private identifyDebtPayments(
    transactions: Array<{ amount: number; description: string }>
  ): Array<{ amount: number; description: string }> {
    // Identify recurring negative transactions that look like debt payments
    const debtKeywords = [
      'loan', 'credit', 'mortgage', 'car payment', 'auto loan',
      'student loan', 'personal loan', 'debt', 'minimum payment'
    ];

    return transactions.filter(t => {
      const desc = t.description.toLowerCase();
      return t.amount < 0 && debtKeywords.some(keyword => desc.includes(keyword));
    });
  }

  private calculateMonthlyDebtPayments(
    debtPayments: Array<{ amount: number }>
  ): number {
    if (debtPayments.length === 0) return 0;

    // Group by similar amounts (recurring payments)
    const amounts = debtPayments.map(d => Math.abs(d.amount));
    const uniqueAmounts = [...new Set(amounts)];
    
    // Sum up recurring payments (assume amounts that appear multiple times are monthly)
    let monthlyTotal = 0;
    for (const amount of uniqueAmounts) {
      const count = amounts.filter(a => Math.abs(a - amount) < 1).length;
      if (count >= 2) { // Appears at least twice = recurring
        monthlyTotal += amount;
      }
    }

    return monthlyTotal;
  }

  private setDefaults(userData: UserData): void {
    // Set reasonable defaults for fields that might be missing
    if (!userData.documentAuthenticity) {
      userData.documentAuthenticity = 90; // Assume uploaded documents are authentic
    }
    
    if (userData.addressVerification === undefined) {
      userData.addressVerification = true; // Can be verified from uploaded documents
    }

    if (!userData.phoneNumberStability) {
      userData.phoneNumberStability = 12; // Default assumption
    }

    // Set profile completeness based on available data
    const fields = [
      userData.monthlyIncome,
      userData.averageMonthlyBalance,
      userData.paymentTimeliness,
      userData.debtToIncomeRatio
    ];
    const filledFields = fields.filter(f => f !== undefined).length;
    userData.profileCompleteness = (filledFields / fields.length) * 100;
  }

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private calculateCoefficientOfVariation(numbers: number[]): number {
    if (numbers.length < 2) return 0;
    
    const avg = this.average(numbers);
    const variance = numbers.reduce((sum, num) => sum + Math.pow(num - avg, 2), 0) / numbers.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev / avg; // Coefficient of variation
  }
}

