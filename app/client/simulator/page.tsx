'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Input, Chip } from '@heroui/react';
import AppNavbar from '@/components/Navbar';

export default function SimulatorPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [scenarioData, setScenarioData] = useState({
    debtToIncomeRatio: '',
    paymentTimeliness: '',
    employmentDuration: '',
    averageMonthlyBalance: '',
  });
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

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
          loadCurrentScore(data.user.id, token);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const loadCurrentScore = (userId: string, token: string) => {
    fetch(`/api/risk/profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.currentProfile) {
          setCurrentScore(data.currentProfile.helixScore);
        }
      })
      .catch(() => {});
  };

  const handleSimulate = async () => {
    setSimulating(true);
    const token = localStorage.getItem('token');
    if (!token || !user) return;

    const scenario = {
      debtToIncomeRatio: scenarioData.debtToIncomeRatio ? parseFloat(scenarioData.debtToIncomeRatio) / 100 : undefined,
      paymentTimeliness: scenarioData.paymentTimeliness ? parseFloat(scenarioData.paymentTimeliness) : undefined,
      employmentDuration: scenarioData.employmentDuration ? parseInt(scenarioData.employmentDuration) : undefined,
      averageMonthlyBalance: scenarioData.averageMonthlyBalance ? parseFloat(scenarioData.averageMonthlyBalance) : undefined,
    };

    try {
      const res = await fetch('/api/risk/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          scenarios: [scenario],
        }),
      });

      const data = await res.json();
      if (res.ok && data.scenarios && data.scenarios.length > 0) {
        setScenarios(data.scenarios);
      } else {
        alert(data.error || 'Failed to simulate');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setSimulating(false);
    }
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
        <h1 className="text-3xl font-bold mb-8">Risk Improvement Simulator</h1>

        {currentScore !== null && (
          <Card className="mb-8">
            <CardBody>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Current Helix Score</p>
                <p className="text-5xl font-bold mb-4">{currentScore.toFixed(1)}</p>
                <p className="text-sm text-gray-500">
                  Simulate how different actions would affect your score
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">Create Scenario</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Input
                label="Debt-to-Income Ratio (%)"
                type="number"
                value={scenarioData.debtToIncomeRatio}
                onChange={(e) => setScenarioData({ ...scenarioData, debtToIncomeRatio: e.target.value })}
                description="Lower is better. Try reducing to 30% or less."
              />
              <Input
                label="Payment Timeliness (0-100)"
                type="number"
                value={scenarioData.paymentTimeliness}
                onChange={(e) => setScenarioData({ ...scenarioData, paymentTimeliness: e.target.value })}
                description="Higher is better. Aim for 90% or above."
              />
              <Input
                label="Employment Duration (months)"
                type="number"
                value={scenarioData.employmentDuration}
                onChange={(e) => setScenarioData({ ...scenarioData, employmentDuration: e.target.value })}
                description="Longer employment shows stability. Target 24+ months."
              />
              <Input
                label="Average Monthly Balance ($)"
                type="number"
                value={scenarioData.averageMonthlyBalance}
                onChange={(e) => setScenarioData({ ...scenarioData, averageMonthlyBalance: e.target.value })}
                description="Higher balances indicate better cash flow management."
              />
              <Button
                color="primary"
                onPress={handleSimulate}
                isLoading={simulating}
                fullWidth
              >
                Simulate Impact
              </Button>
            </div>
          </CardBody>
        </Card>

        {scenarios.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Simulation Results</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {scenarios.map((scenario, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">Projected Score</h3>
                        <p className="text-3xl font-bold">{scenario.projectedScore.toFixed(1)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Impact</p>
                        <Chip
                          color={scenario.impact < 0 ? 'success' : scenario.impact > 0 ? 'danger' : 'default'}
                          variant="flat"
                        >
                          {scenario.impact > 0 ? '+' : ''}{scenario.impact.toFixed(1)} ({scenario.impactPercentage}%)
                        </Chip>
                      </div>
                    </div>
                    <div className="mb-2">
                      <Chip variant="flat" size="sm">
                        Grade {scenario.projectedGrade || 'N/A'}
                      </Chip>
                      <span className="text-sm text-gray-600 ml-2">
                        Estimated timeframe: {scenario.timeline}
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-semibold mb-2">Dimension Scores:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(scenario.dimensionScores || {}).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace('_', ' ')}:</span>
                            <span className="font-semibold">{value.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </main>
    </div>
  );
}

