// Helix Risk Calculator - TypeScript Implementation

export interface UserData {
  // Financial Stability Metrics
  monthlyIncome?: number;
  monthlyIncomeVariance?: number;
  employmentDuration?: number; // months
  multipleIncomeStreams?: number;
  seasonalityPatterns?: Record<string, number>;
  averageMonthlyBalance?: number;
  overdraftFrequency?: number;
  savingsRate?: number;
  emergencyFundCoverage?: number; // months
  debtToIncomeRatio?: number;
  paymentTimeliness?: number; // 0-100
  creditUtilization?: number; // 0-100
  debtDiversification?: number;
  
  // Behavioral Risk Indicators
  discretionarySpendingRatio?: number;
  gamblingActivity?: number; // 0-100
  luxurySpendingTrends?: number;
  budgetAdherence?: number; // 0-100
  billPaymentConsistency?: number; // 0-100
  rentPaymentHistory?: number; // 0-100
  utilityPaymentPatterns?: number; // 0-100
  subscriptionManagement?: number; // 0-100
  appEngagementFrequency?: number; // 0-100
  documentSubmissionTimeliness?: number; // 0-100
  profileCompleteness?: number; // 0-100
  fraudRiskSignals?: number; // 0-100
  
  // Alternative Data Signals
  professionalNetworkStrength?: number; // 0-100
  educationLevel?: number; // 0-100
  skillMarketability?: number; // 0-100
  geographicStability?: number; // months at current location
  vehicleOwnership?: boolean;
  propertyOwnership?: boolean;
  investmentAccounts?: number;
  businessOwnership?: boolean;
  residentialStability?: number; // months
  familyStructure?: string;
  healthInsuranceCoverage?: boolean;
  professionalLicenses?: number;
  
  // Market & Environmental Risk
  industryVolatility?: number; // 0-100
  regionalEconomicHealth?: number; // 0-100
  interestRateTrends?: number; // -100 to 100
  inflationImpact?: number; // 0-100
  
  // Fraud & Security Risk
  documentAuthenticity?: number; // 0-100
  biometricMatchScore?: number; // 0-100
  addressVerification?: boolean;
  phoneNumberStability?: number; // months
  unusualTransferPatterns?: number; // 0-100
  velocityChecks?: number; // 0-100
  geolocationAnomalies?: number; // 0-100
  deviceFingerprinting?: number; // 0-100
}

export interface DimensionScores {
  financial: number;
  behavioral: number;
  alternative: number;
  environmental: number;
  fraud: number;
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

export interface RiskCalculationResult {
  helixScore: number; // 0-100, lower is better
  riskCategory: 'prime' | 'near_prime' | 'subprime' | 'deep_subprime' | 'decline';
  dimensionScores: DimensionScores;
  explanation: RiskExplanation;
  confidenceInterval: number;
  flags: {
    highRisk: boolean;
    requiresManualReview: boolean;
    fastTrackEligible: boolean;
    primeCustomer: boolean;
  };
}

export class HelixRiskCalculator {
  private riskDimensions = {
    financial_stability: 0.35,
    behavioral_risk: 0.25,
    alternative_data: 0.20,
    environmental_risk: 0.10,
    fraud_risk: 0.10,
  };

  private riskThresholds = {
    prime: { min: 0, max: 25 },
    near_prime: { min: 26, max: 45 },
    subprime: { min: 46, max: 65 },
    deep_subprime: { min: 66, max: 85 },
    decline: { min: 86, max: 100 },
  };

