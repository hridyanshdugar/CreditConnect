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

  // Create 3 client users with different profiles
  const clientData = [
    {
      email: 'prime@demo.com',
      firstName: 'Sarah',
      lastName: 'Chen',
      profile: {
        monthlyIncome: 8500,
        employmentDuration: 72,
        debtToIncomeRatio: 0.22,
        paymentTimeliness: 98,
        averageMonthlyBalance: 18000,
        savingsRate: 0.25,
        emergencyFundCoverage: 8,
        propertyOwnership: true,
        vehicleOwnership: true,
        investmentAccounts: 3,
        educationLevel: 90,
        residentialStability: 60,
      },
    },
    {
      email: 'nearprime@demo.com',
      firstName: 'Michael',
      lastName: 'Rodriguez',
      profile: {
        monthlyIncome: 5200,
        employmentDuration: 24,
        debtToIncomeRatio: 0.38,
        paymentTimeliness: 85,
        averageMonthlyBalance: 3500,
        savingsRate: 0.12,
        emergencyFundCoverage: 3,
        propertyOwnership: false,
        vehicleOwnership: true,
        investmentAccounts: 1,
        educationLevel: 70,
        residentialStability: 18,
      },
    },
    {
      email: 'subprime@demo.com',
      firstName: 'James',
      lastName: 'Thompson',
      profile: {
        monthlyIncome: 3200,
        employmentDuration: 8,
        debtToIncomeRatio: 0.58,
        paymentTimeliness: 68,
        averageMonthlyBalance: 800,
        savingsRate: 0.03,
        emergencyFundCoverage: 0.5,
        propertyOwnership: false,
        vehicleOwnership: false,
        investmentAccounts: 0,
        educationLevel: 50,
        residentialStability: 6,
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
        environmental_risk_score, fraud_risk_score, confidence_interval, flags, explanation,
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
      result.dimensionScores.environmental,
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
    // Additional products for variety
    {
      bankIndex: 0,
      name: 'RBC Auto Loan',
      description: 'Competitive auto financing rates',
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
      description: 'Flexible auto financing options',
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
      // Credit card statements (2 cards, low utilization)
      for (let i = 0; i < 6; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const dataId = randomUUID();
        db.prepare(`
          INSERT INTO financial_data (id, user_id, data_type, source, raw_data, processed_data, month_year, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          dataId,
          userId,
          'credit_card_statement',
          `Credit Card Statement ${monthYear}.pdf`,
          JSON.stringify({ fileName: `credit_card_${monthYear}.pdf` }),
          JSON.stringify({
            creditCardBalance: 2500,
            creditLimit: 15000,
            creditUtilization: 16.7,
            minimumPayment: 75,
          }),
          monthYear,
          date.toISOString()
        );
      }

      // Loan statement (auto loan)
      const loanDataId = randomUUID();
      const loanDate = new Date(now);
      loanDate.setFullYear(loanDate.getFullYear() - 3); // 3 years ago
      db.prepare(`
        INSERT INTO financial_data (id, user_id, data_type, source, raw_data, processed_data, month_year, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        loanDataId,
        userId,
        'loan_statement',
        'Auto Loan Statement.pdf',
        JSON.stringify({ fileName: 'auto_loan.pdf' }),
        JSON.stringify({
          loanBalance: 12000,
          loanMonthlyPayment: 350,
          loanType: 'auto',
          loanInterestRate: 4.5,
        }),
        `${loanDate.getFullYear()}-${String(loanDate.getMonth() + 1).padStart(2, '0')}`,
        loanDate.toISOString()
      );

      // Bills (all paid on time)
      for (let i = 0; i < 12; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const billDataId = randomUUID();
        db.prepare(`
          INSERT INTO financial_data (id, user_id, data_type, source, raw_data, processed_data, month_year, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          billDataId,
          userId,
          'bill',
          `Utility Bill ${monthYear}.pdf`,
          JSON.stringify({ fileName: `utility_${monthYear}.pdf` }),
          JSON.stringify({
            billAmount: 150,
            billType: 'utility',
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
      // Credit card (moderate utilization)
      for (let i = 0; i < 6; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const dataId = randomUUID();
        db.prepare(`
          INSERT INTO financial_data (id, user_id, data_type, source, raw_data, processed_data, month_year, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          dataId,
          userId,
          'credit_card_statement',
          `Credit Card Statement ${monthYear}.pdf`,
          JSON.stringify({ fileName: `credit_card_${monthYear}.pdf` }),
          JSON.stringify({
            creditCardBalance: 4200,
            creditLimit: 10000,
            creditUtilization: 42,
            minimumPayment: 125,
          }),
          monthYear,
          date.toISOString()
        );
      }

      // Bills (mostly on time, some late)
      for (let i = 0; i < 12; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const isLate = i < 2; // Last 2 months late
        
        const billDataId = randomUUID();
        db.prepare(`
          INSERT INTO financial_data (id, user_id, data_type, source, raw_data, processed_data, month_year, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          billDataId,
          userId,
          'bill',
          `Utility Bill ${monthYear}.pdf`,
          JSON.stringify({ fileName: `utility_${monthYear}.pdf` }),
          JSON.stringify({
            billAmount: 120,
            billType: 'utility',
            billDueDate: date.toISOString(),
            billPaymentStatus: isLate ? 'overdue' : 'paid',
            paymentTimeliness: isLate ? 70 : 100,
          }),
          monthYear,
          date.toISOString()
        );
      }
    }

    // Subprime customer - high utilization, late payments
    if (client.email === 'subprime@demo.com') {
      // Credit card (high utilization)
      for (let i = 0; i < 6; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const dataId = randomUUID();
        db.prepare(`
          INSERT INTO financial_data (id, user_id, data_type, source, raw_data, processed_data, month_year, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          dataId,
          userId,
          'credit_card_statement',
          `Credit Card Statement ${monthYear}.pdf`,
          JSON.stringify({ fileName: `credit_card_${monthYear}.pdf` }),
          JSON.stringify({
            creditCardBalance: 4800,
            creditLimit: 6000,
            creditUtilization: 80,
            minimumPayment: 150,
          }),
          monthYear,
          date.toISOString()
        );
      }

      // Bills (many late/missed)
      for (let i = 0; i < 12; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const isMissed = i < 3; // Last 3 months missed
        const isLate = i >= 3 && i < 6; // 3-6 months ago late
        
        const billDataId = randomUUID();
        db.prepare(`
          INSERT INTO financial_data (id, user_id, data_type, source, raw_data, processed_data, month_year, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          billDataId,
          userId,
          'bill',
          `Utility Bill ${monthYear}.pdf`,
          JSON.stringify({ fileName: `utility_${monthYear}.pdf` }),
          JSON.stringify({
            billAmount: 100,
            billType: 'utility',
            billDueDate: date.toISOString(),
            billPaymentStatus: isMissed ? 'overdue' : isLate ? 'overdue' : 'paid',
            paymentTimeliness: isMissed ? 30 : isLate ? 60 : 100,
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

