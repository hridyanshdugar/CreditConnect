import { NextRequest, NextResponse } from 'next/server';
import { HelixRiskCalculator, UserData, scoreToGrade } from '@/lib/risk-calculator';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

const calculator = new HelixRiskCalculator();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userData, calculationType = 'full' } = body;

    if (!userId || !userData) {
      return NextResponse.json(
        { error: 'userId and userData are required' },
        { status: 400 }
      );
    }

    // Calculate risk score
    const result = calculator.calculateHelixScore(userData as UserData);

    // Store risk profile in database
    const riskProfileId = randomUUID();
    const now = new Date().toISOString();

    // Store helix_grade in risk_category column for backward compatibility
    // We'll compute it from score when reading
    db.prepare(`
      INSERT INTO risk_profiles (
        id, user_id, helix_score, risk_category,
        stability_index, affordability_ratio, reliability_score,
        cash_flow_score, asset_score, behavior_score, fraud_score,
        financial_stability_score, behavioral_risk_score,
        alternative_data_score, economic_environment_score, fraud_risk_score,
        confidence_interval, flags, explanation, user_data, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      riskProfileId,
      userId,
      result.helixScore,
      result.helixGrade, // Store grade in risk_category column
      result.dimensionScores.financial, // stability_index
      userData.debtToIncomeRatio || null, // affordability_ratio
      result.dimensionScores.behavioral, // reliability_score
      result.dimensionScores.financial, // cash_flow_score (simplified)
      result.dimensionScores.alternative, // asset_score
      result.dimensionScores.behavioral, // behavior_score
      result.dimensionScores.fraud, // fraud_score
      result.dimensionScores.financial, // financial_stability_score
      result.dimensionScores.behavioral, // behavioral_risk_score
      result.dimensionScores.alternative, // alternative_data_score
      result.dimensionScores.economic_environment, // economic_environment_score
      result.dimensionScores.fraud, // fraud_risk_score
      result.confidenceInterval,
      JSON.stringify(result.flags),
      JSON.stringify(result.explanation),
      JSON.stringify(userData),
      now,
      now
    );

    // Store in history
    db.prepare(`
      INSERT INTO risk_profile_history (
        id, user_id, helix_score, risk_category, dimension_scores, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      randomUUID(),
      userId,
      result.helixScore,
      result.helixGrade, // Store grade in risk_category column
      JSON.stringify(result.dimensionScores),
      now
    );

    // Check for continuous monitoring alerts if this is an update
    const previousProfile = db.prepare(`
      SELECT helix_score FROM risk_profiles 
      WHERE user_id = ? AND id != ?
      ORDER BY created_at DESC LIMIT 1
    `).get(userId, riskProfileId) as { helix_score: number } | undefined;

    let monitoringResult = null;
    if (previousProfile) {
      monitoringResult = calculator.continuousMonitoring(
        result.helixScore,
        previousProfile.helix_score,
        userData as UserData
      );

      // Create alerts if needed
      if (monitoringResult.alerts.length > 0) {
        const alertStmt = db.prepare(`
          INSERT INTO risk_alerts (
            id, user_id, alert_type, severity, message,
            previous_score, current_score, delta, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const alert of monitoringResult.alerts) {
          alertStmt.run(
            randomUUID(),
            userId,
            alert.type,
            alert.severity,
            alert.message,
            previousProfile.helix_score,
            result.helixScore,
            monitoringResult.delta,
            now
          );
        }
      }
    }

    return NextResponse.json({
      helixGrade: result.helixGrade,
      helixScore: result.helixScore,
      dimensions: result.dimensionScores,
      explanation: result.explanation,
      confidence: result.confidenceInterval,
      flags: result.flags,
      profileId: riskProfileId,
      monitoring: monitoringResult,
    });
  } catch (error: any) {
    console.error('Risk calculation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate risk score' },
      { status: 500 }
    );
  }
}

