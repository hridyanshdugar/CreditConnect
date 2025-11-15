'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Chip } from '@heroui/react';
import AppNavbar from '@/components/Navbar';

export default function PortfolioPage() {
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
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppNavbar user={user} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Portfolio Risk Analyzer</h1>

        {portfolio ? (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Aggregate Risk Metrics</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Average Helix Score</p>
                      <p className="text-3xl font-bold">{portfolio.aggregateRisk.averageHelixScore.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Loan Amount</p>
                      <p className="text-2xl font-bold">${portfolio.aggregateRisk.totalLoanAmount.toLocaleString()}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Approval Rate</p>
                        <p className="text-xl font-bold">{portfolio.aggregateRisk.approvalRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">STP Rate</p>
                        <p className="text-xl font-bold">{portfolio.aggregateRisk.stpRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Risk Trends</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Score Change (7 days)</p>
                      <p className={`text-2xl font-bold ${portfolio.trends.scoreChange < 0 ? 'text-green-600' : portfolio.trends.scoreChange > 0 ? 'text-red-600' : ''}`}>
                        {portfolio.trends.scoreChange > 0 ? '+' : ''}{portfolio.trends.scoreChange.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Direction</p>
                      <Chip
                        color={portfolio.trends.direction === 'improving' ? 'success' : portfolio.trends.direction === 'deteriorating' ? 'danger' : 'default'}
                        variant="flat"
                        size="lg"
                      >
                        {portfolio.trends.direction}
                      </Chip>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Recent Average</p>
                        <p className="text-xl font-bold">{portfolio.trends.recentAverage.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Previous Average</p>
                        <p className="text-xl font-bold">{portfolio.trends.previousAverage.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {portfolio.outliers && portfolio.outliers.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Outliers</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-2">
                    {portfolio.outliers.map((outlier: any) => (
                      <div key={outlier.applicationId} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="text-sm font-semibold">Application {outlier.applicationId.slice(0, 8)}</p>
                          <p className="text-xs text-gray-500">User: {outlier.userId.slice(0, 8)}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Chip
                            color={outlier.helixScore < 20 ? 'success' : 'danger'}
                            variant="flat"
                          >
                            Score: {outlier.helixScore.toFixed(1)}
                          </Chip>
                          <Chip variant="flat" size="sm">
                            {outlier.status}
                          </Chip>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardBody>
              <p className="text-center py-8 text-gray-500">
                No portfolio data available.
              </p>
            </CardBody>
          </Card>
        )}
      </main>
    </div>
  );
}

