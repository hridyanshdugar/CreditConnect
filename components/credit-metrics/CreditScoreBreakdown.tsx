'use client';

import { Card, CardBody, CardHeader } from '@heroui/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Info } from 'lucide-react';

interface CreditScoreBreakdownProps {
  showDetails?: boolean;
}

export default function CreditScoreBreakdown({ showDetails = true }: CreditScoreBreakdownProps) {
  const data = [
    { 
      name: 'Payment History', 
      value: 35, 
      color: '#0072F5', // Primary blue
      description: 'Your track record of making on-time payments'
    },
    { 
      name: 'Amounts Owed', 
      value: 30, 
      color: '#17C964', // Success green
      description: 'Your credit utilization and total debt'
    },
    { 
      name: 'Length of Credit History', 
      value: 15, 
      color: '#F5A524', // Warning orange
      description: 'How long you\'ve been using credit'
    },
    { 
      name: 'New Credit', 
      value: 10, 
      color: '#9353D3', // Purple
      description: 'Recent credit inquiries and new accounts'
    },
    { 
      name: 'Credit Mix', 
      value: 10, 
      color: '#F31260', // Danger red
      description: 'Variety of credit types you have'
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-content1 border-2 border-default-200 rounded-lg p-3 shadow-xl">
          <p className="font-semibold text-sm mb-1">{payload[0].name}</p>
          <p className="text-2xl font-bold mb-2" style={{ color: payload[0].payload.color }}>
            {payload[0].value}%
          </p>
          <p className="text-xs text-default-600 max-w-[200px]">
            {payload[0].payload.description}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-col gap-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <div 
            key={`legend-${index}`}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-default-100 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div 
                className="w-4 h-4 rounded-full shadow-md" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium text-default-700">
                {entry.value}
              </span>
            </div>
            <span className="text-lg font-bold" style={{ color: entry.color }}>
              {entry.payload.value}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-bold text-sm"
        style={{ 
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          pointerEvents: 'none'
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between w-full">
          <div className="flex-1">
            <h2 className="text-xl font-semibold">Components of a Credit Score</h2>
            <p className="text-sm text-default-500 mt-1">
              Understanding what impacts your credit score
            </p>
          </div>
          <div className="p-2 bg-primary/10 rounded-full">
            <Info className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardBody className="pt-4">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={120}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                      strokeWidth={2}
                      stroke="#ffffff"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend and Details */}
          <div className="flex flex-col justify-center">
            <CustomLegend payload={data.map(item => ({ 
              value: item.name, 
              color: item.color,
              payload: item
            }))} />
          </div>
        </div>

        {showDetails && (
          <>
            {/* Divider */}
            <div className="my-6 border-t border-default-200" />

            {/* Detailed Explanations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                What Each Component Means
              </h3>
              
              {data.map((item, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-xl border-2 transition-all hover:shadow-lg hover:scale-[1.02]"
                  style={{ 
                    borderColor: `${item.color}30`,
                    backgroundColor: `${item.color}08`
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0 mt-1"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.value}%
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-default-800 mb-1">
                        {item.name}
                      </h4>
                      <p className="text-sm text-default-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Key Insights */}
            <div className="mt-6 p-4 bg-primary/5 border-2 border-primary/20 rounded-xl">
              <h4 className="font-semibold text-default-800 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                Key Insights
              </h4>
              <ul className="space-y-2 text-sm text-default-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span><strong>Payment History (35%)</strong> is the most important factor. Always pay bills on time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span><strong>Amounts Owed (30%)</strong> focuses on credit utilization. Keep it below 30% for best results.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span><strong>Length of Credit History (15%)</strong> rewards long-term responsible credit use.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>The remaining <strong>20%</strong> comes from new credit inquiries and having a diverse credit mix.</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

