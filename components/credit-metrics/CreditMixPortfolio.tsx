'use client';

import { Card, CardBody, CardHeader, Progress } from '@heroui/react';
import { CreditCard, FileText, Building2 } from 'lucide-react';

interface CreditMixProps {
  types: string[];
  typeCount: number;
  breakdown: {
    creditCards: number;
    loans: number;
    bills: number;
    total: number;
  };
}

export default function CreditMixPortfolio({
  types,
  typeCount,
  breakdown,
}: CreditMixProps) {
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'revolving':
        return <CreditCard className="w-6 h-6" />;
      case 'installment':
        return <Building2 className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'revolving':
        return 'text-primary';
      case 'installment':
        return 'text-success';
      default:
        return 'text-warning';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'revolving':
        return 'Revolving Credit';
      case 'installment':
        return 'Installment Loans';
      default:
        return type;
    }
  };

  const totalAccounts = breakdown.total;
  const creditCardPercentage = totalAccounts > 0 ? (breakdown.creditCards / totalAccounts) * 100 : 0;
  const loanPercentage = totalAccounts > 0 ? (breakdown.loans / totalAccounts) * 100 : 0;
  const billPercentage = totalAccounts > 0 ? (breakdown.bills / totalAccounts) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-xl font-semibold">Your Credit Type Portfolio</h2>
          <p className="text-sm text-default-500">Credit Mix (10% of credit score)</p>
        </div>
      </CardHeader>
      <CardBody className="space-y-6">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-default-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary">{typeCount}</div>
            <div className="text-xs text-default-600 mt-1">Credit Types</div>
          </div>
          <div className="p-4 bg-default-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary">{totalAccounts}</div>
            <div className="text-xs text-default-600 mt-1">Total Accounts</div>
          </div>
          <div className="p-4 bg-default-50 rounded-lg text-center">
            <div className={`text-2xl font-bold ${
              typeCount >= 2 ? 'text-success' : 'text-warning'
            }`}>
              {typeCount >= 2 ? '✓' : '!'}
            </div>
            <div className="text-xs text-default-600 mt-1">
              {typeCount >= 2 ? 'Diverse' : 'Limited'}
            </div>
          </div>
        </div>

        {/* Credit Type Breakdown */}
        <div className="space-y-4">
          {types.length > 0 ? (
            types.map((type, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={getTypeColor(type)}>
                      {getTypeIcon(type)}
                    </div>
                    <div>
                      <div className="font-semibold">{getTypeLabel(type)}</div>
                      <div className="text-xs text-default-600">
                        {type === 'Revolving' && `${breakdown.creditCards} credit card${breakdown.creditCards !== 1 ? 's' : ''}`}
                        {type === 'Installment' && `${breakdown.loans} loan${breakdown.loans !== 1 ? 's' : ''}`}
                        {type === 'Utility' && `${breakdown.bills} bill${breakdown.bills !== 1 ? 's' : ''}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {type === 'Revolving' && breakdown.creditCards}
                      {type === 'Installment' && breakdown.loans}
                      {type === 'Utility' && breakdown.bills}
                    </div>
                  </div>
                </div>
                <Progress
                  value={
                    type === 'Revolving' ? creditCardPercentage :
                    type === 'Installment' ? loanPercentage :
                    billPercentage
                  }
                  color={
                    type === 'Revolving' ? 'primary' :
                    type === 'Installment' ? 'success' :
                    'warning'
                  }
                  className="w-full"
                />
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-default-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No credit accounts found</p>
            </div>
          )}
        </div>

        {/* Account Type Details */}
        <div className="grid grid-cols-3 gap-3">
          {breakdown.creditCards > 0 && (
            <div className="p-3 bg-primary-50 rounded-lg text-center">
              <CreditCard className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-xl font-bold text-primary">{breakdown.creditCards}</div>
              <div className="text-xs text-default-600">Credit Card{breakdown.creditCards !== 1 ? 's' : ''}</div>
            </div>
          )}
          {breakdown.loans > 0 && (
            <div className="p-3 bg-success-50 rounded-lg text-center">
              <Building2 className="w-6 h-6 mx-auto mb-2 text-success" />
              <div className="text-xl font-bold text-success">{breakdown.loans}</div>
              <div className="text-xs text-default-600">Loan{breakdown.loans !== 1 ? 's' : ''}</div>
            </div>
          )}
          {breakdown.bills > 0 && (
            <div className="p-3 bg-warning-50 rounded-lg text-center">
              <FileText className="w-6 h-6 mx-auto mb-2 text-warning" />
              <div className="text-xl font-bold text-warning">{breakdown.bills}</div>
              <div className="text-xs text-default-600">Bill{breakdown.bills !== 1 ? 's' : ''}</div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="p-3 bg-default-50 rounded-lg">
          <p className="text-xs text-default-700">
            <strong>Current Mix:</strong> You currently have {typeCount} type{typeCount !== 1 ? 's' : ''} of credit: 
            {breakdown.creditCards > 0 && ` ${breakdown.creditCards} credit card${breakdown.creditCards !== 1 ? 's' : ''} (revolving)`}
            {breakdown.loans > 0 && `, ${breakdown.loans} loan${breakdown.loans !== 1 ? 's' : ''} (installment)`}
            {breakdown.bills > 0 && `, ${breakdown.bills} bill${breakdown.bills !== 1 ? 's' : ''} (utility)`}.
          </p>
        </div>

        {/* Insight */}
        <div className="p-3 bg-primary-50 rounded-lg">
          <p className="text-xs text-default-700">
            <strong>Insight:</strong> Having a healthy 'mix' of credit, like both revolving credit 
            cards and installment loans, demonstrates responsible management of different debt types. 
            This positively influences 10% of your credit score.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

