'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserProfile } from '@/types';

interface ProfileFormProps {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
}

export function ProfileForm({ profile, onChange }: ProfileFormProps) {
  const handleChange = (field: keyof UserProfile, value: string | number | string[]) => {
    onChange({
      ...profile,
      [field]: value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Help us find providers and plans in your area
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              type="text"
              placeholder="12345"
              maxLength={5}
              value={profile.zipCode || ''}
              onChange={(e) => handleChange('zipCode', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              For finding nearby DPC providers
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min="0"
              max="120"
              placeholder="35"
              value={profile.age || ''}
              onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Your current age
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="familySize">Family Size</Label>
            <Input
              id="familySize"
              type="number"
              min="1"
              max="20"
              placeholder="1"
              value={profile.familySize || ''}
              onChange={(e) => handleChange('familySize', parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-muted-foreground">
              Number of people to cover
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="chronicConditions">Chronic Conditions (Optional)</Label>
          <Input
            id="chronicConditions"
            type="text"
            placeholder="e.g., diabetes, hypertension (comma-separated)"
            value={profile.chronicConditions?.join(', ') || ''}
            onChange={(e) =>
              handleChange(
                'chronicConditions',
                e.target.value.split(',').map((c) => c.trim()).filter(Boolean)
              )
            }
          />
          <p className="text-xs text-muted-foreground">
            List any chronic conditions that require regular care
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
