'use client';

import { Card, CardBody, CardHeader, Progress, Chip } from '@heroui/react';
import { TrendingUp, TrendingDown } from 'lucide-react';

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

  const getProgressColor = () => {
    switch (zone) {
      case 'excellent':
        return 'success';
      case 'good':
        return 'primary';
      case 'fair':
        return 'warning';
      case 'poor':
        return 'danger';
    }
  };

  const getChipColor = () => {
    switch (zone) {
      case 'excellent':
        return 'success';
      case 'good':
        return 'primary';
      case 'fair':
        return 'warning';
      case 'poor':
        return 'danger';
    }
  };

  // Get recommendation based on zone
  const getRecommendation = () => {
    if (utilization <= 10) {
      return { 
        text: 'Excellent! Your credit utilization is optimal.', 
        icon: <TrendingUp className="w-4 h-4" />,
        color: 'text-success'
      };
    } else if (utilization <= 30) {
      return { 
        text: 'Good! Keep your utilization below 30% to maintain a healthy score.', 
        icon: <TrendingUp className="w-4 h-4" />,
        color: 'text-primary'
      };
    } else if (utilization <= 50) {
      return { 
        text: 'Consider paying down your balance to improve your score.', 
        icon: <TrendingDown className="w-4 h-4" />,
        color: 'text-warning'
      };
    } else {
      return { 
        text: 'High utilization! Pay down your balance as soon as possible.', 
        icon: <TrendingDown className="w-4 h-4" />,
        color: 'text-danger'
      };
    }
  };

  const recommendation = getRecommendation();
  const availableCredit = totalCreditLimit - totalCreditUsed;

  return (
    <Card className="w-full">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between w-full">
          <div>
            <h2 className="text-xl font-semibold">Credit Utilization</h2>
          </div>
          <Chip 
            color={getChipColor()} 
            variant="flat"
            className="capitalize"
          >
            {zone}
          </Chip>
        </div>
      </CardHeader>
      <CardBody className="space-y-6 pt-8">
        {/* Modern Bar Visualization */}
        <div className="space-y-6 py-4">
          {/* Main Percentage Display */}
          <div className="text-center">
            <div className={`text-6xl font-bold ${getZoneColor()} mb-2`}>
              {utilization.toFixed(1)}%
            </div>
            <div className="text-sm text-default-500">Current Utilization</div>
          </div>

          {/* Colorful Zone Bar */}
          <div className="relative">
            {/* Background bar with zones */}
            <div className="h-16 rounded-2xl overflow-hidden shadow-lg border-3 border-white relative">
              <div className="absolute inset-0 flex">
                {/* Excellent zone (0-10%) */}
                <div className="h-full bg-gradient-to-r from-success-400 to-success-500" style={{ width: '10%' }} />
                {/* Good zone (10-30%) */}
                <div className="h-full bg-gradient-to-r from-primary-400 to-primary-500" style={{ width: '20%' }} />
                {/* Fair zone (30-50%) */}
                <div className="h-full bg-gradient-to-r from-warning-400 to-warning-500" style={{ width: '20%' }} />
                {/* Poor zone (50-100%) */}
                <div className="h-full bg-gradient-to-r from-danger-400 to-danger-500" style={{ width: '50%' }} />
              </div>
              
              {/* Current position indicator */}
              <div 
                className="absolute top-0 bottom-0 flex items-center transition-all duration-500 ease-out"
                style={{ left: `${Math.min(100, utilization)}%` }}
              >
                {/* Indicator line */}
                <div className="relative -ml-1">
                  <div className="w-2 h-16 bg-white shadow-xl rounded-full" />
                  {/* Indicator triangle */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white drop-shadow-lg" />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                    <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white drop-shadow-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* Zone markers */}
            <div className="flex justify-between mt-2 px-1">
              <div className="text-xs text-default-500 font-medium">0%</div>
              <div className="text-xs text-default-500 font-medium absolute left-[10%] -ml-3">10%</div>
              <div className="text-xs text-default-500 font-medium absolute left-[30%] -ml-3">30%</div>
              <div className="text-xs text-default-500 font-medium absolute left-[50%] -ml-3">50%</div>
              <div className="text-xs text-default-500 font-medium">100%</div>
            </div>
          </div>

          {/* Zone labels with current indicator */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            <div className={`p-3 rounded-lg border-2 transition-all ${
              zone === 'excellent' 
                ? 'bg-success-50 border-success-500 shadow-lg scale-105' 
                : 'bg-default-50 border-default-200'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-success-500" />
                <span className="text-xs font-semibold text-default-700">Excellent</span>
              </div>
              <div className="text-xs text-default-500">0-10%</div>
            </div>
            <div className={`p-3 rounded-lg border-2 transition-all ${
              zone === 'good' 
                ? 'bg-primary-50 border-primary-500 shadow-lg scale-105' 
                : 'bg-default-50 border-default-200'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-primary-500" />
                <span className="text-xs font-semibold text-default-700">Good</span>
              </div>
              <div className="text-xs text-default-500">10-30%</div>
            </div>
            <div className={`p-3 rounded-lg border-2 transition-all ${
              zone === 'fair' 
                ? 'bg-warning-50 border-warning-500 shadow-lg scale-105' 
                : 'bg-default-50 border-default-200'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-warning-500" />
                <span className="text-xs font-semibold text-default-700">Fair</span>
              </div>
              <div className="text-xs text-default-500">30-50%</div>
            </div>
            <div className={`p-3 rounded-lg border-2 transition-all ${
              zone === 'poor' 
                ? 'bg-danger-50 border-danger-500 shadow-lg scale-105' 
                : 'bg-default-50 border-default-200'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-danger-500" />
                <span className="text-xs font-semibold text-default-700">Poor</span>
              </div>
              <div className="text-xs text-default-500">50-100%</div>
            </div>
          </div>
        </div>

        {/* Recommendation Banner */}
        <div className={`flex items-start gap-3 p-4 rounded-xl border-2 ${
          zone === 'excellent' ? 'bg-success-50 border-success-200' :
          zone === 'good' ? 'bg-primary-50 border-primary-200' :
          zone === 'fair' ? 'bg-warning-50 border-warning-200' :
          'bg-danger-50 border-danger-200'
        }`}>
          <div className={recommendation.color}>
            {recommendation.icon}
          </div>
          <p className={`text-sm ${recommendation.color} flex-1`}>
            <strong>Recommendation:</strong> {recommendation.text}
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 bg-gradient-to-br from-default-50 to-default-100 rounded-xl border border-default-200">
            <div className="text-xs text-default-500 mb-1.5">Credit Limit</div>
            <div className="text-xl font-bold text-default-700">
              ${(totalCreditLimit / 1000).toFixed(1)}K
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-default-50 to-default-100 rounded-xl border border-default-200">
            <div className="text-xs text-default-500 mb-1.5">Used</div>
            <div className="text-xl font-bold text-default-700">
              ${(totalCreditUsed / 1000).toFixed(1)}K
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-success-50 to-success-100 rounded-xl border border-success-200">
            <div className="text-xs text-success-700 mb-1.5">Available</div>
            <div className="text-xl font-bold text-success-700">
              ${(availableCredit / 1000).toFixed(1)}K
            </div>
          </div>
        </div>

        {/* Detailed Progress Bar */}
        <div className="space-y-3 p-4 bg-default-50 rounded-xl">
          <div className="flex items-center justify-between text-xs">
            <span className="text-default-700 font-semibold">Detailed Breakdown</span>
            <span className="text-default-600">
              ${totalCreditUsed.toLocaleString()} of ${totalCreditLimit.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={utilization}
            color={getProgressColor()}
            size="lg"
            className="w-full"
            showValueLabel={true}
          />
        </div>
      </CardBody>
    </Card>
  );
}

