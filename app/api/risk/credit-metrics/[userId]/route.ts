import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { FeatureExtractor } from '@/lib/feature-extractor';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Get all processed financial data
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

    // Parse processed data
    const processedDocs = allData.map(row => JSON.parse(row.processed_data));

    // Calculate credit metrics
    const metrics = calculateCreditMetrics(processedDocs, allData);

    return NextResponse.json(metrics);
  } catch (error: any) {
    console.error('Error calculating credit metrics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate credit metrics' },
      { status: 500 }
    );
  }
}

function calculateCreditMetrics(processedDocs: any[], allData: any[]) {
  // 1. Payment History (35%)
  const paymentHistory = calculatePaymentHistory(processedDocs, allData);

  // 2. Credit Utilization (30%)
  const creditUtilization = calculateCreditUtilization(processedDocs);

  // 3. Credit Age (15%)
  const creditAge = calculateCreditAge(processedDocs, allData);

  // 4. Recent Credit Inquiries (10%)
  const creditInquiries = calculateCreditInquiries(processedDocs, allData);

  // 5. Credit Mix (10%)
  const creditMix = calculateCreditMix(processedDocs);

  return {
    paymentHistory,
    creditUtilization,
    creditAge,
    creditInquiries,
    creditMix,
  };
}

function calculatePaymentHistory(processedDocs: any[], allData: any[]) {
  // Generate 24 months of payment history
  const months: Array<{
    month: string;
    status: 'on-time' | 'late-30' | 'late-60' | 'missed';
    date: string;
  }> = [];

  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    // Find bills and payments for this month
    const monthData = allData.filter(d => d.month_year === monthKey);
    const bills = monthData.filter(d => d.data_type === 'bill');
    
    let status: 'on-time' | 'late-30' | 'late-60' | 'missed' = 'on-time';
    
    for (const bill of bills) {
      const billData = JSON.parse(bill.processed_data);
      if (billData.billPaymentStatus) {
        if (billData.billPaymentStatus === 'paid') {
          status = 'on-time';
        } else if (billData.billPaymentStatus === 'overdue' || billData.billPaymentStatus === 'past due') {
          // Calculate days overdue
          if (billData.billDueDate) {
            try {
              const dueDate = new Date(billData.billDueDate);
              const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
              if (daysOverdue >= 60) {
                status = 'missed';
              } else if (daysOverdue >= 30) {
                status = 'late-60';
              } else {
                status = 'late-30';
              }
            } catch {
              status = 'late-30';
            }
          } else {
            status = 'late-30';
          }
        } else {
          status = 'missed';
        }
      }
    }

    months.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      status,
      date: monthKey,
    });
  }

  // Calculate on-time payment rate
  const onTimeCount = months.filter(m => m.status === 'on-time').length;
  const onTimeRate = (onTimeCount / months.length) * 100;

  // Calculate current streak
  let currentStreak = 0;
  for (let i = months.length - 1; i >= 0; i--) {
    if (months[i].status === 'on-time') {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    months,
    onTimeRate: Math.round(onTimeRate * 10) / 10,
    currentStreak,
    totalPayments: months.length,
    onTimePayments: onTimeCount,
  };
}

function calculateCreditUtilization(processedDocs: any[]) {
  const creditCards = processedDocs.filter(d => d.creditCardBalance !== undefined);
  
  let totalCreditUsed = 0;
  let totalCreditLimit = 0;

  for (const card of creditCards) {
    totalCreditUsed += card.creditCardBalance || 0;
    totalCreditLimit += card.creditLimit || 0;
  }

  const utilization = totalCreditLimit > 0 
    ? (totalCreditUsed / totalCreditLimit) * 100 
    : 0;

  // Determine zone
  let zone: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
  if (utilization >= 50) zone = 'poor';
  else if (utilization >= 30) zone = 'fair';
  else if (utilization >= 10) zone = 'good';

  return {
    utilization: Math.round(utilization * 10) / 10,
    totalCreditUsed: Math.round(totalCreditUsed),
    totalCreditLimit: Math.round(totalCreditLimit),
    zone,
  };
}

