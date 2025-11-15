'use client';

import { Card, CardBody, CardHeader } from '@heroui/react';

interface CreditUtilizationProps {
  utilization: number;
  totalCreditUsed: number;
  totalCreditLimit: number;
  zone: 'excellent' | 'good' | 'fair' | 'poor';
}

export default function CreditUtilizationGauge({
  utilization,
  totalCreditUsed,
  totalCreditLimit,
  zone,
}: CreditUtilizationProps) {
  const getZoneColor = () => {
    switch (zone) {
      case 'excellent':
        return 'text-success';
      case 'good':
        return 'text-primary';
      case 'fair':
        return 'text-warning';
      case 'poor':
        return 'text-danger';
    }
  };

  const getZoneBgColor = () => {
    switch (zone) {
      case 'excellent':
        return 'bg-success';
      case 'good':
        return 'bg-primary';
      case 'fair':
        return 'bg-warning';
      case 'poor':
        return 'bg-danger';
    }
  };

  // Calculate gauge angle (0-180 degrees for semicircle)
  const gaugeAngle = Math.min(180, (utilization / 100) * 180);

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-xl font-semibold">Credit Utilization Gauge</h2>
          <p className="text-sm text-default-500">Amounts Owed (30% of credit score)</p>
        </div>
      </CardHeader>
      <CardBody className="space-y-6">
        {/* Gauge Visualization */}
        <div className="flex justify-center items-center py-8">
          <div className="relative w-64 h-32">
            {/* Gauge Background */}
            <svg className="w-full h-full" viewBox="0 0 200 100">
              {/* Background arc */}
              <path
                d="M 20 80 A 80 80 0 0 1 180 80"
                fill="none"
                stroke="#e4e4e7"
                strokeWidth="20"
                strokeLinecap="round"
              />
              
              {/* Excellent zone (0-10%) */}
              <path
                d="M 20 80 A 80 80 0 0 1 56 20"
                fill="none"
                stroke="#22c55e"
                strokeWidth="20"
                strokeLinecap="round"
              />
              
              {/* Good zone (10-30%) */}
              <path
                d="M 56 20 A 80 80 0 0 1 100 20"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="20"
                strokeLinecap="round"
              />
              
              {/* Fair zone (30-50%) */}
              <path
                d="M 100 20 A 80 80 0 0 1 144 20"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="20"
                strokeLinecap="round"
              />
              
              {/* Poor zone (50%+) */}
              <path
                d="M 144 20 A 80 80 0 0 1 180 80"
                fill="none"
                stroke="#ef4444"
                strokeWidth="20"
                strokeLinecap="round"
              />
              
              {/* Current utilization indicator */}
              <path
                d={`M 20 80 A 80 80 0 ${gaugeAngle > 90 ? 1 : 0} 1 ${20 + (gaugeAngle / 180) * 160} ${80 - Math.sin((gaugeAngle / 180) * Math.PI) * 80}`}
                fill="none"
                stroke="#000"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </svg>
            
            {/* Percentage Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-5xl font-bold ${getZoneColor()}`}>
                  {utilization.toFixed(1)}%
                </div>
                <div className="text-sm text-default-500 mt-1 capitalize">{zone}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Numbers */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-default-50 rounded-lg">
            <div className="text-sm text-default-600 mb-1">Total Credit Limit</div>
            <div className="text-2xl font-bold">
              ${totalCreditLimit.toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-default-50 rounded-lg">
            <div className="text-sm text-default-600 mb-1">Total Credit Used</div>
            <div className="text-2xl font-bold">
              ${totalCreditUsed.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Zone Indicators */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-success" />
              <span>Excellent (0-10%)</span>
            </div>
            {zone === 'excellent' && <span className="text-success font-semibold">Current</span>}
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary" />
              <span>Good (10-30%)</span>
            </div>
            {zone === 'good' && <span className="text-primary font-semibold">Current</span>}
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-warning" />
              <span>Fair (30-50%)</span>
            </div>
            {zone === 'fair' && <span className="text-warning font-semibold">Current</span>}
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-danger" />
              <span>Poor (50%+)</span>
            </div>
            {zone === 'poor' && <span className="text-danger font-semibold">Current</span>}
          </div>
        </div>

        {/* Insight */}
        <div className="mt-4 p-3 bg-primary-50 rounded-lg">
          <p className="text-xs text-default-700">
            <strong>Insight:</strong> You currently use ${totalCreditUsed.toLocaleString()} out of 
            your ${totalCreditLimit.toLocaleString()} total credit limit, resulting in a{' '}
            {utilization.toFixed(1)}% credit utilization. Lenders prefer to see you using less 
            than 30% of your available credit. Keeping this number low significantly boosts 30% 
            of your credit score.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

