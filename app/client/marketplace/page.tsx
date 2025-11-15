'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Chip, Input } from '@heroui/react';
import AppNavbar from '@/components/Navbar';

export default function MarketplacePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [needs, setNeeds] = useState({
    amount: '',
    termMonths: '',
    productType: 'personal_loan',
  });

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
          loadMatches(data.user.id, token);
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const loadMatches = (userId: string, token: string) => {
    fetch('/api/products/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        needs: {
          amount: needs.amount ? parseFloat(needs.amount) : undefined,
          termMonths: needs.termMonths ? parseInt(needs.termMonths) : undefined,
          productType: needs.productType,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.matches) {
          setMatches(data.matches);
        }
      })
      .catch(() => {});
  };

  const handleSearch = () => {
    const token = localStorage.getItem('token');
    if (!token || !user) return;
    loadMatches(user.id, token);
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
        <h1 className="text-3xl font-bold mb-8">Pre-Approval Marketplace</h1>

        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">Search Criteria</h2>
          </CardHeader>
          <CardBody>
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="Loan Amount ($)"
                type="number"
                value={needs.amount}
                onChange={(e) => setNeeds({ ...needs, amount: e.target.value })}
              />
              <Input
                label="Term (months)"
                type="number"
                value={needs.termMonths}
                onChange={(e) => setNeeds({ ...needs, termMonths: e.target.value })}
              />
              <div className="flex items-end">
                <Button color="primary" onPress={handleSearch} fullWidth>
                  Search Products
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4">
          {matches.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-center py-8 text-gray-500">
                  No products found. Try adjusting your search criteria or calculate your risk profile first.
                </p>
              </CardBody>
            </Card>
          ) : (
            matches.map((match) => (
              <Card key={match.product.id}>
                <CardHeader className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{match.product.name}</h3>
                    <p className="text-sm text-gray-500">{match.product.bankName}</p>
                  </div>
                  <div className="flex gap-2">
                    {match.preApproved && (
                      <Chip color="success" variant="flat">Pre-Approved</Chip>
                    )}
                    {match.instantApproval && (
                      <Chip color="primary" variant="flat">Instant Approval</Chip>
                    )}
                    <Chip variant="flat">Match: {(match.matchScore * 100).toFixed(0)}%</Chip>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Interest Rate</p>
                      <p className="text-2xl font-bold">{match.pricing.interestRate.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Max Amount</p>
                      <p className="text-2xl font-bold">${match.pricing.maxAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Available Terms</p>
                    <div className="flex gap-2">
                      {match.pricing.terms.map((term: number) => (
                        <Chip key={term} variant="flat" size="sm">
                          {term} months
                        </Chip>
                      ))}
                    </div>
                  </div>
                  {match.pricing.originationFee > 0 && (
                    <p className="text-sm text-gray-600 mb-4">
                      Origination Fee: ${match.pricing.originationFee.toFixed(2)}
                    </p>
                  )}
                  <Button color="primary" fullWidth>
                    Apply Now
                  </Button>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

