import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Get current risk profile
    const currentProfile = db.prepare(`
      SELECT helix_score, created_at FROM risk_profiles
      WHERE user_id = ?
      ORDER BY created_at DESC LIMIT 1
    `).get(userId) as any;

    if (!currentProfile) {
      return NextResponse.json(
        { error: 'Risk profile not found' },
        { status: 404 }
      );
    }

    // Get previous profile for comparison
    const previousProfile = db.prepare(`
      SELECT helix_score, created_at FROM risk_profiles
      WHERE user_id = ? AND id != (
        SELECT id FROM risk_profiles WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
      )
      ORDER BY created_at DESC LIMIT 1
    `).get(userId, userId) as any;

    // Get active alerts
    const alerts = db.prepare(`
      SELECT * FROM risk_alerts
      WHERE user_id = ? AND is_resolved = 0
      ORDER BY created_at DESC
    `).all(userId) as any[];

    // Get recent changes (last 30 days)
    const recentChanges = db.prepare(`
      SELECT helix_score, created_at FROM risk_profile_history
      WHERE user_id = ? AND created_at >= datetime('now', '-30 days')
      ORDER BY created_at DESC
    `).all(userId) as any[];

    const delta = previousProfile
      ? currentProfile.helix_score - previousProfile.helix_score
      : 0;

    // Determine if intervention is required
    const interventionRequired =
      alerts.some((a) => a.severity === 'critical' || a.severity === 'high') ||
      delta > 20 ||
      currentProfile.helix_score >= 66;

    return NextResponse.json({
      currentStatus: {
        helixScore: currentProfile.helix_score,
        lastUpdated: currentProfile.created_at,
      },
      changes: {
        delta: delta,
        previousScore: previousProfile?.helix_score || null,
        previousDate: previousProfile?.created_at || null,
        trend: delta < 0 ? 'improving' : delta > 0 ? 'deteriorating' : 'stable',
      },
      alerts: alerts.map((a) => ({
        id: a.id,
        type: a.alert_type,
        severity: a.severity,
        message: a.message,
        previousScore: a.previous_score,
        currentScore: a.current_score,
        delta: a.delta,
        createdAt: a.created_at,
      })),
      recentChanges: recentChanges.map((c) => ({
        helixScore: c.helix_score,
        date: c.created_at,
      })),
      interventionRequired,
    });
  } catch (error: any) {
    console.error('Error fetching monitoring data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch monitoring data' },
      { status: 500 }
    );
  }
}

