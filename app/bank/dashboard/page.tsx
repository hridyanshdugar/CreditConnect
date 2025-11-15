'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Chip, Progress } from '@heroui/react';
import AppNavbar from '@/components/Navbar';
import Link from 'next/link';

export default function BankDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
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
        if (data.user && data.user.role === 'bank') {
          setUser(data.user);
          loadPortfolio(token);
        } else {
          router.push('/');
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const loadPortfolio = (token: string) => {
    fetch('/api/risk/portfolio/analysis', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setPortfolio(data);
      })
      .catch(() => {});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={user} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Bank Dashboard</h1>

        {portfolio ? (
          <>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardBody>
                  <p className="text-sm text-gray-600">Average Helix Score</p>
                  <p className="text-3xl font-bold">{portfolio.aggregateRisk.averageHelixScore.toFixed(1)}</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-3xl font-bold">{portfolio.aggregateRisk.totalApplications}</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-sm text-gray-600">Approval Rate</p>
                  <p className="text-3xl font-bold">{portfolio.aggregateRisk.approvalRate.toFixed(1)}%</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-sm text-gray-600">STP Rate</p>
                  <p className="text-3xl font-bold">{portfolio.aggregateRisk.stpRate.toFixed(1)}%</p>
                </CardBody>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Risk Distribution</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {Object.entries(portfolio.distributions.riskCategories).map(([category, count]: [string, any]) => (
                      <div key={category}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm capitalize">{category.replace('_', ' ')}</span>
                          <span className="text-sm font-semibold">{count}</span>
                        </div>
                        <Progress
                          value={(count / portfolio.aggregateRisk.totalApplications) * 100}
                          color={category === 'prime' ? 'success' : category === 'near_prime' ? 'primary' : 'warning'}
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Status Breakdown</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-2">
                    {Object.entries(portfolio.distributions.statusBreakdown).map(([status, count]: [string, any]) => (
                      <div key={status} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                        <Chip variant="flat" size="sm">{count}</Chip>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Trends</h2>
              </CardHeader>
              <CardBody>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Score Change</p>
                    <p className={`text-2xl font-bold ${portfolio.trends.scoreChange < 0 ? 'text-green-600' : portfolio.trends.scoreChange > 0 ? 'text-red-600' : ''}`}>
                      {portfolio.trends.scoreChange > 0 ? '+' : ''}{portfolio.trends.scoreChange.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Direction</p>
                    <Chip
                      color={portfolio.trends.direction === 'improving' ? 'success' : portfolio.trends.direction === 'deteriorating' ? 'danger' : 'default'}
                      variant="flat"
                    >
                      {portfolio.trends.direction}
                    </Chip>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Recent Average</p>
                    <p className="text-2xl font-bold">{portfolio.trends.recentAverage.toFixed(1)}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </>
        ) : (
          <Card>
            <CardBody>
              <p className="text-center py-8 text-gray-500">
                No portfolio data available yet.
              </p>
            </CardBody>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card isPressable as={Link} href="/bank/portfolio">
            <CardHeader>
              <h3 className="text-lg font-semibold">Portfolio Analyzer</h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600">
                Detailed portfolio risk analysis and metrics
              </p>
            </CardBody>
          </Card>

          <Card isPressable as={Link} href="/bank/products">
            <CardHeader>
              <h3 className="text-lg font-semibold">Product Manager</h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600">
                Manage loan products and pricing
              </p>
            </CardBody>
          </Card>

          <Card isPressable as={Link} href="/bank/review-queue">
            <CardHeader>
              <h3 className="text-lg font-semibold">Review Queue</h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600">
                Applications requiring manual review
              </p>
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  );
}

