'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CostComparison } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { ArrowUp, TrendingDown } from 'lucide-react';
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
      <Card className={isSavings ? 'border-chart-5 bg-chart-5/10' : 'border-destructive bg-destructive/10'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            {isSavings ? (
              <TrendingDown className="h-6 w-6 text-chart-5" />
            ) : (
              <ArrowUp className="h-6 w-6 text-destructive" />
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
              <p className={`text-4xl font-bold ${isSavings ? 'text-chart-5' : 'text-destructive'}`}>
                {isSavings ? '+' : '-'}{formatCurrency(Math.abs(savings))}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatPercentage(Math.abs(savingsPercentage))} {isSavings ? 'less' : 'more'}
              </p>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
                <p className="text-2xl font-semibold text-foreground">{formatCurrency(traditional.totalAnnualCost)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">With DPC</p>
                <p className="text-2xl font-semibold text-primary">
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
            <CardTitle className="text-foreground">Traditional Insurance</CardTitle>
            <CardDescription>Annual cost breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Monthly Premiums</span>
              <span className="font-semibold text-foreground">{formatCurrency(traditional.breakdown.premiums)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Out-of-Pocket Costs</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(traditional.breakdown.outOfPocket)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Prescriptions</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(traditional.breakdown.prescriptions)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Preventive Care</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(traditional.breakdown.preventiveCare)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-t-2 border-muted">
              <span className="font-bold text-foreground">Total Annual Cost</span>
              <span className="text-xl font-bold text-foreground">{formatCurrency(traditional.totalAnnualCost)}</span>
            </div>
          </CardContent>
        </Card>

        {/* DPC Model Breakdown */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-primary">Direct Primary Care Model</CardTitle>
            <CardDescription>Annual cost breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">DPC Membership</span>
              <span className="font-semibold text-foreground">{formatCurrency(dpc.breakdown.dpcMembership)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Catastrophic Insurance</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(dpc.breakdown.catastrophicInsurance)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Out-of-Pocket Costs</span>
              <span className="font-semibold text-foreground">{formatCurrency(dpc.breakdown.outOfPocket)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Prescriptions</span>
              <span className="font-semibold text-foreground">{formatCurrency(dpc.breakdown.prescriptions)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-t-2 border-primary">
              <span className="font-bold text-foreground">Total Annual Cost</span>
              <span className="text-xl font-bold text-primary">
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
