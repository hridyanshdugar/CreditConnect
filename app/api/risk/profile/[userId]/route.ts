import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Get current profile
    const profile = db.prepare(`
      SELECT * FROM risk_profiles 
      WHERE user_id = ?
      ORDER BY created_at DESC LIMIT 1
    `).get(userId) as any;

    if (!profile) {
      return NextResponse.json(
        { error: 'Risk profile not found' },
        { status: 404 }
      );
    }

    // Get history (last 12 months)
    const history = db.prepare(`
      SELECT helix_score, risk_category, dimension_scores, created_at
      FROM risk_profile_history
      WHERE user_id = ?
      AND created_at >= datetime('now', '-12 months')
      ORDER BY created_at DESC
    `).all(userId) as any[];

    // Calculate trends
    const scores = history.map((h) => h.helix_score);
    const trend = scores.length > 1
      ? scores[0] - scores[scores.length - 1]
      : 0;

    // Get recommendations (from explanation)
    const explanation = JSON.parse(profile.explanation || '{}');
    const recommendations = explanation.recommendations || [];

    return NextResponse.json({
      currentProfile: {
        helixScore: profile.helix_score,
        riskCategory: profile.risk_category,
        dimensionScores: {
          financial: profile.financial_stability_score,
          behavioral: profile.behavioral_risk_score,
          alternative: profile.alternative_data_score,
          environmental: profile.environmental_risk_score,
          fraud: profile.fraud_risk_score,
        },
        flags: JSON.parse(profile.flags || '{}'),
        explanation: explanation,
        confidenceInterval: profile.confidence_interval,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
      history: history.map((h) => ({
        helixScore: h.helix_score,
        riskCategory: h.risk_category,
        dimensionScores: JSON.parse(h.dimension_scores || '{}'),
        createdAt: h.created_at,
      })),
      trends: {
        scoreChange: trend,
        direction: trend < 0 ? 'improving' : trend > 0 ? 'deteriorating' : 'stable',
        dataPoints: scores.length,
      },
      recommendations,
    });
  } catch (error: any) {
    console.error('Error fetching risk profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch risk profile' },
      { status: 500 }
    );
  }
}

