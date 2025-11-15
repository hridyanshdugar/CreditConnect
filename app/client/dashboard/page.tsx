'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Progress, Chip } from '@heroui/react';
import AppNavbar from '@/components/Navbar';
import CreditScoreBreakdown from '@/components/credit-metrics/CreditScoreBreakdown';
import Link from 'next/link';
import { BarChart3, ShoppingBag, TrendingUp } from 'lucide-react';

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [riskProfile, setRiskProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          // Fetch risk profile
          fetch(`/api/risk/profile/${data.user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((profile) => {
              if (profile.currentProfile) {
                setRiskProfile(profile.currentProfile);
              }
            })
            .catch(() => {});
        } else {
          router.push('/login');
        }
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div>Loading...</div>
      </div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score <= 25) return 'success';
    if (score <= 45) return 'primary';
    if (score <= 65) return 'warning';
    return 'danger';
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: 'success',
      B: 'primary',
      C: 'warning',
      D: 'warning',
      E: 'danger',
      F: 'danger',
    };
    return colors[grade] || 'default';
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={user} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Client Dashboard</h1>

        {riskProfile ? (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Helix Grade</h2>
              </CardHeader>
              <CardBody>
                <div className="text-center">
                  <div className="text-6xl font-bold mb-4" style={{ color: `var(--${getGradeColor(riskProfile.helixGrade || 'C')}-500)` }}>
                    {riskProfile.helixGrade || 'N/A'}
                  </div>
                  <Chip color={getGradeColor(riskProfile.helixGrade || 'C')} variant="flat" size="lg">
                    Grade {riskProfile.helixGrade || 'N/A'}
                  </Chip>
                  <div className="mt-4">
                    <Progress
                      value={100 - riskProfile.helixScore}
                      color={getGradeColor(riskProfile.helixGrade || 'C')}
                      className="max-w-md"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Risk Score: {riskProfile.helixScore.toFixed(1)}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Dimension Scores</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {Object.entries(riskProfile.dimensionScores || {}).map(([key, value]: [string, any]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                        <span className="text-sm font-semibold">{value.toFixed(1)}</span>
                      </div>
                      <Progress
                        value={100 - value}
                        color={getRiskColor(value)}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        ) : (
          <Card className="mb-8">
            <CardBody>
              <p className="text-center py-8">
                No risk profile found. Calculate your risk score to get started.
              </p>
              <div className="text-center">
                <Link href="/client/risk-profile">
                  <Button color="primary">Calculate Risk Profile</Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Credit Score Breakdown */}
        <div className="mb-8">
          {/* <CreditScoreBreakdown /> */}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card 
            isPressable 
            as={Link} 
            href="/client/risk-profile"
            className="hover:scale-105 transition-transform duration-200 hover:shadow-lg"
          >
            <CardHeader className="flex flex-col items-start gap-2 pb-2">
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Risk Profile</h3>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <p className="text-sm text-default-600">
                View detailed risk assessment and improvement recommendations
              </p>
            </CardBody>
          </Card>

          <Card 
            isPressable 
            as={Link} 
            href="/client/marketplace"
            className="hover:scale-105 transition-transform duration-200 hover:shadow-lg"
          >
            <CardHeader className="flex flex-col items-start gap-2 pb-2">
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 rounded-lg bg-success/10">
                  <ShoppingBag className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-lg font-semibold">Pre-Approval Marketplace</h3>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <p className="text-sm text-default-600">
                Browse pre-approved loan offers from multiple lenders
              </p>
            </CardBody>
          </Card>

          <Card 
            isPressable 
            as={Link} 
            href="/client/simulator"
            className="hover:scale-105 transition-transform duration-200 hover:shadow-lg"
          >
            <CardHeader className="flex flex-col items-start gap-2 pb-2">
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 rounded-lg bg-warning/10">
                  <TrendingUp className="w-6 h-6 text-warning" />
                </div>
                <h3 className="text-lg font-semibold">Risk Simulator</h3>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <p className="text-sm text-default-600">
                Simulate how different actions affect your risk score
              </p>
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  );
}