  calculateHelixScore(userData: UserData): RiskCalculationResult {
    // Calculate each dimension
    const financialScore = this.assessFinancialStability(userData);
    const behavioralScore = this.assessBehavioralPatterns(userData);
    const alternativeScore = this.assessAlternativeSignals(userData);
    const environmentalScore = this.assessEnvironmentalFactors(userData);
    const fraudScore = this.assessFraudRisk(userData);

    const dimensionScores: DimensionScores = {
      financial: financialScore.score,
      behavioral: behavioralScore.score,
      alternative: alternativeScore.score,
      environmental: environmentalScore.score,
      fraud: fraudScore.score,
    };

    // Calculate weighted score
    const weightedScore =
      financialScore.score * this.riskDimensions.financial_stability +
      behavioralScore.score * this.riskDimensions.behavioral_risk +
      alternativeScore.score * this.riskDimensions.alternative_data +
      environmentalScore.score * this.riskDimensions.environmental_risk +
      fraudScore.score * this.riskDimensions.fraud_risk;

    // Calculate confidence
    const confidenceInterval = this.calculateConfidence(userData, {
      financial: financialScore.confidence,
      behavioral: behavioralScore.confidence,
      alternative: alternativeScore.confidence,
      environmental: environmentalScore.confidence,
      fraud: fraudScore.confidence,
    });

    // Get risk category
    const riskCategory = this.getRiskCategory(weightedScore);

    // Generate explanation
    const explanation = this.generateRiskExplanation(
      dimensionScores,
      userData,
      {
        financial: financialScore.factors,
        behavioral: behavioralScore.factors,
        alternative: alternativeScore.factors,
        environmental: environmentalScore.factors,
        fraud: fraudScore.factors,
      }
    );

    // Determine flags
    const flags = {
      highRisk: weightedScore >= 66,
      requiresManualReview: weightedScore >= 45 || fraudScore.score >= 70,
      fastTrackEligible: weightedScore <= 30 && fraudScore.score <= 20,
      primeCustomer: weightedScore <= 25,
    };

    return {
      helixScore: Math.round(weightedScore * 100) / 100,
      riskCategory,
      dimensionScores,
      explanation,
      confidenceInterval,
      flags,
    };
  }

  private assessFinancialStability(userData: UserData): {
    score: number;
    confidence: number;
    factors: string[];
  } {
    let score = 0;
    let confidence = 1.0;
    const factors: string[] = [];

    // Income Consistency (40% weight)
    const incomeConsistencyWeight = 0.4;
    let incomeScore = 50; // Default neutral

    if (userData.employmentDuration !== undefined) {
      const employmentScore = Math.min(100, (userData.employmentDuration / 24) * 100);
      incomeScore += (employmentScore - 50) * 0.3;
      factors.push(`Employment duration: ${userData.employmentDuration} months`);
    }

    if (userData.monthlyIncomeVariance !== undefined) {
      const variancePenalty = Math.min(50, userData.monthlyIncomeVariance * 10);
      incomeScore -= variancePenalty * 0.2;
      factors.push(`Income variance: ${userData.monthlyIncomeVariance.toFixed(2)}%`);
    }

    if (userData.multipleIncomeStreams !== undefined) {
      incomeScore += Math.min(20, userData.multipleIncomeStreams * 5);
      factors.push(`Multiple income streams: ${userData.multipleIncomeStreams}`);
    }

    score += incomeScore * incomeConsistencyWeight;

    // Cash Flow Health (35% weight)
    const cashFlowWeight = 0.35;
    let cashFlowScore = 50;

    if (userData.averageMonthlyBalance !== undefined && userData.monthlyIncome) {
      const balanceRatio = userData.averageMonthlyBalance / userData.monthlyIncome;
      cashFlowScore = Math.min(100, balanceRatio * 200);
      factors.push(`Average balance ratio: ${balanceRatio.toFixed(2)}`);
    }

    if (userData.overdraftFrequency !== undefined) {
      cashFlowScore -= Math.min(30, userData.overdraftFrequency * 5);
      factors.push(`Overdraft frequency: ${userData.overdraftFrequency}`);
    }

    if (userData.savingsRate !== undefined) {
      cashFlowScore += Math.min(30, userData.savingsRate * 2);
      factors.push(`Savings rate: ${userData.savingsRate}%`);
    }

    if (userData.emergencyFundCoverage !== undefined) {
      cashFlowScore += Math.min(20, userData.emergencyFundCoverage * 4);
      factors.push(`Emergency fund: ${userData.emergencyFundCoverage} months`);
    }

    score += cashFlowScore * cashFlowWeight;

    // Debt Management (25% weight)
    const debtWeight = 0.25;
    let debtScore = 50;

    if (userData.debtToIncomeRatio !== undefined) {
      if (userData.debtToIncomeRatio <= 0.36) {
        debtScore = 100 - userData.debtToIncomeRatio * 100;
      } else if (userData.debtToIncomeRatio <= 0.43) {
        debtScore = 70 - (userData.debtToIncomeRatio - 0.36) * 500;
      } else {
        debtScore = Math.max(0, 50 - (userData.debtToIncomeRatio - 0.43) * 500);
      }
      factors.push(`Debt-to-income ratio: ${(userData.debtToIncomeRatio * 100).toFixed(1)}%`);
    }

    if (userData.paymentTimeliness !== undefined) {
      debtScore = (debtScore + userData.paymentTimeliness) / 2;
      factors.push(`Payment timeliness: ${userData.paymentTimeliness}%`);
    }

    if (userData.creditUtilization !== undefined) {
      const utilizationPenalty = Math.max(0, (userData.creditUtilization - 30) * 0.5);
      debtScore -= utilizationPenalty;
      factors.push(`Credit utilization: ${userData.creditUtilization}%`);
    }

    score += debtScore * debtWeight;

    // Adjust confidence based on data completeness
    const dataPoints = [
      userData.employmentDuration,
      userData.monthlyIncomeVariance,
      userData.averageMonthlyBalance,
      userData.debtToIncomeRatio,
      userData.paymentTimeliness,
    ].filter((v) => v !== undefined).length;

    confidence = Math.min(1.0, dataPoints / 5);

    return {
      score: Math.max(0, Math.min(100, score)),
      confidence,
      factors,
    };
  }

