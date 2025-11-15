// Type definitions for Credit Connect

export type UserRole = 'client' | 'bank' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientProfile {
  id: string;
  userId: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  employmentStatus?: string;
  employmentDuration?: number;
  monthlyIncome?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BankProfile {
  id: string;
  userId: string;
  bankName: string;
  licenseNumber?: string;
  contactEmail?: string;
  createdAt: string;
}

export interface RiskFlags {
  highRisk: boolean;
  requiresManualReview: boolean;
  fastTrackEligible: boolean;
  primeCustomer: boolean;
}

export interface RiskExplanation {
  summary: string;
  keyFactors: Array<{
    factor: string;
    impact: number;
    direction: 'positive' | 'negative';
    explanation: string;
  }>;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
}

export interface DimensionScores {
  financial: number;
  behavioral: number;
  alternative: number;
  environmental: number;
  fraud: number;
}

export interface RiskProfile {
  id: string;
  userId: string;
  helixScore: number; // 0-100, lower is better
  riskCategory: 'prime' | 'near_prime' | 'subprime' | 'deep_subprime' | 'decline';
  stabilityIndex?: number;
  affordabilityRatio?: number;
  reliabilityScore?: number;
  cashFlowScore?: number;
  assetScore?: number;
  behaviorScore?: number;
  fraudScore?: number;
  financialStabilityScore?: number;
  behavioralRiskScore?: number;
  alternativeDataScore?: number;
  environmentalRiskScore?: number;
  fraudRiskScore?: number;
  confidenceInterval?: number;
  flags: RiskFlags;
  explanation: RiskExplanation;
  dimensionScores: DimensionScores;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  bankId: string;
  name: string;
  description?: string;
  productType: 'personal_loan' | 'auto_loan' | 'mortgage' | 'credit_line';
  minHelixScore?: number;
  maxHelixScore?: number;
  baseInterestRate: number;
  minLoanAmount: number;
  maxLoanAmount: number;
  minTermMonths: number;
  maxTermMonths: number;
  baseOriginationFee?: number;
  requirements?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalizedPricing {
  interestRate: number;
  originationFee: number;
  maxAmount: number;
  terms: number[];
}

export interface ProductMatch {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  matchScore: number;
  preApproved: boolean;
  personalizedPricing: PersonalizedPricing;
  instantApproval: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface Application {
  id: string;
  userId: string;
  productId: string;
  bankId: string;
  requestedAmount: number;
  requestedTermMonths: number;
  status: 'pending' | 'pre_approved' | 'approved' | 'rejected' | 'withdrawn' | 'disbursed';
  offeredInterestRate?: number;
  offeredAmount?: number;
  offeredTermMonths?: number;
  helixScoreAtApplication?: number;
  stpEligible: boolean;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskAlert {
  id: string;
  userId: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  previousScore?: number;
  currentScore?: number;
  delta?: number;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export interface FinancialData {
  id: string;
  userId: string;
  dataType: 'bank_statement' | 'pay_stub' | 'tax_return' | 'credit_card_statement' | 'loan_statement' | 'debt_statement' | 'bill' | 'transaction' | 'balance';
  source?: string;
  rawData?: Record<string, any>;
  processedData?: Record<string, any>;
  monthYear?: string;
  createdAt: string;
}

export interface RiskImprovementGoal {
  id: string;
  userId: string;
  targetScore: number;
  currentScore: number;
  deadline?: string;
  milestones?: Array<{
    description: string;
    targetScore: number;
    completed: boolean;
    completedAt?: string;
  }>;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: string;
  updatedAt: string;
}

