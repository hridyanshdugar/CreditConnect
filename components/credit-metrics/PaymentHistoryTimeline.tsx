'use client';

import { Card, CardBody, CardHeader, Progress } from '@heroui/react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface PaymentMonth {
  month: string;
  status: 'on-time' | 'late-30' | 'late-60' | 'missed';
  date: string;
}

interface PaymentHistoryProps {
  months: PaymentMonth[];
  onTimeRate: number;
  currentStreak: number;
  totalPayments: number;
  onTimePayments: number;
}

export default function PaymentHistoryTimeline({
  months,
  onTimeRate,
  currentStreak,
  totalPayments,
  onTimePayments,
}: PaymentHistoryProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-time':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'late-30':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'late-60':
      case 'missed':
        return <XCircle className="w-5 h-5 text-danger" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-default-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'bg-success';
      case 'late-30':
        return 'bg-warning';
      case 'late-60':
      case 'missed':
        return 'bg-danger';
      default:
        return 'bg-default-200';
    }
  };

  // Show last 12 months for better visibility
  const displayMonths = months.slice(-12);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <div>
            <h2 className="text-xl font-semibold">On-Time Payment Streak</h2>
            <p className="text-sm text-default-500">Payment History (35% of credit score)</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-success">{currentStreak}</div>
            <div className="text-xs text-default-500">Month Streak</div>
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        {/* On-Time Rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">On-Time Payment Rate</span>
            <span className="text-lg font-bold text-success">{onTimeRate.toFixed(1)}%</span>
          </div>
          <Progress
            value={onTimeRate}
            color="success"
            className="w-full"
          />
          <p className="text-xs text-default-500">
            {onTimePayments} on-time payments out of {totalPayments} total payments
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Last 12 Months</h3>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {displayMonths.map((month, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center space-y-1 p-2 rounded-lg border border-default-200 hover:border-primary transition-colors"
              >
                {getStatusIcon(month.status)}
                <span className="text-xs text-default-600 text-center leading-tight">
                  {month.month.split(' ')[0]}
                </span>
                <div className={`w-full h-1 rounded ${getStatusColor(month.status)}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-2 border-t border-default-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span className="text-xs text-default-600">On-Time</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-xs text-default-600">Late (30-59 days)</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-danger" />
            <span className="text-xs text-default-600">Late (60+ days) / Missed</span>
          </div>
        </div>

        {/* Insight */}
        <div className="mt-4 p-3 bg-primary-50 rounded-lg">
          <p className="text-xs text-default-700">
            <strong>Insight:</strong> Each green checkmark builds your 'on-time streak,' which 
            positively impacts 35% of your credit score. Missing a payment can reset this 
            streak and have a significant negative effect.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