  private assessBehavioralPatterns(userData: UserData): {
    score: number;
    confidence: number;
    factors: string[];
  } {
    let score = 0;
    let confidence = 1.0;
    const factors: string[] = [];

    // Spending Patterns (35% weight)
    const spendingWeight = 0.35;
    let spendingScore = 50;

    if (userData.discretionarySpendingRatio !== undefined) {
      if (userData.discretionarySpendingRatio <= 0.3) {
        spendingScore = 100;
      } else if (userData.discretionarySpendingRatio <= 0.5) {
        spendingScore = 80 - (userData.discretionarySpendingRatio - 0.3) * 100;
      } else {
        spendingScore = Math.max(0, 60 - (userData.discretionarySpendingRatio - 0.5) * 120);
      }
      factors.push(`Discretionary spending: ${(userData.discretionarySpendingRatio * 100).toFixed(1)}%`);
    }

    if (userData.gamblingActivity !== undefined) {
      spendingScore -= userData.gamblingActivity * 0.5;
      factors.push(`Gambling activity risk: ${userData.gamblingActivity}%`);
    }

    if (userData.budgetAdherence !== undefined) {
      spendingScore = (spendingScore + userData.budgetAdherence) / 2;
      factors.push(`Budget adherence: ${userData.budgetAdherence}%`);
    }

    score += spendingScore * spendingWeight;

    // Financial Responsibility (40% weight)
    const responsibilityWeight = 0.4;
    let responsibilityScore = 50;

    const paymentMetrics = [
      { value: userData.billPaymentConsistency, name: 'Bill payments' },
      { value: userData.rentPaymentHistory, name: 'Rent payments' },
      { value: userData.utilityPaymentPatterns, name: 'Utility payments' },
    ];

    const paymentScores = paymentMetrics
      .filter((m) => m.value !== undefined)
      .map((m) => m.value!);

    if (paymentScores.length > 0) {
      responsibilityScore = paymentScores.reduce((a, b) => a + b, 0) / paymentScores.length;
      factors.push(`Payment consistency: ${responsibilityScore.toFixed(1)}%`);
    }

    if (userData.subscriptionManagement !== undefined) {
      responsibilityScore = (responsibilityScore + userData.subscriptionManagement) / 2;
      factors.push(`Subscription management: ${userData.subscriptionManagement}%`);
    }

    score += responsibilityScore * responsibilityWeight;

    // Digital Behavior (25% weight)
    const digitalWeight = 0.25;
    let digitalScore = 50;

    if (userData.appEngagementFrequency !== undefined) {
      digitalScore += (userData.appEngagementFrequency - 50) * 0.3;
      factors.push(`App engagement: ${userData.appEngagementFrequency}%`);
    }

    if (userData.documentSubmissionTimeliness !== undefined) {
      digitalScore += (userData.documentSubmissionTimeliness - 50) * 0.3;
      factors.push(`Document timeliness: ${userData.documentSubmissionTimeliness}%`);
    }

    if (userData.profileCompleteness !== undefined) {
      digitalScore += (userData.profileCompleteness - 50) * 0.2;
      factors.push(`Profile completeness: ${userData.profileCompleteness}%`);
    }

    if (userData.fraudRiskSignals !== undefined) {
      digitalScore -= userData.fraudRiskSignals * 0.5;
      factors.push(`Fraud risk signals: ${userData.fraudRiskSignals}%`);
    }

    score += digitalScore * digitalWeight;

    // Confidence calculation
    const dataPoints = [
      userData.discretionarySpendingRatio,
      userData.billPaymentConsistency,
      userData.rentPaymentHistory,
      userData.appEngagementFrequency,
    ].filter((v) => v !== undefined).length;

    confidence = Math.min(1.0, dataPoints / 4);

    return {
      score: Math.max(0, Math.min(100, score)),
      confidence,
      factors,
    };
  }

