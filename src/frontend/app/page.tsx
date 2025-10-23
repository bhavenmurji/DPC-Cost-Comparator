'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InsuranceForm } from '@/components/insurance-form';
import { UsageForm } from '@/components/usage-form';
import { ProfileForm } from '@/components/profile-form';
import { ComparisonDashboard } from '@/components/comparison-dashboard';
import { ProviderList } from '@/components/provider-list';
import { InsurancePlan, HealthcareUsage, UserProfile, ComparisonResponse } from '@/types';
import { api } from '@/lib/api';
import { Calculator, Loader2 } from 'lucide-react';

export default function Home() {
  const [currentPlan, setCurrentPlan] = useState<InsurancePlan>({
    type: 'traditional',
    monthlyPremium: 500,
    deductible: 3000,
    coinsurance: 20,
    copay: 30,
    outOfPocketMax: 8000,
  });

  const [usage, setUsage] = useState<HealthcareUsage>({
    primaryCareVisits: 4,
    specialistVisits: 2,
    urgentCareVisits: 1,
    erVisits: 0,
    prescriptions: 3,
    labTests: 2,
    imaging: 1,
  });

  const [profile, setProfile] = useState<UserProfile>({
    zipCode: '',
    age: 35,
    familySize: 1,
    chronicConditions: [],
  });

  const [results, setResults] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!profile.zipCode || profile.zipCode.length !== 5) {
      setError('Please enter a valid 5-digit ZIP code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.compare({
        currentPlan,
        usage,
        profile,
      });
      setResults(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate comparison');
      console.error('Comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold tracking-tight">
          Compare Your Healthcare Costs
        </h2>
        <p className="text-lg text-muted-foreground">
          See how Direct Primary Care (DPC) compares to traditional insurance
        </p>
      </div>

      <Tabs defaultValue="input" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input">Enter Information</TabsTrigger>
          <TabsTrigger value="results" disabled={!results}>
            View Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-6">
          <ProfileForm profile={profile} onChange={setProfile} />
          <InsuranceForm plan={currentPlan} onChange={setCurrentPlan} />
          <UsageForm usage={usage} onChange={setUsage} />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleCompare}
              disabled={loading}
              className="w-full md:w-auto px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-5 w-5" />
                  Compare Costs
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {results && (
            <>
              <ComparisonDashboard comparison={results.comparison} />

              {results.recommendations && results.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {results.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <ProviderList providers={results.providers} />

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResults(null);
                    const inputTab = document.querySelector('[value="input"]') as HTMLElement;
                    inputTab?.click();
                  }}
                >
                  Modify Inputs
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      <div className="bg-gray-50 border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold">What is Direct Primary Care (DPC)?</h3>
        <p className="text-sm text-muted-foreground">
          Direct Primary Care is a healthcare model where patients pay a monthly or annual fee
          directly to a primary care physician. This membership covers all primary care services,
          including unlimited office visits, basic lab work, and care coordination. By eliminating
          insurance billing, DPC practices can spend more time with patients and often charge lower fees.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="text-center p-4 bg-white rounded border">
            <h4 className="font-semibold text-blue-600">Unlimited Visits</h4>
            <p className="text-sm text-muted-foreground mt-1">
              See your doctor as often as needed
            </p>
          </div>
          <div className="text-center p-4 bg-white rounded border">
            <h4 className="font-semibold text-blue-600">Lower Costs</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Often cheaper than traditional insurance
            </p>
          </div>
          <div className="text-center p-4 bg-white rounded border">
            <h4 className="font-semibold text-blue-600">More Time</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Longer appointments with your doctor
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
