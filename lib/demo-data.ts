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

  // Clear existing demo data (optional - comment out if you want to preserve data)
  // clearDemoData();

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

  // Check if demo users already exist
  const existingPrime = db.prepare('SELECT id FROM users WHERE email = ?').get('prime@demo.com') as any;
  const existingNearPrime = db.prepare('SELECT id FROM users WHERE email = ?').get('nearprime@demo.com') as any;
  const existingSubprime = db.prepare('SELECT id FROM users WHERE email = ?').get('subprime@demo.com') as any;
  
  if (existingPrime && existingNearPrime && existingSubprime) {
    console.log('⚠️  Demo users already exist. Skipping user creation.');
    // Fetch existing users with their profile data
    const primeUser = db.prepare('SELECT id FROM users WHERE email = ?').get('prime@demo.com') as any;
    const nearPrimeUser = db.prepare('SELECT id FROM users WHERE email = ?').get('nearprime@demo.com') as any;
    const subprimeUser = db.prepare('SELECT id FROM users WHERE email = ?').get('subprime@demo.com') as any;
    
    const primeProfile = db.prepare('SELECT id FROM client_profiles WHERE user_id = ?').get(primeUser.id) as any;
    const nearPrimeProfile = db.prepare('SELECT id FROM client_profiles WHERE user_id = ?').get(nearPrimeUser.id) as any;
    const subprimeProfile = db.prepare('SELECT id FROM client_profiles WHERE user_id = ?').get(subprimeUser.id) as any;
    
    // Store profile data for risk calculation
    const profileDataMap: Record<string, any> = {
      'prime@demo.com': {
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
      'nearprime@demo.com': {
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
      'subprime@demo.com': {
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
    };
    
    clients.push({ userId: primeUser.id, profileId: primeProfile?.id, email: 'prime@demo.com', profile: profileDataMap['prime@demo.com'] });
    clients.push({ userId: nearPrimeUser.id, profileId: nearPrimeProfile?.id, email: 'nearprime@demo.com', profile: profileDataMap['nearprime@demo.com'] });
    clients.push({ userId: subprimeUser.id, profileId: subprimeProfile?.id, email: 'subprime@demo.com', profile: profileDataMap['subprime@demo.com'] });
    
    // Fetch existing banks
    const bankEmails = ['rbc@demo.com', 'td@demo.com', 'scotiabank@demo.com', 'bmo@demo.com', 'cibc@demo.com'];
    for (const email of bankEmails) {
      const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;
      if (user) {
        const bankProfile = db.prepare('SELECT id, bank_name FROM bank_profiles WHERE user_id = ?').get(user.id) as any;
        if (bankProfile) {
          banks.push({ userId: user.id, bankProfileId: bankProfile.id, email, bankName: bankProfile.bank_name });
        }
      }
    }
    
    return { clients, banks };
  }

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
  // Check if products already exist for any bank
  const existingProducts = db.prepare('SELECT COUNT(*) as count FROM products').get() as any;
  if (existingProducts && existingProducts.count > 0) {
    console.log('⚠️  Products already exist. Skipping product creation.');
    return;
  }

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

function clearDemoData() {
  // Optional: Clear existing demo data
  // Uncomment if you want to reset demo data on each run
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

  for (const email of demoEmails) {
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;
    if (user) {
      db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
    }
  }
}

