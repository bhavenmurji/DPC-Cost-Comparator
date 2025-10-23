import { ComparisonRequest, ComparisonResponse, DPCProvider } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(response.status, error.message || 'An error occurred');
  }

  return response.json();
}

export const api = {
  // Health check
  health: () => fetchAPI<{ status: string; timestamp: string }>('/health'),

  // Cost comparison
  compare: (data: ComparisonRequest) =>
    fetchAPI<ComparisonResponse>('/api/compare', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Provider search
  searchProviders: (zipCode: string, radius: number = 25) =>
    fetchAPI<DPCProvider[]>(`/api/providers/search?zipCode=${zipCode}&radius=${radius}`),

  // Get provider by ID
  getProvider: (id: string) =>
    fetchAPI<DPCProvider>(`/api/providers/${id}`),

  // Get insurance plan estimates
  getPlanEstimates: (zipCode: string, age: number, familySize: number) =>
    fetchAPI<{ catastrophic: any; traditional: any }>('/api/plans/estimates', {
      method: 'POST',
      body: JSON.stringify({ zipCode, age, familySize }),
    }),
};

export default api;
