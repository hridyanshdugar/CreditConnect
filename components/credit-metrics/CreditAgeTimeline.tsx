'use client';

import { Card, CardBody, CardHeader } from '@heroui/react';
import { Calendar, Clock } from 'lucide-react';

interface Account {
  type: string;
  age: number;
  openedDate: Date | string;
}

interface CreditAgeProps {
  oldestAccountAge: number;
  averageAccountAge: number;
  accountCount: number;
  accounts: Account[];
}

export default function CreditAgeTimeline({
  oldestAccountAge,
  averageAccountAge,
  accountCount,
  accounts,
}: CreditAgeProps) {
  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-xl font-semibold">Your Credit Age</h2>
          <p className="text-sm text-default-500">Length of Credit History (15% of credit score)</p>
        </div>
      </CardHeader>
      <CardBody className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-default-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <div className="text-sm text-default-600">Average Age</div>
            </div>
            <div className="text-2xl font-bold">
              {averageAccountAge.toFixed(1)} years
            </div>
          </div>
          <div className="p-4 bg-default-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-success" />
              <div className="text-sm text-default-600">Oldest Account</div>
            </div>
            <div className="text-2xl font-bold">
              {oldestAccountAge.toFixed(1)} years
            </div>
          </div>
        </div>

        {/* Timeline Visualization */}
        {accounts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Account Timeline</h3>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-default-200" />
              
              {/* Account markers */}
              <div className="space-y-4">
                {accounts.map((account, idx) => (
                  <div key={idx} className="relative flex items-center gap-4">
                    {/* Timeline dot */}
                    <div className="relative z-10 w-8 h-8 rounded-full bg-primary border-4 border-background flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    
                    {/* Account info */}
                    <div className="flex-1 p-3 bg-default-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold capitalize">{account.type}</div>
                          <div className="text-sm text-default-600">
                            Opened: {formatDate(account.openedDate)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {account.age.toFixed(1)}y
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="p-4 bg-primary-50 rounded-lg">
          <div className="text-sm font-semibold mb-2">Summary</div>
          <p className="text-xs text-default-700">
            Your oldest account is {oldestAccountAge.toFixed(1)} years old, and your average 
            account age is {averageAccountAge.toFixed(1)} years across {accountCount} account{accountCount !== 1 ? 's' : ''}. 
            This contributes to 15% of your credit score.
          </p>
        </div>

        {/* Insight */}
        <div className="p-3 bg-default-50 rounded-lg">
          <p className="text-xs text-default-700">
            <strong>Insight:</strong> A longer credit history demonstrates financial stability. 
            Keeping older accounts open, even if unused, can help improve your average credit age.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