function calculateCreditAge(processedDocs: any[], allData: any[]) {
  // Find oldest account opening date
  const accountDates: Date[] = [];
  const accountTypes: string[] = [];
  
  // Extract dates from all documents
  for (let i = 0; i < allData.length; i++) {
    const data = allData[i];
    const doc = processedDocs[i] || {};
    if (data.created_at) {
      accountDates.push(new Date(data.created_at));
      // Determine account type
      if (doc.creditCardBalance !== undefined) {
        accountTypes.push('Credit Card');
      } else if (doc.loanBalance !== undefined) {
        accountTypes.push(doc.loanType || 'Loan');
      } else if (doc.billAmount !== undefined) {
        accountTypes.push('Bill');
      } else {
        accountTypes.push('Other');
      }
    }
  }

  if (accountDates.length === 0) {
    return {
      oldestAccountAge: 0,
      averageAccountAge: 0,
      accountCount: 0,
      accounts: [],
    };
  }

  const oldestDate = new Date(Math.min(...accountDates.map(d => d.getTime())));
  const now = new Date();
  const oldestAccountAge = Math.floor((now.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

  // Calculate average age
  const ages = accountDates.map(date => 
    Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  );
  const averageAccountAge = ages.reduce((a, b) => a + b, 0) / ages.length;

  // Group accounts by type
  const accounts = accountDates.map((date, idx) => {
    const type = accountTypes[idx] || 'Other';
    const age = ages[idx] || 0;
    
    return {
      type,
      age: Math.round(age * 10) / 10,
      openedDate: date,
    };
  });

  return {
    oldestAccountAge: Math.round(oldestAccountAge * 10) / 10,
    averageAccountAge: Math.round(averageAccountAge * 10) / 10,
    accountCount: accountDates.length,
    accounts: accounts.slice(0, 10), // Limit to 10 most recent
  };
}

function calculateCreditInquiries(processedDocs: any[], allData: any[]) {
  // Simulate inquiries based on recent account openings
  const now = new Date();
  const inquiries: Array<{
    month: string;
    count: number;
    date: string;
  }> = [];

  // Group by month
  const monthMap = new Map<string, number>();
  
  for (const data of allData) {
    const date = new Date(data.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
  }

  // Generate last 24 months
  for (let i = 23; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    inquiries.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      count: monthMap.get(monthKey) || 0,
      date: monthKey,
    });
  }

  // Calculate totals
  const last6Months = inquiries.slice(-6);
  const last12Months = inquiries.slice(-12);
  const last24Months = inquiries;

  const total6Months = last6Months.reduce((sum, i) => sum + i.count, 0);
  const total12Months = last12Months.reduce((sum, i) => sum + i.count, 0);
  const total24Months = last24Months.reduce((sum, i) => sum + i.count, 0);

  return {
    inquiries,
    totals: {
      last6Months: total6Months,
      last12Months: total12Months,
      last24Months: total24Months,
    },
    hasSurge: total6Months > 2,
  };
}

function calculateCreditMix(processedDocs: any[]) {
  const types = new Set<string>();

  for (const doc of processedDocs) {
    if (doc.creditCardBalance !== undefined) {
      types.add('Revolving');
    }
    if (doc.loanBalance !== undefined) {
      types.add('Installment');
    }
    if (doc.billAmount !== undefined) {
      types.add('Utility');
    }
  }

  // Count each type
  const creditCards = processedDocs.filter(d => d.creditCardBalance !== undefined).length;
  const loans = processedDocs.filter(d => d.loanBalance !== undefined).length;
  const bills = processedDocs.filter(d => d.billAmount !== undefined).length;

  return {
    types: Array.from(types),
    typeCount: types.size,
    breakdown: {
      creditCards,
      loans,
      bills,
      total: creditCards + loans + bills,
    },
  };
}

