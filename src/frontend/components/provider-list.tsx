'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DPCProvider } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { MapPin, Phone, Globe, Users, CheckCircle, XCircle } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';
import { MinimalErrorFallback } from './ErrorFallback';

interface ProviderListProps {
  providers: DPCProvider[];
}

function ProviderListContent({ providers }: ProviderListProps) {
  if (providers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No providers found in your area</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try expanding your search radius or check back later
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        DPC Providers Near You ({providers.length})
      </h3>
      {providers.map((provider) => (
        <Card key={provider.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{provider.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" />
                  {provider.address}, {provider.city}, {provider.state} {provider.zipCode}
                  {provider.distance && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {provider.distance.toFixed(1)} miles away
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(provider.monthlyFee)}
                  <span className="text-sm text-muted-foreground">/mo</span>
                </p>
                {provider.familyMonthlyFee && (
                  <p className="text-sm text-muted-foreground">
                    Family: {formatCurrency(provider.familyMonthlyFee)}/mo
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                {provider.acceptingPatients ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Accepting Patients</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm text-red-600 font-medium">Not Accepting</span>
                  </>
                )}
              </div>
              {provider.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-medium">{provider.rating.toFixed(1)}</span>
                  {provider.reviewCount && (
                    <span className="text-xs text-muted-foreground">
                      ({provider.reviewCount} reviews)
                    </span>
                  )}
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Services Included:</p>
              <div className="flex flex-wrap gap-2">
                {provider.servicesIncluded.map((service, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {provider.phone && (
                <Button variant="outline" size="sm" className="gap-2">
                  <Phone className="h-4 w-4" />
                  {provider.phone}
                </Button>
              )}
              {provider.website && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => window.open(provider.website, '_blank')}
                >
                  <Globe className="h-4 w-4" />
                  Visit Website
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ProviderList({ providers }: ProviderListProps) {
  return (
    <ErrorBoundary level="feature" fallback={MinimalErrorFallback}>
      <ProviderListContent providers={providers} />
    </ErrorBoundary>
  );
}
