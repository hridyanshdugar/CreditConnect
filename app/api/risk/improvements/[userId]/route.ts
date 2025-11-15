import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { HelixRiskCalculator, UserData } from '@/lib/risk-calculator';

const calculator = new HelixRiskCalculator();

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Get current risk profile
    const profile = db.prepare(`
      SELECT helix_score, explanation FROM risk_profiles
      WHERE user_id = ?
      ORDER BY created_at DESC LIMIT 1
    `).get(userId) as any;

    if (!profile) {
      return NextResponse.json(
        { error: 'Risk profile not found' },
        { status: 404 }
      );
    }

    const currentScore = profile.helix_score;
    const explanation = JSON.parse(profile.explanation || '{}');

    // Generate improvement recommendations based on weak areas
    const improvements = [];

    // Analyze each dimension and provide recommendations
    if (explanation.concerns && explanation.concerns.length > 0) {
      for (const concern of explanation.concerns) {
        const dimension = concern.toLowerCase();
        
        if (dimension.includes('financial')) {
          improvements.push({
            dimension: 'Financial Stability',
            currentImpact: 'High',
            recommendedActions: [
              'Reduce debt-to-income ratio by paying down existing debt',
              'Build emergency fund to cover 3-6 months of expenses',
              'Maintain consistent employment for at least 24 months',
              'Increase savings rate to at least 20% of monthly income',
            ],
            potentialScoreImprovement: 10,
            timeframe: '3-6 months',
            priority: 'high',
          });
        }

        if (dimension.includes('behavioral')) {
          improvements.push({
            dimension: 'Behavioral Risk',
            currentImpact: 'High',
            recommendedActions: [
              'Set up automatic bill payments to ensure consistency',
              'Reduce discretionary spending to below 30% of income',
              'Maintain on-time payment history for all obligations',
              'Complete profile and submit required documents promptly',
            ],
            potentialScoreImprovement: 8,
            timeframe: '1-3 months',
            priority: 'high',
          });
        }

        if (dimension.includes('alternative')) {
          improvements.push({
            dimension: 'Alternative Data',
            currentImpact: 'Medium',
            recommendedActions: [
              'Build assets through savings and investments',
              'Maintain stable residence for extended periods',
              'Obtain professional licenses or certifications',
              'Establish health insurance coverage',
            ],
            potentialScoreImprovement: 5,
            timeframe: '6-12 months',
            priority: 'medium',
          });
        }

        if (dimension.includes('fraud')) {
          improvements.push({
            dimension: 'Fraud Risk',
            currentImpact: 'High',
            recommendedActions: [
              'Complete identity verification documents',
              'Verify address and phone number',
              'Ensure all submitted documents are authentic',
              'Maintain consistent device and location patterns',
            ],
            potentialScoreImprovement: 15,
            timeframe: 'Immediate',
            priority: 'critical',
          });
        }
      }
    }

    // If no specific concerns, provide general recommendations
    if (improvements.length === 0) {
      improvements.push({
        dimension: 'General',
        currentImpact: 'Low',
        recommendedActions: [
          'Maintain current financial habits',
          'Continue building emergency fund',
          'Keep payment history consistent',
        ],
        potentialScoreImprovement: 2,
        timeframe: 'Ongoing',
        priority: 'low',
      });
    }

    return NextResponse.json({
      currentScore,
      recommendations: improvements,
      explanation: explanation.recommendations || [],
    });
  } catch (error: any) {
    console.error('Error fetching improvements:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch improvement recommendations' },
      { status: 500 }
    );
  }
}

