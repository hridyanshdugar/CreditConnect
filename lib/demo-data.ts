// Demo Data Script for Investor Pitch
// This script populates the database with realistic demo data including:
// - 3 client users with different risk profiles (prime, near-prime, subprime)
// - 5 Canadian banks with 10+ products (credit cards, loans, mortgages)
// - Risk profiles, applications, and product matches

import db from './db';
import { hashPassword } from './auth';
import { randomUUID } from 'crypto';
import { HelixRiskCalculator } from './risk-calculator';

const DEMO_PASSWORD = 'Demo123!';

interface DemoUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'bank';
  bankName?: string;
  profileData?: any;
}

export async function seedDemoData() {
  console.log('🌱 Seeding demo data...');

  // Always clear existing demo data before seeding
  clearDemoData();

  // Create demo users
  const users = await createDemoUsers();
  
  // Create risk profiles for client users
  await createRiskProfiles(users.clients);
  
  // Create products for bank users
  await createProducts(users.banks);
  
  // Create some sample applications
  await createSampleApplications(users.clients, users.banks);
  
  // Create product matches (pre-approvals)
  await createProductMatches(users.clients, users.banks);

  // Create sample financial documents for credit metrics
  await createSampleFinancialDocuments(users.clients);

  console.log('✅ Demo data seeded successfully!');
  console.log('\n📋 Demo Account Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('CLIENT ACCOUNTS:');
  console.log('  Prime Customer:');
  console.log('    Email: prime@demo.com');
  console.log(`    Password: ${DEMO_PASSWORD}`);
  console.log('  Near-Prime Customer:');
  console.log('    Email: nearprime@demo.com');
  console.log(`    Password: ${DEMO_PASSWORD}`);
  console.log('  Subprime Customer:');
  console.log('    Email: subprime@demo.com');
  console.log(`    Password: ${DEMO_PASSWORD}`);
  console.log('\nBANK ACCOUNTS:');
  users.banks.forEach((bank, idx) => {
    console.log(`  ${bank.bankName}:`);
    console.log(`    Email: ${bank.email}`);
    console.log(`    Password: ${DEMO_PASSWORD}`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

async function createDemoUsers() {
  const clients: any[] = [];
  const banks: any[] = [];

  // Always create fresh demo users (clearDemoData already removed old ones)
  console.log('   Creating demo users...');

  // Create 3 client users with different profiles - more realistic scenarios
  const clientData = [
    {
      email: 'prime@demo.com',
      firstName: 'Sarah',
      lastName: 'Chen',
      profile: {
        monthlyIncome: 8500,
        employmentDuration: 72, // 6 years at current job
        debtToIncomeRatio: 0.22, // $1,870 monthly debt payments / $8,500 income
        paymentTimeliness: 98,
        averageMonthlyBalance: 18000,
        savingsRate: 0.25, // Saves 25% of income
        emergencyFundCoverage: 8, // 8 months of expenses saved
        propertyOwnership: true,
        vehicleOwnership: true,
        investmentAccounts: 3, // RRSP, TFSA, Investment account
        educationLevel: 90, // University degree
        residentialStability: 60, // 5 years at current address
        billPaymentConsistency: 98,
        rentPaymentHistory: 100, // Owns property, no rent
        utilityPaymentPatterns: 98,
        creditUtilization: 12, // Low utilization
        multipleIncomeStreams: 1,
      },
    },
    {
      email: 'nearprime@demo.com',
      firstName: 'Michael',
      lastName: 'Rodriguez',
      profile: {
        monthlyIncome: 5200,
        employmentDuration: 24, // 2 years at current job
        debtToIncomeRatio: 0.38, // $1,976 monthly debt payments / $5,200 income
        paymentTimeliness: 85,
        averageMonthlyBalance: 3500,
        savingsRate: 0.12, // Saves 12% of income
        emergencyFundCoverage: 3, // 3 months of expenses saved
        propertyOwnership: false,
        vehicleOwnership: true,
        investmentAccounts: 1, // Just a TFSA
        educationLevel: 70, // Some college/trade school
        residentialStability: 18, // 1.5 years at current address
        billPaymentConsistency: 85,
        rentPaymentHistory: 88, // Rents, mostly on time
        utilityPaymentPatterns: 82,
        creditUtilization: 38, // Moderate utilization
        multipleIncomeStreams: 1,
      },
    },
    {
      email: 'subprime@demo.com',
      firstName: 'James',
      lastName: 'Thompson',
      profile: {
        monthlyIncome: 3200,
        employmentDuration: 8, // 8 months at current job
        debtToIncomeRatio: 0.58, // $1,856 monthly debt payments / $3,200 income
        paymentTimeliness: 68,
        averageMonthlyBalance: 800,
        savingsRate: 0.03, // Saves only 3% of income
        emergencyFundCoverage: 0.5, // Less than 1 month saved
        propertyOwnership: false,
        vehicleOwnership: false,
        investmentAccounts: 0,
        educationLevel: 50, // High school diploma
        residentialStability: 6, // 6 months at current address
        billPaymentConsistency: 65,
        rentPaymentHistory: 70, // Rents, sometimes late
        utilityPaymentPatterns: 60,
        creditUtilization: 75, // High utilization
        multipleIncomeStreams: 1,
      },
    },
  ];

  for (const client of clientData) {
    const userId = randomUUID();
    const passwordHash = await hashPassword(DEMO_PASSWORD);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, password_hash, role, first_name, last_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, client.email, passwordHash, 'client', client.firstName, client.lastName, now, now);

    const profileId = randomUUID();
    db.prepare(`
      INSERT INTO client_profiles (id, user_id, monthly_income, employment_duration, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(profileId, userId, client.profile.monthlyIncome, client.profile.employmentDuration, now, now);

    clients.push({ userId, profileId, email: client.email, profile: client.profile });
  }

  // Create 5 Canadian bank users
  const bankData = [
    { name: 'Royal Bank of Canada', email: 'rbc@demo.com' },
    { name: 'Toronto-Dominion Bank', email: 'td@demo.com' },
    { name: 'Bank of Nova Scotia', email: 'scotiabank@demo.com' },
    { name: 'Bank of Montreal', email: 'bmo@demo.com' },
    { name: 'Canadian Imperial Bank of Commerce', email: 'cibc@demo.com' },
  ];

  for (const bank of bankData) {
    const userId = randomUUID();
    const passwordHash = await hashPassword(DEMO_PASSWORD);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, password_hash, role, first_name, last_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, bank.email, passwordHash, 'bank', 'Bank', 'Admin', now, now);

    const bankProfileId = randomUUID();
    db.prepare(`
      INSERT INTO bank_profiles (id, user_id, bank_name, contact_email, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(bankProfileId, userId, bank.name, bank.email, now);

    banks.push({ userId, bankProfileId, email: bank.email, bankName: bank.name });
  }

  return { clients, banks };
}

async function createRiskProfiles(clients: any[]) {
  const calculator = new HelixRiskCalculator();

  for (const client of clients) {
    // Check if risk profile already exists
    const existingProfile = db.prepare('SELECT id FROM risk_profiles WHERE user_id = ?').get(client.userId) as any;
    if (existingProfile) {
      console.log(`⚠️  Risk profile already exists for ${client.email}. Skipping.`);
      continue;
    }
    
    // Profile data should already be set from createDemoUsers
    if (!client.profile) {
      console.log(`⚠️  No profile data for ${client.email}. Skipping risk profile creation.`);
      continue;
    }
    const result = calculator.calculateHelixScore(client.profile);
    const profileId = randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO risk_profiles (
        id, user_id, helix_score, risk_category, stability_index, affordability_ratio,
        reliability_score, cash_flow_score, asset_score, behavior_score, fraud_score,
        financial_stability_score, behavioral_risk_score, alternative_data_score,
        economic_environment_score, fraud_risk_score, confidence_interval, flags, explanation,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      profileId,
      client.userId,
      result.helixScore,
      result.riskCategory,
      result.dimensionScores.financial,
      client.profile.monthlyIncome ? (client.profile.debtToIncomeRatio || 0) : null,
      result.dimensionScores.behavioral,
      result.dimensionScores.financial,
      result.dimensionScores.alternative,
      result.dimensionScores.behavioral,
      result.dimensionScores.fraud,
      result.dimensionScores.financial,
      result.dimensionScores.behavioral,
      result.dimensionScores.alternative,
      result.dimensionScores.economic_environment,
      result.dimensionScores.fraud,
      result.confidenceInterval,
      JSON.stringify(result.flags),
      JSON.stringify(result.explanation),
      now,
      now
    );

    // Create some history entries
    for (let i = 2; i >= 0; i--) {
      const historyId = randomUUID();
      const historyDate = new Date();
      historyDate.setMonth(historyDate.getMonth() - i);
      const historicalScore = result.helixScore + (Math.random() * 5 - 2.5); // Small variation

      db.prepare(`
        INSERT INTO risk_profile_history (id, user_id, helix_score, risk_category, dimension_scores, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        historyId,
        client.userId,
        historicalScore,
        result.riskCategory,
        JSON.stringify(result.dimensionScores),
        historyDate.toISOString()
      );
    }
  }
}

async function createProducts(banks: any[]) {
  console.log('   Creating bank products...');
  // Always create fresh products (clearDemoData already removed old ones)

  // Canadian banking products - realistic offerings
  const products = [
    // RBC Products
    {
      bankIndex: 0,
      name: 'RBC Avion Visa Infinite',
      description: 'Premium travel credit card with flexible points redemption',
      type: 'credit_line' as const,
      baseRate: 19.99,
      minAmount: 5000,
      maxAmount: 50000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 35,
      originationFee: 0,
    },
    {
      bankIndex: 0,
      name: 'RBC Personal Loan',
      description: 'Flexible personal loan for any purpose',
      type: 'personal_loan' as const,
      baseRate: 8.99,
      minAmount: 5000,
      maxAmount: 50000,
      minTerm: 12,
      maxTerm: 60,
      minScore: 0,
      maxScore: 50,
      originationFee: 250,
    },
    {
      bankIndex: 0,
      name: 'RBC Fixed Rate Mortgage',
      description: '5-year fixed rate mortgage with competitive rates',
      type: 'mortgage' as const,
      baseRate: 5.49,
      minAmount: 100000,
      maxAmount: 2000000,
      minTerm: 60,
      maxTerm: 300,
      minScore: 0,
      maxScore: 40,
      originationFee: 1000,
    },
    // TD Products
    {
      bankIndex: 1,
      name: 'TD First Class Travel Visa Infinite',
      description: 'Premium travel rewards credit card',
      type: 'credit_line' as const,
      baseRate: 20.99,
      minAmount: 5000,
      maxAmount: 75000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 35,
      originationFee: 0,
    },
    {
      bankIndex: 1,
      name: 'TD Personal Line of Credit',
      description: 'Flexible line of credit for personal use',
      type: 'credit_line' as const,
      baseRate: 7.99,
      minAmount: 10000,
      maxAmount: 100000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 45,
      originationFee: 0,
    },
    {
      bankIndex: 1,
      name: 'TD 5-Year Fixed Rate Mortgage',
      description: 'Competitive fixed rate mortgage',
      type: 'mortgage' as const,
      baseRate: 5.39,
      minAmount: 100000,
      maxAmount: 2500000,
      minTerm: 60,
      maxTerm: 300,
      minScore: 0,
      maxScore: 40,
      originationFee: 1200,
    },
    // Scotiabank Products
    {
      bankIndex: 2,
      name: 'Scotiabank Gold American Express',
      description: 'Travel rewards credit card with no foreign transaction fees',
      type: 'credit_line' as const,
      baseRate: 19.99,
      minAmount: 5000,
      maxAmount: 50000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 35,
      originationFee: 0,
    },
    {
      bankIndex: 2,
      name: 'Scotiabank Personal Loan',
      description: 'Unsecured personal loan with competitive rates',
      type: 'personal_loan' as const,
      baseRate: 9.49,
      minAmount: 5000,
      maxAmount: 75000,
      minTerm: 12,
      maxTerm: 84,
      minScore: 0,
      maxScore: 50,
      originationFee: 300,
    },
    {
      bankIndex: 2,
      name: 'Scotiabank Variable Rate Mortgage',
      description: 'Flexible variable rate mortgage',
      type: 'mortgage' as const,
      baseRate: 6.25,
      minAmount: 100000,
      maxAmount: 2000000,
      minTerm: 60,
      maxTerm: 300,
      minScore: 0,
      maxScore: 40,
      originationFee: 1000,
    },
    // BMO Products
    {
      bankIndex: 3,
      name: 'BMO World Elite Mastercard',
      description: 'Premium credit card with comprehensive travel insurance',
      type: 'credit_line' as const,
      baseRate: 20.99,
      minAmount: 5000,
      maxAmount: 60000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 35,
      originationFee: 0,
    },
    {
      bankIndex: 3,
      name: 'BMO Personal Loan',
      description: 'Fast approval personal loan',
      type: 'personal_loan' as const,
      baseRate: 8.99,
      minAmount: 5000,
      maxAmount: 50000,
      minTerm: 12,
      maxTerm: 60,
      minScore: 0,
      maxScore: 50,
      originationFee: 250,
    },
    {
      bankIndex: 3,
      name: 'BMO Smart Fixed Mortgage',
      description: 'Fixed rate mortgage with flexible prepayment options',
      type: 'mortgage' as const,
      baseRate: 5.59,
      minAmount: 100000,
      maxAmount: 2000000,
      minTerm: 60,
      maxTerm: 300,
      minScore: 0,
      maxScore: 40,
      originationFee: 1100,
    },
    // CIBC Products
    {
      bankIndex: 4,
      name: 'CIBC Aventura Visa Infinite',
      description: 'Travel rewards credit card with airport lounge access',
      type: 'credit_line' as const,
      baseRate: 20.99,
      minAmount: 5000,
      maxAmount: 50000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 35,
      originationFee: 0,
    },
    {
      bankIndex: 4,
      name: 'CIBC Personal Line of Credit',
      description: 'Flexible revolving credit facility',
      type: 'credit_line' as const,
      baseRate: 8.49,
      minAmount: 10000,
      maxAmount: 100000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 45,
      originationFee: 0,
    },
    {
      bankIndex: 4,
      name: 'CIBC Fixed Rate Closed Mortgage',
      description: 'Secure fixed rate mortgage with predictable payments',
      type: 'mortgage' as const,
      baseRate: 5.44,
      minAmount: 100000,
      maxAmount: 2000000,
      minTerm: 60,
      maxTerm: 300,
      minScore: 0,
      maxScore: 40,
      originationFee: 1000,
    },
    // Additional products for variety - Auto Loans
    {
      bankIndex: 0,
      name: 'RBC Auto Loan',
      description: 'Competitive auto financing rates for new and used vehicles',
      type: 'auto_loan' as const,
      baseRate: 6.99,
      minAmount: 10000,
      maxAmount: 100000,
      minTerm: 24,
      maxTerm: 84,
      minScore: 0,
      maxScore: 50,
      originationFee: 0,
    },
    {
      bankIndex: 1,
      name: 'TD Auto Loan',
      description: 'Flexible auto financing options with competitive rates',
      type: 'auto_loan' as const,
      baseRate: 7.49,
      minAmount: 10000,
      maxAmount: 100000,
      minTerm: 24,
      maxTerm: 84,
      minScore: 0,
      maxScore: 50,
      originationFee: 0,
    },
    {
      bankIndex: 2,
      name: 'Scotiabank Auto Loan',
      description: 'Auto financing with flexible payment options',
      type: 'auto_loan' as const,
      baseRate: 7.99,
      minAmount: 10000,
      maxAmount: 100000,
      minTerm: 24,
      maxTerm: 84,
      minScore: 0,
      maxScore: 50,
      originationFee: 0,
    },
    {
      bankIndex: 3,
      name: 'BMO Auto Loan',
      description: 'Competitive rates for vehicle financing',
      type: 'auto_loan' as const,
      baseRate: 7.29,
      minAmount: 10000,
      maxAmount: 100000,
      minTerm: 24,
      maxTerm: 84,
      minScore: 0,
      maxScore: 50,
      originationFee: 0,
    },
    {
      bankIndex: 4,
      name: 'CIBC Auto Loan',
      description: 'Simple and affordable auto financing',
      type: 'auto_loan' as const,
      baseRate: 7.19,
      minAmount: 10000,
      maxAmount: 100000,
      minTerm: 24,
      maxTerm: 84,
      minScore: 0,
      maxScore: 50,
      originationFee: 0,
    },
    // Student Loans
    {
      bankIndex: 0,
      name: 'RBC Student Line of Credit',
      description: 'Flexible funding for post-secondary education',
      type: 'student_loan' as const,
      baseRate: 4.99,
      minAmount: 5000,
      maxAmount: 150000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 45,
      originationFee: 0,
    },
    {
      bankIndex: 1,
      name: 'TD Student Line of Credit',
      description: 'Affordable financing for students',
      type: 'student_loan' as const,
      baseRate: 5.25,
      minAmount: 5000,
      maxAmount: 150000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 45,
      originationFee: 0,
    },
    {
      bankIndex: 2,
      name: 'Scotiabank Student Line of Credit',
      description: 'Support your education with flexible credit',
      type: 'student_loan' as const,
      baseRate: 5.49,
      minAmount: 5000,
      maxAmount: 150000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 45,
      originationFee: 0,
    },
    {
      bankIndex: 3,
      name: 'BMO Student Line of Credit',
      description: 'Invest in your future with student financing',
      type: 'student_loan' as const,
      baseRate: 5.19,
      minAmount: 5000,
      maxAmount: 150000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 45,
      originationFee: 0,
    },
    {
      bankIndex: 4,
      name: 'CIBC Student Line of Credit',
      description: 'Flexible credit for education expenses',
      type: 'student_loan' as const,
      baseRate: 5.39,
      minAmount: 5000,
      maxAmount: 150000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 45,
      originationFee: 0,
    },
    // Home Equity Lines of Credit
    {
      bankIndex: 0,
      name: 'RBC Homeline Plan',
      description: 'Access your home equity with flexible repayment',
      type: 'home_equity' as const,
      baseRate: 6.49,
      minAmount: 25000,
      maxAmount: 500000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 40,
      originationFee: 500,
    },
    {
      bankIndex: 1,
      name: 'TD Home Equity FlexLine',
      description: 'Flexible home equity line of credit',
      type: 'home_equity' as const,
      baseRate: 6.59,
      minAmount: 25000,
      maxAmount: 500000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 40,
      originationFee: 500,
    },
    {
      bankIndex: 2,
      name: 'Scotiabank Home Equity Line of Credit',
      description: 'Unlock your home equity for major expenses',
      type: 'home_equity' as const,
      baseRate: 6.69,
      minAmount: 25000,
      maxAmount: 500000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 40,
      originationFee: 500,
    },
    {
      bankIndex: 3,
      name: 'BMO Homeowner ReadiLine',
      description: 'Flexible home equity credit line',
      type: 'home_equity' as const,
      baseRate: 6.49,
      minAmount: 25000,
      maxAmount: 500000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 40,
      originationFee: 500,
    },
    {
      bankIndex: 4,
      name: 'CIBC Home Power Plan',
      description: 'Access your home equity with competitive rates',
      type: 'home_equity' as const,
      baseRate: 6.59,
      minAmount: 25000,
      maxAmount: 500000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 40,
      originationFee: 500,
    },
    // Business Loans
    {
      bankIndex: 0,
      name: 'RBC Business Loan',
      description: 'Financing for small and medium businesses',
      type: 'business_loan' as const,
      baseRate: 7.99,
      minAmount: 25000,
      maxAmount: 500000,
      minTerm: 12,
      maxTerm: 60,
      minScore: 0,
      maxScore: 45,
      originationFee: 1000,
    },
    {
      bankIndex: 1,
      name: 'TD Business Loan',
      description: 'Flexible financing solutions for businesses',
      type: 'business_loan' as const,
      baseRate: 8.49,
      minAmount: 25000,
      maxAmount: 500000,
      minTerm: 12,
      maxTerm: 60,
      minScore: 0,
      maxScore: 45,
      originationFee: 1000,
    },
    {
      bankIndex: 2,
      name: 'Scotiabank Business Loan',
      description: 'Support your business growth with competitive rates',
      type: 'business_loan' as const,
      baseRate: 8.29,
      minAmount: 25000,
      maxAmount: 500000,
      minTerm: 12,
      maxTerm: 60,
      minScore: 0,
      maxScore: 45,
      originationFee: 1000,
    },
    {
      bankIndex: 3,
      name: 'BMO Business Loan',
      description: 'Tailored financing for your business needs',
      type: 'business_loan' as const,
      baseRate: 8.19,
      minAmount: 25000,
      maxAmount: 500000,
      minTerm: 12,
      maxTerm: 60,
      minScore: 0,
      maxScore: 45,
      originationFee: 1000,
    },
    {
      bankIndex: 4,
      name: 'CIBC Business Loan',
      description: 'Flexible business financing options',
      type: 'business_loan' as const,
      baseRate: 8.39,
      minAmount: 25000,
      maxAmount: 500000,
      minTerm: 12,
      maxTerm: 60,
      minScore: 0,
      maxScore: 45,
      originationFee: 1000,
    },
    // Credit Cards - Premium/Prime Cards
    {
      bankIndex: 0,
      name: 'RBC Avion Visa Infinite',
      description: 'Premium travel rewards with exclusive benefits',
      type: 'credit_card' as const,
      baseRate: 19.99,
      minAmount: 5000,
      maxAmount: 50000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 30,
      originationFee: 0,
    },
    {
      bankIndex: 1,
      name: 'TD Aeroplan Visa Infinite',
      description: 'Earn Aeroplan points and enjoy travel perks',
      type: 'credit_card' as const,
      baseRate: 19.99,
      minAmount: 5000,
      maxAmount: 50000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 30,
      originationFee: 0,
    },
    {
      bankIndex: 2,
      name: 'Scotiabank Passport Visa Infinite',
      description: 'Premium travel and rewards program',
      type: 'credit_card' as const,
      baseRate: 19.99,
      minAmount: 5000,
      maxAmount: 50000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 30,
      originationFee: 0,
    },
    {
      bankIndex: 3,
      name: 'BMO Eclipse Visa Infinite',
      description: 'Premium rewards on gas and groceries',
      type: 'credit_card' as const,
      baseRate: 19.99,
      minAmount: 5000,
      maxAmount: 50000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 30,
      originationFee: 0,
    },
    {
      bankIndex: 4,
      name: 'CIBC Aventura Visa Infinite',
      description: 'Flexible travel rewards with premium perks',
      type: 'credit_card' as const,
      baseRate: 19.99,
      minAmount: 5000,
      maxAmount: 50000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 30,
      originationFee: 0,
    },
    // Credit Cards - Standard Rewards Cards
    {
      bankIndex: 0,
      name: 'RBC Cash Back Mastercard',
      description: 'Earn cash back on everyday purchases',
      type: 'credit_card' as const,
      baseRate: 19.99,
      minAmount: 1000,
      maxAmount: 25000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 50,
      originationFee: 0,
    },
    {
      bankIndex: 1,
      name: 'TD Cash Back Visa',
      description: 'Simple cash back rewards on all purchases',
      type: 'credit_card' as const,
      baseRate: 19.99,
      minAmount: 1000,
      maxAmount: 25000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 50,
      originationFee: 0,
    },
    {
      bankIndex: 2,
      name: 'Scotiabank Scene Visa',
      description: 'Earn Scene points for movies and entertainment',
      type: 'credit_card' as const,
      baseRate: 19.99,
      minAmount: 1000,
      maxAmount: 20000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 50,
      originationFee: 0,
    },
    {
      bankIndex: 3,
      name: 'BMO CashBack Mastercard',
      description: 'Earn cash back on every purchase',
      type: 'credit_card' as const,
      baseRate: 19.99,
      minAmount: 1000,
      maxAmount: 25000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 50,
      originationFee: 0,
    },
    {
      bankIndex: 4,
      name: 'CIBC Dividend Visa',
      description: 'Earn dividends on everyday spending',
      type: 'credit_card' as const,
      baseRate: 19.99,
      minAmount: 1000,
      maxAmount: 25000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 0,
      maxScore: 50,
      originationFee: 0,
    },
    // Credit Cards - Starter/Student Cards
    {
      bankIndex: 0,
      name: 'RBC Student Cash Back Mastercard',
      description: 'Build credit with cash back rewards for students',
      type: 'credit_card' as const,
      baseRate: 19.99,
      minAmount: 500,
      maxAmount: 5000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 30,
      maxScore: 70,
      originationFee: 0,
    },
    {
      bankIndex: 1,
      name: 'TD Student Visa',
      description: 'Start building your credit history',
      type: 'credit_card' as const,
      baseRate: 19.99,
      minAmount: 500,
      maxAmount: 5000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 30,
      maxScore: 70,
      originationFee: 0,
    },
    {
      bankIndex: 2,
      name: 'Scotiabank Getting Started Card',
      description: 'Build credit with responsible usage',
      type: 'credit_card' as const,
      baseRate: 21.99,
      minAmount: 500,
      maxAmount: 3000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 40,
      maxScore: 80,
      originationFee: 0,
    },
    {
      bankIndex: 3,
      name: 'BMO Starter Mastercard',
      description: 'Your first step to building credit',
      type: 'credit_card' as const,
      baseRate: 21.99,
      minAmount: 500,
      maxAmount: 4000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 40,
      maxScore: 80,
      originationFee: 0,
    },
    {
      bankIndex: 4,
      name: 'CIBC Classic Visa',
      description: 'Simple card with no annual fee',
      type: 'credit_card' as const,
      baseRate: 19.99,
      minAmount: 500,
      maxAmount: 5000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 30,
      maxScore: 70,
      originationFee: 0,
    },
    // Credit Cards - Secured Cards (for building/rebuilding credit)
    {
      bankIndex: 0,
      name: 'RBC Secured Visa',
      description: 'Rebuild your credit with a secured card',
      type: 'credit_card' as const,
      baseRate: 22.99,
      minAmount: 500,
      maxAmount: 10000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 50,
      maxScore: 100,
      originationFee: 0,
    },
    {
      bankIndex: 1,
      name: 'TD Secured Visa',
      description: 'Build credit with a security deposit',
      type: 'credit_card' as const,
      baseRate: 22.99,
      minAmount: 500,
      maxAmount: 10000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 50,
      maxScore: 100,
      originationFee: 0,
    },
    {
      bankIndex: 2,
      name: 'Scotiabank Value Visa',
      description: 'Straightforward credit card option',
      type: 'credit_card' as const,
      baseRate: 22.99,
      minAmount: 500,
      maxAmount: 8000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 50,
      maxScore: 100,
      originationFee: 0,
    },
    {
      bankIndex: 3,
      name: 'BMO Preferred Rate Mastercard',
      description: 'Low rate card for balance transfers',
      type: 'credit_card' as const,
      baseRate: 12.99,
      minAmount: 1000,
      maxAmount: 15000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 25,
      maxScore: 60,
      originationFee: 0,
    },
    {
      bankIndex: 4,
      name: 'CIBC Select Visa',
      description: 'Low introductory rate on purchases',
      type: 'credit_card' as const,
      baseRate: 13.99,
      minAmount: 1000,
      maxAmount: 15000,
      minTerm: 1,
      maxTerm: 1,
      minScore: 25,
      maxScore: 60,
      originationFee: 0,
    },
  ];

  const now = new Date().toISOString();

  for (const product of products) {
    const productId = randomUUID();
    const bank = banks[product.bankIndex];

    db.prepare(`
      INSERT INTO products (
        id, bank_id, name, description, product_type, min_helix_score, max_helix_score,
        base_interest_rate, min_loan_amount, max_loan_amount, min_term_months, max_term_months,
        base_origination_fee, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      productId,
      bank.bankProfileId,
      product.name,
      product.description,
      product.type,
      product.minScore,
      product.maxScore,
      product.baseRate,
      product.minAmount,
      product.maxAmount,
      product.minTerm,
      product.maxTerm,
      product.originationFee,
      1,
      now,
      now
    );
  }
}

async function createSampleApplications(clients: any[], banks: any[]) {
  // Check if applications already exist
  const existingApps = db.prepare('SELECT COUNT(*) as count FROM applications').get() as any;
  if (existingApps && existingApps.count > 0) {
    console.log('⚠️  Applications already exist. Skipping application creation.');
    return;
  }

  // Get products for each bank
  const productsByBank: Record<string, any[]> = {};
  for (const bank of banks) {
    const products = db.prepare('SELECT id FROM products WHERE bank_id = ?').all(bank.bankProfileId) as any[];
    productsByBank[bank.bankProfileId] = products;
  }

  // Create a few sample applications
  const applications = [
    {
      clientEmail: 'prime@demo.com',
      bankIndex: 0,
      productIndex: 1, // Personal Loan
      amount: 25000,
      term: 36,
      status: 'approved' as const,
      stpEligible: true,
    },
    {
      clientEmail: 'nearprime@demo.com',
      bankIndex: 1,
      productIndex: 0, // Credit Card
      amount: 15000,
      term: 1,
      status: 'pre_approved' as const,
      stpEligible: false,
    },
    {
      clientEmail: 'subprime@demo.com',
      bankIndex: 2,
      productIndex: 1, // Personal Loan
      amount: 10000,
      term: 24,
      status: 'pending' as const,
      stpEligible: false,
    },
  ];

  for (const app of applications) {
    const client = clients.find(c => c.email === app.clientEmail);
    if (!client) continue;

    const bank = banks[app.bankIndex];
    const products = productsByBank[bank.bankProfileId];
    if (!products || !products[app.productIndex]) continue;

    const product = products[app.productIndex];
    const riskProfile = db.prepare('SELECT helix_score FROM risk_profiles WHERE user_id = ?').get(client.userId) as any;
    const helixScore = riskProfile?.helix_score || 50;

    const applicationId = randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO applications (
        id, user_id, product_id, bank_id, requested_amount, requested_term_months,
        status, offered_interest_rate, offered_amount, offered_term_months,
        helix_score_at_application, stp_eligible, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      applicationId,
      client.userId,
      product.id,
      bank.bankProfileId,
      app.amount,
      app.term,
      app.status,
      app.status === 'approved' || app.status === 'pre_approved' ? 8.99 : null,
      app.status === 'approved' || app.status === 'pre_approved' ? app.amount : null,
      app.status === 'approved' || app.status === 'pre_approved' ? app.term : null,
      helixScore,
      app.stpEligible ? 1 : 0,
      now,
      now
    );
  }
}

async function createProductMatches(clients: any[], banks: any[]) {
  // Check if product matches already exist
  const existingMatches = db.prepare('SELECT COUNT(*) as count FROM product_matches').get() as any;
  if (existingMatches && existingMatches.count > 0) {
    console.log('⚠️  Product matches already exist. Skipping match creation.');
    return;
  }

  // Get all products
  const allProducts = db.prepare('SELECT * FROM products WHERE is_active = 1').all() as any[];

  for (const client of clients) {
    const riskProfile = db.prepare('SELECT helix_score FROM risk_profiles WHERE user_id = ?').get(client.userId) as any;
    if (!riskProfile) continue;

    const helixScore = riskProfile.helix_score;

    // Find matching products
    for (const product of allProducts) {
      const minScore = product.min_helix_score ?? 0;
      const maxScore = product.max_helix_score ?? 100;

      if (helixScore >= minScore && helixScore <= maxScore) {
        const matchScore = 0.7 + (Math.random() * 0.25); // 0.7-0.95
        const preApproved = matchScore > 0.8 && helixScore < 50;

        const matchId = randomUUID();
        const now = new Date().toISOString();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const personalizedPricing = {
          interestRate: product.base_interest_rate + (helixScore > 40 ? (helixScore - 40) * 0.1 : 0),
          originationFee: product.base_origination_fee || 0,
          maxAmount: Math.min(product.max_loan_amount, product.max_loan_amount * (1 - (helixScore / 200))),
          terms: [product.min_term_months, product.max_term_months],
        };

        db.prepare(`
          INSERT INTO product_matches (
            id, user_id, product_id, match_score, pre_approved, personalized_pricing, created_at, expires_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          matchId,
          client.userId,
          product.id,
          matchScore,
          preApproved ? 1 : 0,
          JSON.stringify(personalizedPricing),
          now,
          expiresAt.toISOString()
        );
      }
    }
  }
}

async function createSampleFinancialDocuments(clients: any[]) {
  console.log('📄 Creating sample financial documents for credit metrics...');

  for (const client of clients) {
    const userId = client.userId;
    const now = new Date();

    // Prime customer - excellent credit profile
    if (client.email === 'prime@demo.com') {
      // 1 Primary Credit Card (opened 4 years ago) - low utilization
      const primaryCardOpened = new Date(now);
      primaryCardOpened.setFullYear(primaryCardOpened.getFullYear() - 4);
      
      // Most recent statement (current month)
      const recentDate = new Date(now);
      const monthYear = `${recentDate.getFullYear()}-${String(recentDate.getMonth() + 1).padStart(2, '0')}`;
      
      db.prepare(`
        INSERT INTO financial_data (id, user_id, data_type, source, raw_data, processed_data, month_year, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        randomUUID(),
        userId,
        'credit_card_statement',
        'RBC Visa Infinite Statement.pdf',
        JSON.stringify({ fileName: 'rbc_visa_statement.pdf', accountNumber: '****1234' }),
        JSON.stringify({
          creditCardBalance: 1800, // Low balance
          creditLimit: 15000,
          creditUtilization: 12,
          minimumPayment: 50,
        }),
        monthYear,
        recentDate.toISOString()
      );

      // 1 Secondary Credit Card (opened 2 years ago) - very low utilization
      const secondaryCardOpened = new Date(now);
      secondaryCardOpened.setFullYear(secondaryCardOpened.getFullYear() - 2);
      
      db.prepare(`
        INSERT INTO financial_data (id, user_id, data_type, source, raw_data, processed_data, month_year, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        randomUUID(),
        userId,
        'credit_card_statement',
        'TD Aeroplan Visa Statement.pdf',
        JSON.stringify({ fileName: 'td_aeroplan_statement.pdf', accountNumber: '****5678' }),
        JSON.stringify({
          creditCardBalance: 700, // Very low balance
          creditLimit: 12000,
          creditUtilization: 5.8,
          minimumPayment: 25,
        }),
        monthYear,
        secondaryCardOpened.toISOString()
      );

      // Auto Loan (opened 3 years ago, 5-year term)
      const loanDate = new Date(now);
      loanDate.setFullYear(loanDate.getFullYear() - 3);
      db.prepare(`
        INSERT INTO financial_data (id, user_id, data_type, source, raw_data, processed_data, month_year, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        randomUUID(),
        userId,
        'loan_statement',
        'TD Auto Loan Statement.pdf',
        JSON.stringify({ fileName: 'td_auto_loan.pdf', accountNumber: 'AUTO-2021-001' }),
        JSON.stringify({
          loanBalance: 12000,
          loanMonthlyPayment: 350,
          loanType: 'auto',
          loanInterestRate: 4.5,
          originalAmount: 35000,
        }),
        `${loanDate.getFullYear()}-${String(loanDate.getMonth() + 1).padStart(2, '0')}`,
        loanDate.toISOString()
      );

      // Pay Stubs (last 6 months - bi-weekly)
      for (let i = 0; i < 6; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        db.prepare(`
          INSERT INTO financial_data (id, user_id, data_type, source, raw_data, processed_data, month_year, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          randomUUID(),
          userId,
          'pay_stub',
          `Pay Stub ${monthYear}.pdf`,
          JSON.stringify({ fileName: `paystub_${monthYear}.pdf` }),
          JSON.stringify({
            monthlyIncome: 8500,
            employer: 'Tech Solutions Inc.',
            payPeriod: { start: date.toISOString(), end: new Date(date.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString() },
          }),
          monthYear,
          date.toISOString()
        );
      }

      // Bank Statements (last 3 months)
      for (let i = 0; i < 3; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        db.prepare(`
          INSERT INTO financial_data (id, user_id, data_type, source, raw_data, processed_data, month_year, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          randomUUID(),
          userId,
          'bank_statement',
          `Bank Statement ${monthYear}.pdf`,
          JSON.stringify({ fileName: `bank_statement_${monthYear}.pdf` }),
          JSON.stringify({
            averageMonthlyBalance: 18000,
            overdraftFrequency: 0,
            savingsRate: 0.25,
            paymentTimeliness: 98,
            transactions: [],
          }),
          monthYear,
          date.toISOString()
        );
      }

      // Bills - variety of types, all paid on time
      const billTypes = [
        { type: 'utility', amount: 180, provider: 'Hydro One' },
        { type: 'utility', amount: 65, provider: 'Enbridge Gas' },
        { type: 'utility', amount: 95, provider: 'Bell Internet' },
        { type: 'insurance', amount: 220, provider: 'State Farm' },
      ];
      
      for (let i = 0; i < 12; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const billType = billTypes[i % billTypes.length];
        
        db.prepare(`
          INSERT INTO financial_data (id, user_id, data_type, source, raw_data, processed_data, month_year, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          randomUUID(),
          userId,
          'bill',
          `${billType.provider} Bill ${monthYear}.pdf`,
          JSON.stringify({ fileName: `${billType.type}_${monthYear}.pdf` }),
          JSON.stringify({
            billAmount: billType.amount,
            billType: billType.type,
            billDueDate: date.toISOString(),
            billPaymentStatus: 'paid',
            paymentTimeliness: 100,
          }),
          monthYear,
          date.toISOString()
        );
      }
    }

    // Near-prime customer - good but not perfect
    if (client.email === 'nearprime@demo.com') {
      // 1 Credit Card (opened 18 months ago) - moderate utilization
      const cardOpened = new Date(now);
      cardOpened.setMonth(cardOpened.getMonth() - 18);
      
      const recentDate = new Date(now);
      const monthYear = `${recentDate.getFullYear()}-${String(recentDate.getMonth() + 1).padStart(2, '0')}`;
      
      db.prepare(`
        INSERT INTO financial_data (id, user_id, data_type, source, raw_data, processed_data, month_year, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        randomUUID(),
        userId,
        'credit_card_statement',
        'Scotiabank Scene Visa Statement.pdf',
        JSON.stringify({ fileName: 'scotia_scene_statement.pdf', accountNumber: '****9012' }),
        JSON.stringify({
          creditCardBalance: 3800,
          creditLimit: 10000,
          creditUtilization: 38,
          minimumPayment: 115,
        }),
        monthYear,
        cardOpened.toISOString()
      );

      // Auto Loan (opened 2 years ago)
      const loanDate = new Date(now);
      loanDate.setFullYear(loanDate.getFullYear() - 2);
      db.prepare(`
        INSERT INTO financial_data (id, user_id, data_type, source, raw_data, processed_data, month_year, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        randomUUID(),
        userId,
        'loan_statement',
        'BMO Auto Loan Statement.pdf',
        JSON.stringify({ fileName: 'bmo_auto_loan.pdf', accountNumber: 'AUTO-2022-045' }),
        JSON.stringify({
          loanBalance: 18500,
          loanMonthlyPayment: 420,
          loanType: 'auto',
          loanInterestRate: 6.9,
          originalAmount: 28000,
        }),
        `${loanDate.getFullYear()}-${String(loanDate.getMonth() + 1).padStart(2, '0')}`,
        loanDate.toISOString()
      );

      // Pay Stubs (last 4 months)
      for (let i = 0; i < 4; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        db.prepare(`
          INSERT INTO financial_data (id, user_id, data_type, source, raw_data, processed_data, month_year, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          randomUUID(),
          userId,
          'pay_stub',
          `Pay Stub ${monthYear}.pdf`,
          JSON.stringify({ fileName: `paystub_${monthYear}.pdf` }),
          JSON.stringify({
            monthlyIncome: 5200,
            employer: 'Retail Management Corp',
            payPeriod: { start: date.toISOString(), end: new Date(date.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString() },
          }),
          monthYear,
          date.toISOString()
        );
      }

      // Bills - mostly on time, some late
      const billTypes = [
        { type: 'utility', amount: 140, provider: 'Toronto Hydro' },
        { type: 'utility', amount: 55, provider: 'Enbridge Gas' },
        { type: 'rent', amount: 1650, provider: 'Property Management Ltd' },
        { type: 'utility', amount: 75, provider: 'Rogers Internet' },
      ];
      
      for (let i = 0; i < 12; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const billType = billTypes[i % billTypes.length];
        const isLate = i < 2; // Last 2 months late
        
        db.prepare(`
          INSERT INTO financial_data (id, user_id, data_type, source, raw_data, processed_data, month_year, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          randomUUID(),
          userId,
          'bill',
          `${billType.provider} Bill ${monthYear}.pdf`,
          JSON.stringify({ fileName: `${billType.type}_${monthYear}.pdf` }),
          JSON.stringify({
            billAmount: billType.amount,
            billType: billType.type,
            billDueDate: date.toISOString(),
            billPaymentStatus: isLate ? 'overdue' : 'paid',
            paymentTimeliness: isLate ? 75 : 100,
          }),
          monthYear,
          date.toISOString()
        );
      }
    }

    // Subprime customer - high utilization, late payments
    if (client.email === 'subprime@demo.com') {
      // 1 Credit Card (opened 8 months ago) - high utilization
      const cardOpened = new Date(now);
      cardOpened.setMonth(cardOpened.getMonth() - 8);
      
      const recentDate = new Date(now);
      const monthYear = `${recentDate.getFullYear()}-${String(recentDate.getMonth() + 1).padStart(2, '0')}`;
      
      db.prepare(`
        INSERT INTO financial_data (id, user_id, data_type, source, raw_data, processed_data, month_year, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        randomUUID(),
        userId,
        'credit_card_statement',
        'Capital One Mastercard Statement.pdf',
        JSON.stringify({ fileName: 'capital_one_statement.pdf', accountNumber: '****3456' }),
        JSON.stringify({
          creditCardBalance: 4500,
          creditLimit: 6000,
          creditUtilization: 75,
          minimumPayment: 135,
        }),
        monthYear,
        cardOpened.toISOString()
      );

      // Personal Loan (opened 6 months ago) - high interest
      const loanDate = new Date(now);
      loanDate.setMonth(loanDate.getMonth() - 6);
      db.prepare(`
        INSERT INTO financial_data (id, user_id, data_type, source, raw_data, processed_data, month_year, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        randomUUID(),
        userId,
        'loan_statement',
        'Easy Financial Personal Loan.pdf',
        JSON.stringify({ fileName: 'easy_financial_loan.pdf', accountNumber: 'PL-2024-089' }),
        JSON.stringify({
          loanBalance: 8500,
          loanMonthlyPayment: 280,
          loanType: 'personal',
          loanInterestRate: 29.9,
          originalAmount: 10000,
        }),
        `${loanDate.getFullYear()}-${String(loanDate.getMonth() + 1).padStart(2, '0')}`,
        loanDate.toISOString()
      );

      // Pay Stubs (last 3 months - irregular)
      for (let i = 0; i < 3; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        db.prepare(`
          INSERT INTO financial_data (id, user_id, data_type, source, raw_data, processed_data, month_year, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          randomUUID(),
          userId,
          'pay_stub',
          `Pay Stub ${monthYear}.pdf`,
          JSON.stringify({ fileName: `paystub_${monthYear}.pdf` }),
          JSON.stringify({
            monthlyIncome: 3200,
            employer: 'Temp Agency Services',
            payPeriod: { start: date.toISOString(), end: new Date(date.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString() },
          }),
          monthYear,
          date.toISOString()
        );
      }

      // Bills - many late/missed
      const billTypes = [
        { type: 'utility', amount: 95, provider: 'Hydro One' },
        { type: 'rent', amount: 1200, provider: 'Landlord - John Smith' },
        { type: 'utility', amount: 45, provider: 'Enbridge Gas' },
        { type: 'utility', amount: 65, provider: 'Bell Internet' },
      ];
      
      for (let i = 0; i < 12; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const billType = billTypes[i % billTypes.length];
        const isMissed = i < 3; // Last 3 months missed
        const isLate = i >= 3 && i < 6; // 3-6 months ago late
        
        db.prepare(`
          INSERT INTO financial_data (id, user_id, data_type, source, raw_data, processed_data, month_year, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          randomUUID(),
          userId,
          'bill',
          `${billType.provider} Bill ${monthYear}.pdf`,
          JSON.stringify({ fileName: `${billType.type}_${monthYear}.pdf` }),
          JSON.stringify({
            billAmount: billType.amount,
            billType: billType.type,
            billDueDate: date.toISOString(),
            billPaymentStatus: isMissed ? 'overdue' : isLate ? 'overdue' : 'paid',
            paymentTimeliness: isMissed ? 30 : isLate ? 65 : 100,
          }),
          monthYear,
          date.toISOString()
        );
      }
    }
  }

  console.log('✅ Sample financial documents created!');
}

function clearDemoData() {
  console.log('🗑️  Clearing existing demo data...');
  
  const demoEmails = [
    'prime@demo.com',
    'nearprime@demo.com',
    'subprime@demo.com',
    'rbc@demo.com',
    'td@demo.com',
    'scotiabank@demo.com',
    'bmo@demo.com',
    'cibc@demo.com',
  ];

  // Get all demo user IDs first
  const demoUserIds: string[] = [];
  for (const email of demoEmails) {
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;
    if (user) {
      demoUserIds.push(user.id);
    }
  }

  if (demoUserIds.length === 0) {
    console.log('   No existing demo data found.');
    return;
  }

  // Delete all related data for demo users (in order to respect foreign key constraints)
  const userIdPlaceholders = demoUserIds.map(() => '?').join(',');
  
  // Delete in order to respect foreign key constraints
  db.prepare(`DELETE FROM risk_alerts WHERE user_id IN (${userIdPlaceholders})`).run(...demoUserIds);
  db.prepare(`DELETE FROM risk_profile_history WHERE user_id IN (${userIdPlaceholders})`).run(...demoUserIds);
  db.prepare(`DELETE FROM risk_profiles WHERE user_id IN (${userIdPlaceholders})`).run(...demoUserIds);
  db.prepare(`DELETE FROM financial_data WHERE user_id IN (${userIdPlaceholders})`).run(...demoUserIds);
  db.prepare(`DELETE FROM applications WHERE user_id IN (${userIdPlaceholders})`).run(...demoUserIds);
  db.prepare(`DELETE FROM product_matches WHERE user_id IN (${userIdPlaceholders})`).run(...demoUserIds);
  db.prepare(`DELETE FROM risk_improvement_goals WHERE user_id IN (${userIdPlaceholders})`).run(...demoUserIds);
  db.prepare(`DELETE FROM client_profiles WHERE user_id IN (${userIdPlaceholders})`).run(...demoUserIds);
  
  // Delete products created by demo banks
  const demoBankIds: string[] = [];
  for (const email of demoEmails.slice(3)) { // Bank emails start from index 3
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;
    if (user) {
      const bankProfile = db.prepare('SELECT id FROM bank_profiles WHERE user_id = ?').get(user.id) as any;
      if (bankProfile) {
        demoBankIds.push(bankProfile.id);
      }
    }
  }
  
  if (demoBankIds.length > 0) {
    const bankIdPlaceholders = demoBankIds.map(() => '?').join(',');
    db.prepare(`DELETE FROM product_matches WHERE product_id IN (SELECT id FROM products WHERE bank_id IN (${bankIdPlaceholders}))`).run(...demoBankIds);
    db.prepare(`DELETE FROM applications WHERE bank_id IN (${bankIdPlaceholders})`).run(...demoBankIds);
    db.prepare(`DELETE FROM products WHERE bank_id IN (${bankIdPlaceholders})`).run(...demoBankIds);
    db.prepare(`DELETE FROM bank_profiles WHERE id IN (${bankIdPlaceholders})`).run(...demoBankIds);
  }
  
  // Finally, delete the users
  db.prepare(`DELETE FROM users WHERE id IN (${userIdPlaceholders})`).run(...demoUserIds);
  
  console.log(`   Cleared demo data for ${demoUserIds.length} users and ${demoBankIds.length} banks.`);
}