  private assessAlternativeSignals(userData: UserData): {
    score: number;
    confidence: number;
    factors: string[];
  } {
    let score = 0;
    let confidence = 1.0;
    const factors: string[] = [];

    // Social Capital (30% weight)
    const socialWeight = 0.3;
    let socialScore = 50;

    if (userData.professionalNetworkStrength !== undefined) {
      socialScore += (userData.professionalNetworkStrength - 50) * 0.4;
      factors.push(`Professional network: ${userData.professionalNetworkStrength}%`);
    }

    if (userData.educationLevel !== undefined) {
      socialScore += (userData.educationLevel - 50) * 0.3;
      factors.push(`Education level: ${userData.educationLevel}%`);
    }

    if (userData.skillMarketability !== undefined) {
      socialScore += (userData.skillMarketability - 50) * 0.2;
      factors.push(`Skill marketability: ${userData.skillMarketability}%`);
    }

    if (userData.geographicStability !== undefined) {
      const stabilityScore = Math.min(100, (userData.geographicStability / 24) * 100);
      socialScore = (socialScore + stabilityScore) / 2;
      factors.push(`Geographic stability: ${userData.geographicStability} months`);
    }

    score += socialScore * socialWeight;

    // Asset Profile (40% weight)
    const assetWeight = 0.4;
    let assetScore = 50;

    if (userData.vehicleOwnership) {
      assetScore += 15;
      factors.push('Vehicle ownership: Yes');
    }

    if (userData.propertyOwnership) {
      assetScore += 25;
      factors.push('Property ownership: Yes');
    }

    if (userData.investmentAccounts !== undefined) {
      assetScore += Math.min(20, userData.investmentAccounts * 5);
      factors.push(`Investment accounts: ${userData.investmentAccounts}`);
    }

    if (userData.businessOwnership) {
      assetScore += 20;
      factors.push('Business ownership: Yes');
    }

    score += assetScore * assetWeight;

    // Lifestyle Stability (30% weight)
    const lifestyleWeight = 0.3;
    let lifestyleScore = 50;

    if (userData.residentialStability !== undefined) {
      const residentialScore = Math.min(100, (userData.residentialStability / 24) * 100);
      lifestyleScore = residentialScore;
      factors.push(`Residential stability: ${userData.residentialStability} months`);
    }

    if (userData.healthInsuranceCoverage) {
      lifestyleScore += 15;
      factors.push('Health insurance: Yes');
    }

    if (userData.professionalLicenses !== undefined) {
      lifestyleScore += Math.min(15, userData.professionalLicenses * 5);
      factors.push(`Professional licenses: ${userData.professionalLicenses}`);
    }

    score += lifestyleScore * lifestyleWeight;

    // Confidence
    const dataPoints = [
      userData.professionalNetworkStrength,
      userData.vehicleOwnership,
      userData.propertyOwnership,
      userData.residentialStability,
    ].filter((v) => v !== undefined).length;

    confidence = Math.min(1.0, dataPoints / 4);

    return {
      score: Math.max(0, Math.min(100, score)),
      confidence,
      factors,
    };
  }

