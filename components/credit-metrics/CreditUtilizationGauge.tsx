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

  // Calculate gauge rotation (-90 to 90 degrees)
  const gaugeRotation = -90 + (Math.min(100, utilization) * 1.8);
  
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
            <p className="text-sm text-default-500">Amounts Owed (30% of credit score)</p>
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
        {/* Modern Gauge Visualization */}
        <div className="flex justify-center items-center py-4">
          <div className="relative w-72 h-44">
            {/* Gauge Background */}
            <svg className="w-full h-full" viewBox="0 0 200 120">
              <defs>
                {/* Gradient definitions */}
                <linearGradient id="excellentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#22c55e', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#16a34a', stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="goodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="fairGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#d97706', stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="poorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
                </linearGradient>
                
                {/* Shadow filter */}
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                  <feOffset dx="0" dy="2" result="offsetblur"/>
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.3"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Background track */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#f4f4f5"
                strokeWidth="24"
                strokeLinecap="round"
              />
              
              {/* Colored zones */}
              {/* Excellent zone (0-10%) - Green */}
              <path
                d="M 20 100 A 80 80 0 0 1 36 36"
                fill="none"
                stroke="url(#excellentGradient)"
                strokeWidth="24"
                strokeLinecap="round"
              />
              
              {/* Good zone (10-30%) - Blue */}
              <path
                d="M 36 36 A 80 80 0 0 1 84 20"
                fill="none"
                stroke="url(#goodGradient)"
                strokeWidth="24"
                strokeLinecap="round"
              />
              
              {/* Fair zone (30-50%) - Orange */}
              <path
                d="M 84 20 A 80 80 0 0 1 116 20"
                fill="none"
                stroke="url(#fairGradient)"
                strokeWidth="24"
                strokeLinecap="round"
              />
              
              {/* Poor zone (50%+) - Red */}
              <path
                d="M 116 20 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#poorGradient)"
                strokeWidth="24"
                strokeLinecap="round"
              />
              
              {/* Center dot indicators */}
              <circle cx="20" cy="100" r="3" fill="#22c55e" />
              <circle cx="36" cy="36" r="3" fill="#3b82f6" />
              <circle cx="100" cy="20" r="3" fill="#f59e0b" />
              <circle cx="164" cy="36" r="3" fill="#ef4444" />
              <circle cx="180" cy="100" r="3" fill="#dc2626" />
              
              {/* Needle */}
              <g transform={`rotate(${gaugeRotation} 100 100)`} filter="url(#shadow)">
                {/* Needle shadow */}
                <path
                  d="M 100 100 L 98 98 L 100 30 L 102 98 Z"
                  fill="#18181b"
                  opacity="0.2"
                />
                {/* Needle */}
                <path
                  d="M 100 100 L 98 98 L 100 30 L 102 98 Z"
                  fill="#18181b"
                />
                {/* Center circle */}
                <circle cx="100" cy="100" r="6" fill="#18181b" />
                <circle cx="100" cy="100" r="4" fill="white" />
              </g>
              
              {/* Labels */}
              <text x="20" y="115" fontSize="10" fill="#71717a" textAnchor="middle">0%</text>
              <text x="100" y="10" fontSize="10" fill="#71717a" textAnchor="middle">50%</text>
              <text x="180" y="115" fontSize="10" fill="#71717a" textAnchor="middle">100%</text>
            </svg>
            
            {/* Percentage Display */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
              <div className={`text-5xl font-bold ${getZoneColor()}`}>
                {utilization.toFixed(1)}%
              </div>
              <div className="text-xs text-default-400 uppercase tracking-wider">Utilization</div>
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

        {/* Visual Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-default-600 font-medium">Credit Usage</span>
            <span className="text-default-500">
              ${totalCreditUsed.toLocaleString()} of ${totalCreditLimit.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={utilization}
            color={getProgressColor()}
            size="lg"
            className="w-full"
            showValueLabel={false}
          />
        </div>

        {/* Zone Legend */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-default-600">Excellent (0-10%)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-default-600">Good (10-30%)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-default-600">Fair (30-50%)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-danger" />
            <span className="text-default-600">Poor (50%+)</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

