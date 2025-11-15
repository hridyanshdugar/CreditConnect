import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { scoreToGrade } from '@/lib/risk-calculator';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const segment = searchParams.get('segment') || 'all';
    const timeframe = searchParams.get('timeframe') || '30';
    const bankId = searchParams.get('bankId');

    // Build query based on filters
    let whereClause = '';
    const params: any[] = [];

    if (bankId) {
      whereClause = 'WHERE a.bank_id = ?';
      params.push(bankId);
    }

    // Get portfolio applications
    const applications = db.prepare(`
      SELECT 
        a.*,
        rp.helix_score,
        rp.risk_category,
        rp.flags
      FROM applications a
      LEFT JOIN risk_profiles rp ON a.user_id = rp.user_id
      ${whereClause}
      AND a.created_at >= datetime('now', '-${timeframe} days')
      ORDER BY a.created_at DESC
    `).all(...params) as any[];

    // Calculate aggregate metrics
    const totalApplications = applications.length;
    const approvedApplications = applications.filter(
      (a) => a.status === 'approved' || a.status === 'pre_approved'
    ).length;
    const stpEligible = applications.filter((a) => a.stp_eligible).length;

    // Risk distribution by grade
    const riskDistribution = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      F: 0,
    };

    applications.forEach((app) => {
      // Use stored grade if available, otherwise compute from score
      const grade = app.risk_category && ['A', 'B', 'C', 'D', 'E', 'F'].includes(app.risk_category)
        ? app.risk_category as 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
        : app.helix_score ? scoreToGrade(app.helix_score) : null;
      if (grade && riskDistribution.hasOwnProperty(grade)) {
        riskDistribution[grade as keyof typeof riskDistribution]++;
      }
    });

    // Average scores
    const scores = applications
      .map((a) => a.helix_score)
      .filter((s) => s !== null && s !== undefined);
    const avgScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    // Total loan amount
    const totalAmount = applications
      .filter((a) => a.offered_amount || a.requested_amount)
      .reduce(
        (sum, a) => sum + (a.offered_amount || a.requested_amount || 0),
        0
      );

    // Trends (last 7 days vs previous 7 days)
    const recentApps = applications.filter(
      (a) => new Date(a.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    const previousApps = applications.filter(
      (a) =>
        new Date(a.created_at) >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) &&
        new Date(a.created_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    const recentAvg = recentApps.length > 0
      ? recentApps
          .map((a) => a.helix_score)
          .filter((s) => s !== null)
          .reduce((a, b) => a + b, 0) / recentApps.length
      : 0;
    const previousAvg = previousApps.length > 0
      ? previousApps
          .map((a) => a.helix_score)
          .filter((s) => s !== null)
          .reduce((a, b) => a + b, 0) / previousApps.length
      : 0;

    return NextResponse.json({
      aggregateRisk: {
        averageHelixScore: Math.round(avgScore * 100) / 100,
        totalApplications,
        approvedApplications,
        approvalRate: totalApplications > 0
          ? (approvedApplications / totalApplications) * 100
          : 0,
        stpRate: totalApplications > 0
          ? (stpEligible / totalApplications) * 100
          : 0,
        totalLoanAmount: totalAmount,
      },
      distributions: {
        riskGrades: riskDistribution,
        statusBreakdown: {
          pending: applications.filter((a) => a.status === 'pending').length,
          pre_approved: applications.filter((a) => a.status === 'pre_approved').length,
          approved: applications.filter((a) => a.status === 'approved').length,
          rejected: applications.filter((a) => a.status === 'rejected').length,
          disbursed: applications.filter((a) => a.status === 'disbursed').length,
        },
      },
      trends: {
        scoreChange: recentAvg - previousAvg,
        direction: recentAvg < previousAvg ? 'improving' : recentAvg > previousAvg ? 'deteriorating' : 'stable',
        recentAverage: Math.round(recentAvg * 100) / 100,
        previousAverage: Math.round(previousAvg * 100) / 100,
      },
      outliers: applications
        .filter((a) => a.helix_score && (a.helix_score > 80 || a.helix_score < 20))
        .slice(0, 10)
        .map((a) => ({
          applicationId: a.id,
          userId: a.user_id,
          helixScore: a.helix_score,
          status: a.status,
        })),
    });
  } catch (error: any) {
    console.error('Portfolio analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze portfolio' },
      { status: 500 }
    );
  }
}

