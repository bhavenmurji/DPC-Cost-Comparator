'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InsurancePlan } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface InsuranceFormProps {
  plan: InsurancePlan;
  onChange: (plan: InsurancePlan) => void;
}

export function InsuranceForm({ plan, onChange }: InsuranceFormProps) {
  const handleChange = (field: keyof InsurancePlan, value: string | number) => {
    onChange({
      ...plan,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Insurance Plan</CardTitle>
        <CardDescription>
          Enter your current traditional health insurance plan details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="monthlyPremium">Monthly Premium</Label>
            <Input
              id="monthlyPremium"
              type="number"
              placeholder="500"
              value={plan.monthlyPremium || ''}
              onChange={(e) => handleChange('monthlyPremium', e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Your monthly insurance premium payment
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deductible">Annual Deductible</Label>
            <Input
              id="deductible"
              type="number"
              placeholder="3000"
              value={plan.deductible || ''}
              onChange={(e) => handleChange('deductible', e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Amount you pay before insurance kicks in
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coinsurance">Coinsurance (%)</Label>
            <Input
              id="coinsurance"
              type="number"
              placeholder="20"
              min="0"
              max="100"
              value={plan.coinsurance || ''}
              onChange={(e) => handleChange('coinsurance', e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Your share after deductible (e.g., 20%)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="copay">Average Copay</Label>
            <Input
              id="copay"
              type="number"
              placeholder="30"
              value={plan.copay || ''}
              onChange={(e) => handleChange('copay', e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Typical copay for doctor visits
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="outOfPocketMax">Out-of-Pocket Maximum</Label>
            <Input
              id="outOfPocketMax"
              type="number"
              placeholder="8000"
              value={plan.outOfPocketMax || ''}
              onChange={(e) => handleChange('outOfPocketMax', e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Maximum you'll pay in a year
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Estimated Annual Premium:</span>
            <span className="text-lg font-bold">
              {formatCurrency(plan.monthlyPremium * 12)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