  private assessEnvironmentalFactors(userData: UserData): {
    score: number;
    confidence: number;
    factors: string[];
  } {
    let score = 50; // Default neutral
    let confidence = 0.8; // Lower confidence for environmental factors
    const factors: string[] = [];

    // Macroeconomic (40% weight)
    const macroWeight = 0.4;
    let macroScore = 50;

    if (userData.industryVolatility !== undefined) {
      macroScore -= userData.industryVolatility * 0.3;
      factors.push(`Industry volatility: ${userData.industryVolatility}%`);
    }

    if (userData.regionalEconomicHealth !== undefined) {
      macroScore += (userData.regionalEconomicHealth - 50) * 0.4;
      factors.push(`Regional economic health: ${userData.regionalEconomicHealth}%`);
    }

    if (userData.interestRateTrends !== undefined) {
      // Negative trends (increasing rates) are bad
      macroScore -= Math.max(0, userData.interestRateTrends) * 0.2;
      factors.push(`Interest rate trends: ${userData.interestRateTrends > 0 ? 'Increasing' : 'Decreasing'}`);
    }

    if (userData.inflationImpact !== undefined) {
      macroScore -= userData.inflationImpact * 0.2;
      factors.push(`Inflation impact: ${userData.inflationImpact}%`);
    }

    score = score * (1 - macroWeight) + macroScore * macroWeight;

    // Regulatory (30% weight) - assumed neutral for now
    // This would be customized based on jurisdiction

    return {
      score: Math.max(0, Math.min(100, score)),
      confidence,
      factors,
    };
  }

  private assessFraudRisk(userData: UserData): {
    score: number;
    confidence: number;
    factors: string[];
  } {
    let score = 0;
    let confidence = 1.0;
    const factors: string[] = [];

    // Identity Verification (50% weight)
    const identityWeight = 0.5;
    let identityScore = 50;

    if (userData.documentAuthenticity !== undefined) {
      identityScore = userData.documentAuthenticity;
      factors.push(`Document authenticity: ${userData.documentAuthenticity}%`);
    }

    if (userData.biometricMatchScore !== undefined) {
      identityScore = (identityScore + userData.biometricMatchScore) / 2;
      factors.push(`Biometric match: ${userData.biometricMatchScore}%`);
    }

    if (userData.addressVerification) {
      identityScore += 10;
      factors.push('Address verification: Verified');
    }

    if (userData.phoneNumberStability !== undefined) {
      const phoneScore = Math.min(100, (userData.phoneNumberStability / 12) * 100);
      identityScore = (identityScore + phoneScore) / 2;
      factors.push(`Phone stability: ${userData.phoneNumberStability} months`);
    }

    score += identityScore * identityWeight;

    // Transaction Anomaly (50% weight)
    const transactionWeight = 0.5;
    let transactionScore = 50;

    if (userData.unusualTransferPatterns !== undefined) {
      transactionScore -= userData.unusualTransferPatterns * 0.5;
      factors.push(`Unusual transfers: ${userData.unusualTransferPatterns}%`);
    }

    if (userData.velocityChecks !== undefined) {
      transactionScore -= userData.velocityChecks * 0.3;
      factors.push(`Velocity risk: ${userData.velocityChecks}%`);
    }

    if (userData.geolocationAnomalies !== undefined) {
      transactionScore -= userData.geolocationAnomalies * 0.4;
      factors.push(`Geolocation anomalies: ${userData.geolocationAnomalies}%`);
    }

    if (userData.deviceFingerprinting !== undefined) {
      transactionScore += (userData.deviceFingerprinting - 50) * 0.3;
      factors.push(`Device fingerprinting: ${userData.deviceFingerprinting}%`);
    }

    score += transactionScore * transactionWeight;

    // Confidence
    const dataPoints = [
      userData.documentAuthenticity,
      userData.biometricMatchScore,
      userData.addressVerification,
      userData.unusualTransferPatterns,
    ].filter((v) => v !== undefined).length;

    confidence = Math.min(1.0, dataPoints / 4);

    return {
      score: Math.max(0, Math.min(100, score)),
      confidence,
      factors,
    };
  }

  private calculateConfidence(
    userData: UserData,
    dimensionConfidences: Record<string, number>
  ): number {
    const weights = Object.values(this.riskDimensions);
    const confidences = Object.values(dimensionConfidences);
    
    const weightedConfidence = weights.reduce((sum, weight, index) => {
      return sum + weight * confidences[index];
    }, 0);

    return Math.round(weightedConfidence * 100) / 100;
  }

  private getRiskCategory(score: number): 'prime' | 'near_prime' | 'subprime' | 'deep_subprime' | 'decline' {
    if (score <= this.riskThresholds.prime.max) return 'prime';
    if (score <= this.riskThresholds.near_prime.max) return 'near_prime';
    if (score <= this.riskThresholds.subprime.max) return 'subprime';
    if (score <= this.riskThresholds.deep_subprime.max) return 'deep_subprime';
    return 'decline';
  }

