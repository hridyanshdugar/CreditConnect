'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Chip, Progress, Divider } from '@heroui/react';
import AppNavbar from '@/components/Navbar';
import FileUpload from '@/components/FileUpload';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import PaymentHistoryTimeline from '@/components/credit-metrics/PaymentHistoryTimeline';
import CreditUtilizationGauge from '@/components/credit-metrics/CreditUtilizationGauge';
import CreditAgeTimeline from '@/components/credit-metrics/CreditAgeTimeline';
import CreditInquiriesTracker from '@/components/credit-metrics/CreditInquiriesTracker';
import CreditMixPortfolio from '@/components/credit-metrics/CreditMixPortfolio';

export default function RiskProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [riskProfile, setRiskProfile] = useState<any>(null);
  const [improvements, setImprovements] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [creditMetrics, setCreditMetrics] = useState<any>(null);

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
          loadUploadedFiles(data.user.id, token);
          loadCreditMetrics(data.user.id, token);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
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

  const loadUploadedFiles = (userId: string, token: string) => {
    fetch(`/api/data/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.files) {
          setUploadedFiles(data.files);
        }
      })
      .catch(() => {});
  };

  const loadCreditMetrics = (userId: string, token: string) => {
    fetch(`/api/risk/credit-metrics/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setCreditMetrics(data);
      })
      .catch(() => {});
  };

  const handleUploadComplete = () => {
    const token = localStorage.getItem('token');
    if (token && user) {
      // Reload everything after processing
      setTimeout(() => {
        loadRiskProfile(user.id, token);
        loadImprovements(user.id, token);
        loadUploadedFiles(user.id, token);
        loadCreditMetrics(user.id, token);
      }, 3000); // Wait 3 seconds for processing
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 25) return 'success';
    if (score <= 45) return 'primary';
    if (score <= 65) return 'warning';
    return 'danger';
  };

  const getRiskLabel = (category: string) => {
    const labels: Record<string, string> = {
      prime: 'Prime',
      near_prime: 'Near Prime',
      subprime: 'Subprime',
      deep_subprime: 'Deep Subprime',
      decline: 'Decline',
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar user={user} />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Risk Profile</h1>
          <p className="text-default-600">
            Upload your financial documents to automatically calculate your Helix Risk Score
          </p>
        </div>

        {/* File Upload Section */}
        <div className="mb-8">
          <FileUpload userId={user.id} onUploadComplete={handleUploadComplete} />
        </div>

        {/* Uploaded Files Summary */}
        {uploadedFiles.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <h2 className="text-xl font-semibold">Uploaded Documents</h2>
            </CardHeader>
            <CardBody>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-default-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{uploadedFiles.length}</div>
                  <div className="text-sm text-default-600">Total Files</div>
                </div>
                <div className="text-center p-4 bg-default-50 rounded-lg">
                  <div className="text-2xl font-bold text-success">
                    {uploadedFiles.filter(f => f.status === 'processed').length}
                  </div>
                  <div className="text-sm text-default-600">Processed</div>
                </div>
                <div className="text-center p-4 bg-default-50 rounded-lg">
                  <div className="text-2xl font-bold text-warning">
                    {uploadedFiles.filter(f => f.status === 'processing').length}
                  </div>
                  <div className="text-sm text-default-600">Processing</div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Risk Profile Display */}
        {riskProfile ? (
          <div className="space-y-6">
            {/* Main Risk Score Card */}
            <Card className="border-2">
              <CardBody className="p-8">
                <div className="text-center mb-6">
                  <p className="text-sm text-default-600 mb-2">Your Helix Risk Score</p>
                  <div 
                    className="text-7xl font-bold mb-4"
                    style={{ 
                      color: `var(--${getRiskColor(riskProfile.helixScore)}-500)` 
                    }}
                  >
                    {riskProfile.helixScore.toFixed(1)}
                  </div>
                  <Chip 
                    color={getRiskColor(riskProfile.helixScore) as any} 
                    variant="flat" 
                    size="lg"
                    className="mb-4"
                  >
                    {getRiskLabel(riskProfile.riskCategory)}
                  </Chip>
                  <div className="max-w-md mx-auto mt-4">
                    <Progress
                      value={100 - riskProfile.helixScore}
                      color={getRiskColor(riskProfile.helixScore) as any}
                      className="mb-2"
                    />
                    <p className="text-xs text-default-500">
                      Lower scores indicate lower risk • Confidence: {(riskProfile.confidenceInterval * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Dimension Scores */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Risk Dimension Breakdown</h2>
              </CardHeader>
              <CardBody>
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(riskProfile.dimensionScores || {}).map(([key, value]: [string, any]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize">
                          {key.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-bold">
                          {value.toFixed(1)}
                        </span>
                      </div>
                      <Progress
                        value={100 - value}
                        color={getRiskColor(value) as any}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Summary and Explanation */}
            {riskProfile.explanation && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Risk Assessment Summary</h2>
                </CardHeader>
                <CardBody className="space-y-6">
                  <div>
                    <p className="text-default-700 leading-relaxed">
                      {riskProfile.explanation.summary || 'No summary available'}
                    </p>
                  </div>

                  <Divider />

                  {riskProfile.explanation.strengths && riskProfile.explanation.strengths.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                        <h3 className="font-semibold text-success">Strengths</h3>
                      </div>
                      <ul className="list-disc list-inside space-y-1 ml-7">
                        {riskProfile.explanation.strengths.map((s: string, i: number) => (
                          <li key={i} className="text-sm text-default-700">{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {riskProfile.explanation.concerns && riskProfile.explanation.concerns.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-warning" />
                        <h3 className="font-semibold text-warning">Areas of Concern</h3>
                      </div>
                      <ul className="list-disc list-inside space-y-1 ml-7">
                        {riskProfile.explanation.concerns.map((c: string, i: number) => (
                          <li key={i} className="text-sm text-default-700">{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {riskProfile.explanation.keyFactors && riskProfile.explanation.keyFactors.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Key Factors</h3>
                      </div>
                      <div className="space-y-2 ml-7">
                        {riskProfile.explanation.keyFactors.slice(0, 5).map((factor: any, i: number) => (
                          <div key={i} className="text-sm">
                            <span className="font-medium">{factor.factor}:</span>{' '}
                            <span className="text-default-600">{factor.explanation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}

            {/* Improvement Recommendations */}
            {improvements && improvements.recommendations && improvements.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Improvement Recommendations</h2>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {improvements.recommendations.map((rec: any, i: number) => (
                      <div key={i} className="border-l-4 border-primary pl-4 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{rec.dimension}</h3>
                          <Chip size="sm" variant="flat" color="primary">
                            +{rec.potentialScoreImprovement} points
                          </Chip>
                        </div>
                        <p className="text-xs text-default-500 mb-2">
                          Estimated timeframe: {rec.timeframe}
                        </p>
                        <ul className="list-disc list-inside text-sm space-y-1 text-default-700">
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

            {/* Credit Metrics Section */}
            {creditMetrics && (
              <div className="space-y-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold">Credit Score Factors</h2>
                  <p className="text-default-600">
                    Detailed breakdown of factors that influence your credit score
                  </p>
                </div>

                {/* Payment History (35%) */}
                {creditMetrics.paymentHistory && (
                  <PaymentHistoryTimeline {...creditMetrics.paymentHistory} />
                )}

                {/* Credit Utilization (30%) */}
                {creditMetrics.creditUtilization && (
                  <CreditUtilizationGauge {...creditMetrics.creditUtilization} />
                )}

                {/* Credit Age (15%) */}
                {creditMetrics.creditAge && (
                  <CreditAgeTimeline {...creditMetrics.creditAge} />
                )}

                {/* Credit Inquiries (10%) */}
                {creditMetrics.creditInquiries && (
                  <CreditInquiriesTracker {...creditMetrics.creditInquiries} />
                )}

                {/* Credit Mix (10%) */}
                {creditMetrics.creditMix && (
                  <CreditMixPortfolio {...creditMetrics.creditMix} />
                )}
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardBody className="text-center py-12">
              <div className="max-w-md mx-auto">
                <TrendingUp className="w-16 h-16 text-default-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Risk Profile Yet</h3>
                <p className="text-default-600 mb-6">
                  Upload your financial documents above to automatically calculate your Helix Risk Score. 
                  We'll analyze your bank statements, pay stubs, tax returns, credit cards, loans, bills, 
                  and debt statements to provide you with a comprehensive risk assessment.
                </p>
                <div className="text-sm text-default-500 space-y-1">
                  <p>📄 Upload bank statements to analyze cash flow and payment history</p>
                  <p>💼 Upload pay stubs to verify income and employment</p>
                  <p>📊 Upload tax returns for comprehensive income verification</p>
                  <p>💳 Upload credit card statements to assess credit utilization</p>
                  <p>🏦 Upload loan statements to calculate debt-to-income ratio</p>
                  <p>📋 Upload bills (utilities, rent) to evaluate payment consistency</p>
                  <p>💸 Upload debt statements for complete debt analysis</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </main>
    </div>
  );
}

