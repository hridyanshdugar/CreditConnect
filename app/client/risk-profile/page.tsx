'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Input, Chip, Accordion, AccordionItem } from '@heroui/react';
import AppNavbar from '@/components/Navbar';

export default function RiskProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [riskProfile, setRiskProfile] = useState<any>(null);
  const [improvements, setImprovements] = useState<any>(null);
  const [userData, setUserData] = useState({
    monthlyIncome: '',
    employmentDuration: '',
    debtToIncomeRatio: '',
    paymentTimeliness: '',
    averageMonthlyBalance: '',
  });
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

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
          loadRiskProfile(data.user.id, token);
          loadImprovements(data.user.id, token);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const loadRiskProfile = (userId: string, token: string) => {
    fetch(`/api/risk/profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.currentProfile) {
          setRiskProfile(data.currentProfile);
        }
      })
      .catch(() => {});
  };

  const loadImprovements = (userId: string, token: string) => {
    fetch(`/api/risk/improvements/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setImprovements(data);
      })
      .catch(() => {});
  };

  const handleCalculate = async () => {
    setCalculating(true);
    const token = localStorage.getItem('token');
    if (!token || !user) return;

    const data = {
      monthlyIncome: userData.monthlyIncome ? parseFloat(userData.monthlyIncome) : undefined,
      employmentDuration: userData.employmentDuration ? parseInt(userData.employmentDuration) : undefined,
      debtToIncomeRatio: userData.debtToIncomeRatio ? parseFloat(userData.debtToIncomeRatio) / 100 : undefined,
      paymentTimeliness: userData.paymentTimeliness ? parseFloat(userData.paymentTimeliness) : undefined,
      averageMonthlyBalance: userData.averageMonthlyBalance ? parseFloat(userData.averageMonthlyBalance) : undefined,
      // Default values for other required fields
      documentAuthenticity: 90,
      addressVerification: true,
      phoneNumberStability: 24,
    };

    try {
      const res = await fetch('/api/risk/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          userData: data,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        loadRiskProfile(user.id, token);
        loadImprovements(user.id, token);
      } else {
        alert(result.error || 'Failed to calculate risk');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setCalculating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <AppNavbar user={user} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Risk Profile</h1>

        {!riskProfile ? (
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-xl font-semibold">Calculate Your Risk Profile</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Input
                  label="Monthly Income ($)"
                  type="number"
                  value={userData.monthlyIncome}
                  onChange={(e) => setUserData({ ...userData, monthlyIncome: e.target.value })}
                />
                <Input
                  label="Employment Duration (months)"
                  type="number"
                  value={userData.employmentDuration}
                  onChange={(e) => setUserData({ ...userData, employmentDuration: e.target.value })}
                />
                <Input
                  label="Debt-to-Income Ratio (%)"
                  type="number"
                  value={userData.debtToIncomeRatio}
                  onChange={(e) => setUserData({ ...userData, debtToIncomeRatio: e.target.value })}
                />
                <Input
                  label="Payment Timeliness (0-100)"
                  type="number"
                  value={userData.paymentTimeliness}
                  onChange={(e) => setUserData({ ...userData, paymentTimeliness: e.target.value })}
                />
                <Input
                  label="Average Monthly Balance ($)"
                  type="number"
                  value={userData.averageMonthlyBalance}
                  onChange={(e) => setUserData({ ...userData, averageMonthlyBalance: e.target.value })}
                />
                <Button
                  color="primary"
                  onPress={handleCalculate}
                  isLoading={calculating}
                  fullWidth
                >
                  Calculate Risk Score
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          <>
            <Card className="mb-8">
              <CardHeader>
                <h2 className="text-xl font-semibold">Risk Assessment</h2>
              </CardHeader>
              <CardBody>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-4xl font-bold mb-2">{riskProfile.helixScore.toFixed(1)}</div>
                    <Chip color={riskProfile.helixScore <= 25 ? 'success' : riskProfile.helixScore <= 45 ? 'primary' : 'warning'}>
                      {riskProfile.riskCategory.replace('_', ' ').toUpperCase()}
                    </Chip>
                    <p className="text-sm text-gray-500 mt-4">
                      Confidence: {(riskProfile.confidenceInterval * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <p className="text-sm">{riskProfile.explanation?.summary || 'No summary available'}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {riskProfile.explanation && (
              <Card className="mb-8">
                <CardHeader>
                  <h2 className="text-xl font-semibold">Explanation</h2>
                </CardHeader>
                <CardBody>
                  <Accordion>
                    <AccordionItem key="factors" title="Key Factors">
                      <ul className="list-disc list-inside space-y-2">
                        {riskProfile.explanation.keyFactors?.map((factor: any, i: number) => (
                          <li key={i} className="text-sm">
                            <strong>{factor.factor}:</strong> {factor.explanation}
                          </li>
                        ))}
                      </ul>
                    </AccordionItem>
                    <AccordionItem key="strengths" title="Strengths">
                      <ul className="list-disc list-inside space-y-2">
                        {riskProfile.explanation.strengths?.map((s: string, i: number) => (
                          <li key={i} className="text-sm">{s}</li>
                        ))}
                      </ul>
                    </AccordionItem>
                    <AccordionItem key="concerns" title="Concerns">
                      <ul className="list-disc list-inside space-y-2">
                        {riskProfile.explanation.concerns?.map((c: string, i: number) => (
                          <li key={i} className="text-sm">{c}</li>
                        ))}
                      </ul>
                    </AccordionItem>
                  </Accordion>
                </CardBody>
              </Card>
            )}

            {improvements && improvements.recommendations && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Improvement Recommendations</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {improvements.recommendations.map((rec: any, i: number) => (
                      <div key={i} className="border-l-4 border-primary pl-4">
                        <h3 className="font-semibold">{rec.dimension}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Potential improvement: {rec.potentialScoreImprovement} points in {rec.timeframe}
                        </p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {rec.recommendedActions.map((action: string, j: number) => (
                            <li key={j}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}

