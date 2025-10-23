'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HealthcareUsage } from '@/types';

interface UsageFormProps {
  usage: HealthcareUsage;
  onChange: (usage: HealthcareUsage) => void;
}

export function UsageForm({ usage, onChange }: UsageFormProps) {
  const handleChange = (field: keyof HealthcareUsage, value: string) => {
    onChange({
      ...usage,
      [field]: parseInt(value) || 0,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Annual Healthcare Usage</CardTitle>
        <CardDescription>
          Estimate your typical healthcare usage in a year
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryCareVisits">Primary Care Visits</Label>
            <Input
              id="primaryCareVisits"
              type="number"
              min="0"
              placeholder="4"
              value={usage.primaryCareVisits || ''}
              onChange={(e) => handleChange('primaryCareVisits', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Annual visits to your primary care doctor
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialistVisits">Specialist Visits</Label>
            <Input
              id="specialistVisits"
              type="number"
              min="0"
              placeholder="2"
              value={usage.specialistVisits || ''}
              onChange={(e) => handleChange('specialistVisits', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Visits to specialists (cardiologist, etc.)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgentCareVisits">Urgent Care Visits</Label>
            <Input
              id="urgentCareVisits"
              type="number"
              min="0"
              placeholder="1"
              value={usage.urgentCareVisits || ''}
              onChange={(e) => handleChange('urgentCareVisits', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Walk-in clinic or urgent care visits
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="erVisits">Emergency Room Visits</Label>
            <Input
              id="erVisits"
              type="number"
              min="0"
              placeholder="0"
              value={usage.erVisits || ''}
              onChange={(e) => handleChange('erVisits', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Emergency room visits per year
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prescriptions">Prescriptions</Label>
            <Input
              id="prescriptions"
              type="number"
              min="0"
              placeholder="3"
              value={usage.prescriptions || ''}
              onChange={(e) => handleChange('prescriptions', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Regular prescription medications
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="labTests">Lab Tests</Label>
            <Input
              id="labTests"
              type="number"
              min="0"
              placeholder="2"
              value={usage.labTests || ''}
              onChange={(e) => handleChange('labTests', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Blood work and lab tests per year
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imaging">Imaging Studies</Label>
            <Input
              id="imaging"
              type="number"
              min="0"
              placeholder="1"
              value={usage.imaging || ''}
              onChange={(e) => handleChange('imaging', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              X-rays, MRIs, CT scans, etc.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Total Annual Visits:</span>
            <span className="text-lg font-bold">
              {usage.primaryCareVisits +
                usage.specialistVisits +
                usage.urgentCareVisits +
                usage.erVisits}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
