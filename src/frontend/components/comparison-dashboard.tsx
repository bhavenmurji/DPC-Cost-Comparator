'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CostComparison } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { ArrowDown, ArrowUp, TrendingDown, DollarSign } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';
import { MinimalErrorFallback } from './ErrorFallback';

interface ComparisonDashboardProps {
  comparison: CostComparison;
}

function ComparisonDashboardContent({ comparison }: ComparisonDashboardProps) {
  const { traditional, dpc, savings, savingsPercentage } = comparison;
  const isSavings = savings > 0;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className={isSavings ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isSavings ? (
              <TrendingDown className="h-6 w-6 text-green-600" />
            ) : (
              <ArrowUp className="h-6 w-6 text-red-600" />
            )}
            {isSavings ? 'Potential Savings with DPC' : 'Higher Cost with DPC'}
          </CardTitle>
          <CardDescription>
            Comparing your current plan to Direct Primary Care
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground mb-1">Annual Savings</p>
              <p className={`text-4xl font-bold ${isSavings ? 'text-green-600' : 'text-red-600'}`}>
                {isSavings ? '+' : '-'}{formatCurrency(Math.abs(savings))}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatPercentage(Math.abs(savingsPercentage))} {isSavings ? 'less' : 'more'}
              </p>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
                <p className="text-2xl font-semibold">{formatCurrency(traditional.totalAnnualCost)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">With DPC</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {formatCurrency(dpc.totalAnnualCost)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traditional Insurance Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Traditional Insurance</CardTitle>
            <CardDescription>Annual cost breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Monthly Premiums</span>
              <span className="font-semibold">{formatCurrency(traditional.breakdown.premiums)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Out-of-Pocket Costs</span>
              <span className="font-semibold">
                {formatCurrency(traditional.breakdown.outOfPocket)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Prescriptions</span>
              <span className="font-semibold">
                {formatCurrency(traditional.breakdown.prescriptions)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Preventive Care</span>
              <span className="font-semibold">
                {formatCurrency(traditional.breakdown.preventiveCare)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-t-2 border-primary">
              <span className="font-bold">Total Annual Cost</span>
              <span className="text-xl font-bold">{formatCurrency(traditional.totalAnnualCost)}</span>
            </div>
          </CardContent>
        </Card>

        {/* DPC Model Breakdown */}
        <Card className="border-blue-500">
          <CardHeader>
            <CardTitle className="text-blue-600">Direct Primary Care Model</CardTitle>
            <CardDescription>Annual cost breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">DPC Membership</span>
              <span className="font-semibold">{formatCurrency(dpc.breakdown.dpcMembership)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Catastrophic Insurance</span>
              <span className="font-semibold">
                {formatCurrency(dpc.breakdown.catastrophicInsurance)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Out-of-Pocket Costs</span>
              <span className="font-semibold">{formatCurrency(dpc.breakdown.outOfPocket)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Prescriptions</span>
              <span className="font-semibold">{formatCurrency(dpc.breakdown.prescriptions)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-t-2 border-blue-500">
              <span className="font-bold">Total Annual Cost</span>
              <span className="text-xl font-bold text-blue-600">
                {formatCurrency(dpc.totalAnnualCost)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ComparisonDashboard({ comparison }: ComparisonDashboardProps) {
  return (
    <ErrorBoundary level="feature" fallback={MinimalErrorFallback}>
      <ComparisonDashboardContent comparison={comparison} />
    </ErrorBoundary>
  );
}