  private generateRiskExplanation(
    dimensionScores: DimensionScores,
    userData: UserData,
    factorDetails: Record<string, string[]>
  ): RiskExplanation {
    const explanation: RiskExplanation = {
      summary: '',
      keyFactors: [],
      strengths: [],
      concerns: [],
      recommendations: [],
    };

    // Identify top risk drivers
    const dimensionEntries = Object.entries(dimensionScores).sort((a, b) => b[1] - a[1]);
    const highestRisk = dimensionEntries[0];
    const lowestRisk = dimensionEntries[dimensionEntries.length - 1];

    // Generate summary
    const overallScore = Object.values(dimensionScores).reduce((a, b) => a + b, 0) / 5;
    explanation.summary = `Your Helix Score of ${overallScore.toFixed(1)} places you in the ${this.getRiskCategory(overallScore)} category. `;
    
    if (highestRisk[1] > 70) {
      explanation.summary += `Primary concern: ${highestRisk[0]} risk is elevated. `;
    }
    if (lowestRisk[1] < 30) {
      explanation.summary += `Key strength: ${lowestRisk[0]} risk is well-managed.`;
    }

    // Extract key factors
    const allFactors = Object.entries(factorDetails).flatMap(([dimension, factors]) =>
      factors.map((factor) => ({
        dimension,
        factor,
        impact: dimensionScores[dimension as keyof DimensionScores],
      }))
    );

    // Top 5 factors by impact
    const topFactors = allFactors
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 5)
      .map((f) => ({
        factor: f.factor,
        impact: Math.abs(f.impact - 50),
        direction: f.impact < 50 ? 'positive' : 'negative' as 'positive' | 'negative',
        explanation: `${f.dimension}: ${f.factor}`,
      }));

    explanation.keyFactors = topFactors;

    // Strengths and concerns
    dimensionEntries.forEach(([dimension, score]) => {
      if (score < 30) {
        explanation.strengths.push(`Strong ${dimension.replace('_', ' ')} management`);
      } else if (score > 70) {
        explanation.concerns.push(`Elevated ${dimension.replace('_', ' ')} risk`);
      }
    });

    // Recommendations
    if (dimensionScores.financial > 60) {
      explanation.recommendations.push('Improve debt-to-income ratio by reducing expenses or increasing income');
    }
    if (dimensionScores.behavioral > 60) {
      explanation.recommendations.push('Establish consistent payment history for bills and rent');
    }
    if (dimensionScores.alternative < 40) {
      explanation.recommendations.push('Build assets and maintain stable employment');
    }
    if (dimensionScores.fraud > 50) {
      explanation.recommendations.push('Complete identity verification and address documentation');
    }

    return explanation;
  }

  // Continuous monitoring method
  continuousMonitoring(
    currentScore: number,
    previousScore: number,
    userData: UserData
  ): {
    delta: number;
    alerts: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
    }>;
    interventionRequired: boolean;
  } {
    const delta = currentScore - previousScore;
    const alerts: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
    }> = [];
    let interventionRequired = false;

    // Check for significant score increase
    if (delta > 10) {
      alerts.push({
        type: 'score_increase',
        severity: delta > 20 ? 'high' : 'medium',
        message: `Risk score increased by ${delta.toFixed(1)} points`,
      });
      if (delta > 20) interventionRequired = true;
    }

    // Check for income drop
    if (userData.monthlyIncome && userData.monthlyIncomeVariance && userData.monthlyIncomeVariance > 0.2) {
      alerts.push({
        type: 'income_drop',
        severity: 'high',
        message: 'Significant income variance detected',
      });
      interventionRequired = true;
    }

    // Check for missed payments
    if (userData.paymentTimeliness !== undefined && userData.paymentTimeliness < 70) {
      alerts.push({
        type: 'payment_issues',
        severity: userData.paymentTimeliness < 50 ? 'critical' : 'high',
        message: 'Payment timeliness below acceptable threshold',
      });
      if (userData.paymentTimeliness < 50) interventionRequired = true;
    }

    return {
      delta,
      alerts,
      interventionRequired,
    };
  }
}

