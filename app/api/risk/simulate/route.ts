import { NextRequest, NextResponse } from 'next/server';
import { HelixRiskCalculator, UserData } from '@/lib/risk-calculator';
import db from '@/lib/db';

const calculator = new HelixRiskCalculator();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, scenarios } = body;

    if (!userId || !scenarios || !Array.isArray(scenarios)) {
      return NextResponse.json(
        { error: 'userId and scenarios array are required' },
        { status: 400 }
      );
    }

    // Get current user data
    const currentProfile = db.prepare(`
      SELECT * FROM risk_profiles 
      WHERE user_id = ?
      ORDER BY created_at DESC LIMIT 1
    `).get(userId) as any;

    if (!currentProfile) {
      return NextResponse.json(
        { error: 'Current risk profile not found. Please calculate risk first.' },
        { status: 404 }
      );
    }

    // Get base user data (would normally come from financial_data table)
    // For now, we'll use a simplified approach
    const baseUserData: UserData = {
      // Default values - in production, these would come from actual user data
      debtToIncomeRatio: 0.35,
      paymentTimeliness: 80,
      employmentDuration: 24,
      averageMonthlyBalance: 5000,
    };

    const results = scenarios.map((scenario: Record<string, any>) => {
      // Merge scenario changes with base data
      const scenarioData: UserData = {
        ...baseUserData,
        ...scenario,
      };

      // Calculate projected score
      const result = calculator.calculateHelixScore(scenarioData);

      // Calculate impact
      const currentScore = currentProfile.helix_score;
      const impact = result.helixScore - currentScore;

      return {
        scenario: scenario,
        projectedScore: result.helixScore,
        projectedGrade: result.helixGrade,
        impact: impact,
        impactPercentage: ((impact / currentScore) * 100).toFixed(2),
        dimensionScores: result.dimensionScores,
        timeline: estimateTimeline(scenario),
      };
    });

    return NextResponse.json({
      currentScore: currentProfile.helix_score,
      scenarios: results,
    });
  } catch (error: any) {
    console.error('Risk simulation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to simulate risk scenarios' },
      { status: 500 }
    );
  }
}

function estimateTimeline(scenario: Record<string, any>): string {
  // Estimate how long it would take to achieve the scenario
  if (scenario.debtToIncomeRatio !== undefined) {
    return '3-6 months';
  }
  if (scenario.paymentTimeliness !== undefined) {
    return '6-12 months';
  }
  if (scenario.employmentDuration !== undefined) {
    return '12+ months';
  }
  if (scenario.averageMonthlyBalance !== undefined) {
    return '1-3 months';
  }
  return 'Varies';
}

