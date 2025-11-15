'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Chip, Input, Select, SelectItem } from '@heroui/react';
import AppNavbar from '@/components/Navbar';

export default function MarketplacePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [needs, setNeeds] = useState({
    amount: '',
    termMonths: '',
    productType: '',
  });
  const [filters, setFilters] = useState({
    productType: '',
    bankName: '',
    minInterestRate: '',
    maxInterestRate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'matchScore', // matchScore, interestRate, maxAmount
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
          productType: needs.productType || undefined,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.matches) {
          setMatches(data.matches);
          applyFilters(data.matches);
        }
      })
      .catch(() => {});
  };

  const applyFilters = (matchesToFilter: any[] = matches) => {
    let filtered = [...matchesToFilter];

    // Filter by product type
    if (filters.productType) {
      filtered = filtered.filter(
        (match) => match.product.productType === filters.productType
      );
    }

    // Filter by bank name
    if (filters.bankName) {
      filtered = filtered.filter(
        (match) => match.product.bankName === filters.bankName
      );
    }

    // Filter by interest rate range
    if (filters.minInterestRate) {
      filtered = filtered.filter(
        (match) => match.pricing.interestRate >= parseFloat(filters.minInterestRate)
      );
    }
    if (filters.maxInterestRate) {
      filtered = filtered.filter(
        (match) => match.pricing.interestRate <= parseFloat(filters.maxInterestRate)
      );
    }

    // Filter by amount range
    if (filters.minAmount) {
      filtered = filtered.filter(
        (match) => match.pricing.maxAmount >= parseFloat(filters.minAmount)
      );
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(
        (match) => match.pricing.maxAmount <= parseFloat(filters.maxAmount)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'interestRate':
          return a.pricing.interestRate - b.pricing.interestRate;
        case 'maxAmount':
          return b.pricing.maxAmount - a.pricing.maxAmount;
        case 'matchScore':
        default:
          return (b.matchScore || 0) - (a.matchScore || 0);
      }
    });

    setFilteredMatches(filtered);
  };

  useEffect(() => {
    if (matches.length > 0) {
      applyFilters(matches);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSearch = () => {
    const token = localStorage.getItem('token');
    if (!token || !user) return;
    loadMatches(user.id, token);
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
        <h1 className="text-3xl font-bold mb-8">Pre-Approval Marketplace</h1>

        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">Search Criteria</h2>
          </CardHeader>
          <CardBody>
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <Input
                label={needs.productType === 'credit_card' ? "Credit Limit ($)" : "Loan Amount ($)"}
                type="number"
                value={needs.amount}
                onChange={(e) => setNeeds({ ...needs, amount: e.target.value })}
                placeholder={needs.productType === 'credit_card' ? "e.g. 5000" : "e.g. 10000"}
              />
              <Input
                label="Term (months)"
                type="number"
                value={needs.termMonths}
                onChange={(e) => setNeeds({ ...needs, termMonths: e.target.value })}
                placeholder="e.g. 36"
                isDisabled={needs.productType === 'credit_card'}
              />
              <Select
                label="Product Type"
                selectedKeys={needs.productType ? [needs.productType] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setNeeds({ ...needs, productType: selected || '' });
                }}
                placeholder="All Types"
              >
                <SelectItem key="credit_card">Credit Card</SelectItem>
                <SelectItem key="personal_loan">Personal Loan</SelectItem>
                <SelectItem key="auto_loan">Auto Loan</SelectItem>
                <SelectItem key="mortgage">Mortgage</SelectItem>
                <SelectItem key="credit_line">Credit Line</SelectItem>
                <SelectItem key="student_loan">Student Loan</SelectItem>
                <SelectItem key="home_equity">Home Equity</SelectItem>
                <SelectItem key="business_loan">Business Loan</SelectItem>
              </Select>
              <div className="flex items-end">
                <Button color="primary" onPress={handleSearch} fullWidth>
                  Search Products
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold">Filters</h2>
          </CardHeader>
          <CardBody>
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <Select
                label="Product Type"
                selectedKeys={filters.productType ? [filters.productType] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setFilters({ ...filters, productType: selected || '' });
                }}
                placeholder="All Types"
              >
                <SelectItem key="credit_card">Credit Card</SelectItem>
                <SelectItem key="personal_loan">Personal Loan</SelectItem>
                <SelectItem key="auto_loan">Auto Loan</SelectItem>
                <SelectItem key="mortgage">Mortgage</SelectItem>
                <SelectItem key="credit_line">Credit Line</SelectItem>
                <SelectItem key="student_loan">Student Loan</SelectItem>
                <SelectItem key="home_equity">Home Equity</SelectItem>
                <SelectItem key="business_loan">Business Loan</SelectItem>
              </Select>
              <Select
                label="Bank"
                selectedKeys={filters.bankName ? [filters.bankName] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setFilters({ ...filters, bankName: selected || '' });
                }}
                placeholder="All Banks"
              >
                {Array.from(new Set(matches.map((m) => m.product.bankName))).map((bank) => (
                  <SelectItem key={bank}>{bank}</SelectItem>
                ))}
              </Select>
              <Input
                label="Min Interest Rate (%)"
                type="number"
                value={filters.minInterestRate}
                onChange={(e) => setFilters({ ...filters, minInterestRate: e.target.value })}
                placeholder="e.g. 5.0"
              />
              <Input
                label="Max Interest Rate (%)"
                type="number"
                value={filters.maxInterestRate}
                onChange={(e) => setFilters({ ...filters, maxInterestRate: e.target.value })}
                placeholder="e.g. 15.0"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="Min Amount ($)"
                type="number"
                value={filters.minAmount}
                onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                placeholder="e.g. 5000"
              />
              <Input
                label="Max Amount ($)"
                type="number"
                value={filters.maxAmount}
                onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                placeholder="e.g. 50000"
              />
              <Select
                label="Sort By"
                selectedKeys={[filters.sortBy]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setFilters({ ...filters, sortBy: selected });
                }}
              >
                <SelectItem key="matchScore">Best Match</SelectItem>
                <SelectItem key="interestRate">Lowest Rate</SelectItem>
                <SelectItem key="maxAmount">Highest Amount</SelectItem>
              </Select>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="light"
                onPress={() => {
                  setFilters({
                    productType: '',
                    bankName: '',
                    minInterestRate: '',
                    maxInterestRate: '',
                    minAmount: '',
                    maxAmount: '',
                    sortBy: 'matchScore',
                  });
                }}
              >
                Clear Filters
              </Button>
              <Chip variant="flat" color="primary">
                {filteredMatches.length} of {matches.length} products
              </Chip>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4">
          {filteredMatches.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-center py-8 text-gray-500">
                  {matches.length === 0
                    ? 'No products found. Try adjusting your search criteria or calculate your risk profile first.'
                    : 'No products match your current filters. Try adjusting your filters.'}
                </p>
              </CardBody>
            </Card>
          ) : (
            filteredMatches.map((match) => (
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
                      <p className="text-sm text-gray-600">
                        {match.product.productType === 'credit_card' ? 'Max Credit Limit' : 'Max Amount'}
                      </p>
                      <p className="text-2xl font-bold">${match.pricing.maxAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  {match.product.productType !== 'credit_card' && match.pricing.terms && match.pricing.terms.length > 0 && (
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
                  )}
                  {match.product.productType === 'credit_card' && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Revolving credit - Pay over time with minimum payments</p>
                    </div>
                  )}
                  {match.pricing.originationFee > 0 && (
                    <p className="text-sm text-gray-600 mb-4">
                      {match.product.productType === 'credit_card' ? 'Annual Fee' : 'Origination Fee'}: ${match.pricing.originationFee.toFixed(2)}
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

