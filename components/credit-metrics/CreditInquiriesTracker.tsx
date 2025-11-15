'use client';

import { Card, CardBody, CardHeader, Chip } from '@heroui/react';
import { AlertTriangle, Search } from 'lucide-react';

interface Inquiry {
  month: string;
  count: number;
  date: string;
}

interface CreditInquiriesProps {
  inquiries: Inquiry[];
  totals: {
    last6Months: number;
    last12Months: number;
    last24Months: number;
  };
  hasSurge: boolean;
}

export default function CreditInquiriesTracker({
  inquiries,
  totals,
  hasSurge,
}: CreditInquiriesProps) {
  // Show last 12 months
  const displayInquiries = inquiries.slice(-12);

  const getInquiryColor = (count: number) => {
    if (count === 0) return 'default';
    if (count === 1) return 'primary';
    if (count === 2) return 'warning';
    return 'danger';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <div>
            <h2 className="text-xl font-semibold">Recent Credit Inquiries</h2>
            <p className="text-sm text-default-500">New Credit (10% of credit score)</p>
          </div>
          {hasSurge && (
            <Chip color="warning" variant="flat" startContent={<AlertTriangle className="w-4 h-4" />}>
              Surge Detected
            </Chip>
          )}
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-default-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary">{totals.last6Months}</div>
            <div className="text-xs text-default-600 mt-1">Last 6 Months</div>
          </div>
          <div className="p-3 bg-default-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary">{totals.last12Months}</div>
            <div className="text-xs text-default-600 mt-1">Last 12 Months</div>
          </div>
          <div className="p-3 bg-default-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary">{totals.last24Months}</div>
            <div className="text-xs text-default-600 mt-1">Last 24 Months</div>
          </div>
        </div>

        {/* Monthly Cards */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Last 12 Months</h3>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {displayInquiries.map((inquiry, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  inquiry.count > 0
                    ? inquiry.count > 2
                      ? 'border-danger bg-danger-50'
                      : inquiry.count > 1
                      ? 'border-warning bg-warning-50'
                      : 'border-primary bg-primary-50'
                    : 'border-default-200 bg-default-50'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  {inquiry.count > 0 ? (
                    <>
                      <Search className={`w-5 h-5 ${
                        inquiry.count > 2 ? 'text-danger' : inquiry.count > 1 ? 'text-warning' : 'text-primary'
                      }`} />
                      <div className={`text-xl font-bold ${
                        inquiry.count > 2 ? 'text-danger' : inquiry.count > 1 ? 'text-warning' : 'text-primary'
                      }`}>
                        {inquiry.count}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-default-300" />
                      <div className="text-sm text-default-400">0</div>
                    </>
                  )}
                  <span className="text-xs text-default-600 leading-tight">
                    {inquiry.month.split(' ')[0]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warning if surge */}
        {hasSurge && (
          <div className="p-3 bg-warning-50 border border-warning rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="text-sm text-default-700">
                <strong>High Inquiry Activity:</strong> You've had {totals.last6Months} hard 
                inquiries in the last 6 months. Too many inquiries in a short period can 
                suggest higher risk to lenders.
              </div>
            </div>
          </div>
        )}

        {/* Example Breakdown */}
        {totals.last12Months > 0 && (
          <div className="p-3 bg-default-50 rounded-lg">
            <p className="text-xs text-default-700">
              <strong>Example:</strong> You've had {totals.last12Months} hard inquiry{totals.last12Months !== 1 ? 'ies' : ''} 
              {' '}in the last 12 months (e.g., {totals.last12Months === 1 ? '1 for a new credit card' : 
              totals.last12Months === 2 ? '1 for a new credit card, 1 for a car loan' :
              totals.last12Months === 3 ? '1 for a new credit card, 1 for a car loan, 1 for a mortgage application' :
              'multiple credit applications'}).
            </p>
          </div>
        )}

        {/* Insight */}
        <div className="p-3 bg-primary-50 rounded-lg">
          <p className="text-xs text-default-700">
            <strong>Insight:</strong> Too many hard inquiries in a short period can suggest 
            higher risk to lenders and slightly lower 10% of your score. Soft inquiries 
            (like checking your own score) don't affect your credit.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

