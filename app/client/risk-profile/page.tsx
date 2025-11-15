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
            Upload your financial documents to automatically calculate your Helix Grade
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
                  <p className="text-sm text-default-600 mb-2">Your Helix Grade</p>
                  <div 
                    className="text-7xl font-bold mb-4"
                    style={{ 
                      color: `var(--${getGradeColor(riskProfile.helixGrade || 'C')}-500)` 
                    }}
                  >
                    {riskProfile.helixGrade || 'N/A'}
                  </div>
                  <Chip 
                    color={getGradeColor(riskProfile.helixGrade || 'C') as any} 
                    variant="flat" 
                    size="lg"
                    className="mb-4"
                  >
                    Grade {riskProfile.helixGrade || 'N/A'}
                  </Chip>
                  <div className="max-w-md mx-auto mt-4">
                    <Progress
                      value={100 - riskProfile.helixScore}
                      color={getGradeColor(riskProfile.helixGrade || 'C') as any}
                      className="mb-2"
                    />
                    <p className="text-xs text-default-500">
                      Risk Score: {riskProfile.helixScore.toFixed(1)} • Confidence: {(riskProfile.confidenceInterval * 100).toFixed(1)}%
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

            {/* Raw Data Metrics Section */}
            {riskProfile && riskProfile.userData && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Detailed Risk Assessment Data</h2>
                </CardHeader>
                <CardBody className="space-y-6">
                  {/* Financial Stability Metrics */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-primary">Financial Stability Metrics</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {riskProfile.userData.monthlyIncome !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Monthly Income</div>
                          <div className="text-lg font-semibold">${riskProfile.userData.monthlyIncome.toLocaleString()}</div>
                        </div>
                      )}
                      {riskProfile.userData.monthlyIncomeVariance !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Income Variance</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.monthlyIncomeVariance.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.employmentDuration !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Employment Duration</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.employmentDuration} months</div>
                        </div>
                      )}
                      {riskProfile.userData.multipleIncomeStreams !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Income Streams</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.multipleIncomeStreams}</div>
                        </div>
                      )}
                      {riskProfile.userData.averageMonthlyBalance !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Avg Monthly Balance</div>
                          <div className="text-lg font-semibold">${riskProfile.userData.averageMonthlyBalance.toLocaleString()}</div>
                        </div>
                      )}
                      {riskProfile.userData.overdraftFrequency !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Overdraft Frequency</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.overdraftFrequency}/month</div>
                        </div>
                      )}
                      {riskProfile.userData.savingsRate !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Savings Rate</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.savingsRate.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.emergencyFundCoverage !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Emergency Fund Coverage</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.emergencyFundCoverage} months</div>
                        </div>
                      )}
                      {riskProfile.userData.debtToIncomeRatio !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Debt-to-Income Ratio</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.debtToIncomeRatio.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.paymentTimeliness !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Payment Timeliness</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.paymentTimeliness.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.creditUtilization !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Credit Utilization</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.creditUtilization.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.debtDiversification !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Debt Diversification</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.debtDiversification}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Divider />

                  {/* Behavioral Risk Indicators */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-secondary">Behavioral Risk Indicators</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {riskProfile.userData.discretionarySpendingRatio !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Discretionary Spending</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.discretionarySpendingRatio.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.gamblingActivity !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Gambling Activity</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.gamblingActivity.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.luxurySpendingTrends !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Luxury Spending</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.luxurySpendingTrends.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.budgetAdherence !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Budget Adherence</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.budgetAdherence.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.billPaymentConsistency !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Bill Payment Consistency</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.billPaymentConsistency.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.rentPaymentHistory !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Rent Payment History</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.rentPaymentHistory.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.utilityPaymentPatterns !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Utility Payment Patterns</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.utilityPaymentPatterns.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.subscriptionManagement !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Subscription Management</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.subscriptionManagement.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.appEngagementFrequency !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">App Engagement</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.appEngagementFrequency.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.documentSubmissionTimeliness !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Document Timeliness</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.documentSubmissionTimeliness.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.profileCompleteness !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Profile Completeness</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.profileCompleteness.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.fraudRiskSignals !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Fraud Risk Signals</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.fraudRiskSignals.toFixed(1)}%</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Divider />

                  {/* Alternative Data Signals */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-success">Alternative Data Signals</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {riskProfile.userData.professionalNetworkStrength !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Professional Network</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.professionalNetworkStrength.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.educationLevel !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Education Level</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.educationLevel.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.skillMarketability !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Skill Marketability</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.skillMarketability.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.geographicStability !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Geographic Stability</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.geographicStability} months</div>
                        </div>
                      )}
                      {riskProfile.userData.vehicleOwnership !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Vehicle Ownership</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.vehicleOwnership ? 'Yes' : 'No'}</div>
                        </div>
                      )}
                      {riskProfile.userData.propertyOwnership !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Property Ownership</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.propertyOwnership ? 'Yes' : 'No'}</div>
                        </div>
                      )}
                      {riskProfile.userData.investmentAccounts !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Investment Accounts</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.investmentAccounts}</div>
                        </div>
                      )}
                      {riskProfile.userData.businessOwnership !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Business Ownership</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.businessOwnership ? 'Yes' : 'No'}</div>
                        </div>
                      )}
                      {riskProfile.userData.residentialStability !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Residential Stability</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.residentialStability} months</div>
                        </div>
                      )}
                      {riskProfile.userData.familyStructure !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Family Structure</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.familyStructure}</div>
                        </div>
                      )}
                      {riskProfile.userData.healthInsuranceCoverage !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Health Insurance</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.healthInsuranceCoverage ? 'Yes' : 'No'}</div>
                        </div>
                      )}
                      {riskProfile.userData.professionalLicenses !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Professional Licenses</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.professionalLicenses}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Divider />

                  {/* Market & Economic Environment Risk */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-warning">Market & Economic Environment Risk</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {riskProfile.userData.industryVolatility !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Industry Volatility</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.industryVolatility.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.regionalEconomicHealth !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Regional Economic Health</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.regionalEconomicHealth.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.interestRateTrends !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Interest Rate Trends</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.interestRateTrends.toFixed(1)}</div>
                        </div>
                      )}
                      {riskProfile.userData.inflationImpact !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Inflation Impact</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.inflationImpact.toFixed(1)}%</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Divider />

                  {/* Fraud & Security Risk */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-danger">Fraud & Security Risk</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {riskProfile.userData.documentAuthenticity !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Document Authenticity</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.documentAuthenticity.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.biometricMatchScore !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Biometric Match</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.biometricMatchScore.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.addressVerification !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Address Verification</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.addressVerification ? 'Verified' : 'Unverified'}</div>
                        </div>
                      )}
                      {riskProfile.userData.phoneNumberStability !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Phone Number Stability</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.phoneNumberStability} months</div>
                        </div>
                      )}
                      {riskProfile.userData.unusualTransferPatterns !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Unusual Transfer Patterns</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.unusualTransferPatterns.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.velocityChecks !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Velocity Checks</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.velocityChecks.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.geolocationAnomalies !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Geolocation Anomalies</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.geolocationAnomalies.toFixed(1)}%</div>
                        </div>
                      )}
                      {riskProfile.userData.deviceFingerprinting !== undefined && (
                        <div className="bg-default-50 p-3 rounded-lg">
                          <div className="text-xs text-default-500">Device Fingerprinting</div>
                          <div className="text-lg font-semibold">{riskProfile.userData.deviceFingerprinting.toFixed(1)}%</div>
                        </div>
                      )}
                    </div>
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

