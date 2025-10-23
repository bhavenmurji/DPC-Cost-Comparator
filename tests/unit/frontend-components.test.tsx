/**
 * Frontend Component Unit Tests
 * Tests React components with validation and user interactions
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ComparisonForm from '../../apps/web/src/components/ComparisonForm'
import ComparisonResults from '../../apps/web/src/components/ComparisonResults'

describe('ComparisonForm Component', () => {
  describe('Rendering', () => {
    it('should render all form fields', () => {
      const mockSubmit = vi.fn()
      render(<ComparisonForm onSubmit={mockSubmit} />)

      expect(screen.getByLabelText(/age/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/state/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/annual doctor visits/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/monthly prescriptions/i)).toBeInTheDocument()
    })

    it('should render all chronic condition checkboxes', () => {
      const mockSubmit = vi.fn()
      render(<ComparisonForm onSubmit={mockSubmit} />)

      expect(screen.getByLabelText(/diabetes/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/hypertension/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/asthma/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/arthritis/i)).toBeInTheDocument()
    })

    it('should render submit button', () => {
      const mockSubmit = vi.fn()
      render(<ComparisonForm onSubmit={mockSubmit} />)

      expect(screen.getByRole('button', { name: /compare costs/i })).toBeInTheDocument()
    })

    it('should show loading state', () => {
      const mockSubmit = vi.fn()
      render(<ComparisonForm onSubmit={mockSubmit} loading={true} />)

      expect(screen.getByRole('button', { name: /calculating/i })).toBeDisabled()
    })
  })

  describe('Form Validation', () => {
    it('should require age field', async () => {
      const mockSubmit = vi.fn()
      render(<ComparisonForm onSubmit={mockSubmit} />)

      const submitButton = screen.getByRole('button', { name: /compare costs/i })
      fireEvent.click(submitButton)

      // HTML5 validation should prevent submission
      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('should validate age range (18-100)', () => {
      const mockSubmit = vi.fn()
      render(<ComparisonForm onSubmit={mockSubmit} />)

      const ageInput = screen.getByLabelText(/age/i) as HTMLInputElement

      expect(ageInput.min).toBe('18')
      expect(ageInput.max).toBe('100')
    })

    it('should require ZIP code field', () => {
      const mockSubmit = vi.fn()
      render(<ComparisonForm onSubmit={mockSubmit} />)

      const zipInput = screen.getByLabelText(/zip code/i) as HTMLInputElement

      expect(zipInput.required).toBe(true)
    })

    it('should validate ZIP code format (5 digits)', () => {
      const mockSubmit = vi.fn()
      render(<ComparisonForm onSubmit={mockSubmit} />)

      const zipInput = screen.getByLabelText(/zip code/i) as HTMLInputElement

      expect(zipInput.pattern).toBe('[0-9]{5}')
    })

    it('should require state selection', () => {
      const mockSubmit = vi.fn()
      render(<ComparisonForm onSubmit={mockSubmit} />)

      const stateSelect = screen.getByLabelText(/state/i) as HTMLSelectElement

      expect(stateSelect.required).toBe(true)
    })
  })

  describe('User Interactions', () => {
    it('should update age input value', () => {
      const mockSubmit = vi.fn()
      render(<ComparisonForm onSubmit={mockSubmit} />)

      const ageInput = screen.getByLabelText(/age/i) as HTMLInputElement

      fireEvent.change(ageInput, { target: { value: '45' } })

      expect(ageInput.value).toBe('45')
    })

    it('should update ZIP code input value', () => {
      const mockSubmit = vi.fn()
      render(<ComparisonForm onSubmit={mockSubmit} />)

      const zipInput = screen.getByLabelText(/zip code/i) as HTMLInputElement

      fireEvent.change(zipInput, { target: { value: '90001' } })

      expect(zipInput.value).toBe('90001')
    })

    it('should update state selection', () => {
      const mockSubmit = vi.fn()
      render(<ComparisonForm onSubmit={mockSubmit} />)

      const stateSelect = screen.getByLabelText(/state/i) as HTMLSelectElement

      fireEvent.change(stateSelect, { target: { value: 'CA' } })

      expect(stateSelect.value).toBe('CA')
    })

    it('should toggle chronic condition checkboxes', () => {
      const mockSubmit = vi.fn()
      render(<ComparisonForm onSubmit={mockSubmit} />)

      const diabetesCheckbox = screen.getByLabelText(/diabetes/i) as HTMLInputElement

      expect(diabetesCheckbox.checked).toBe(false)

      fireEvent.click(diabetesCheckbox)

      expect(diabetesCheckbox.checked).toBe(true)

      fireEvent.click(diabetesCheckbox)

      expect(diabetesCheckbox.checked).toBe(false)
    })

    it('should allow selecting multiple chronic conditions', () => {
      const mockSubmit = vi.fn()
      render(<ComparisonForm onSubmit={mockSubmit} />)

      const diabetesCheckbox = screen.getByLabelText(/diabetes/i) as HTMLInputElement
      const hypertensionCheckbox = screen.getByLabelText(/hypertension/i) as HTMLInputElement

      fireEvent.click(diabetesCheckbox)
      fireEvent.click(hypertensionCheckbox)

      expect(diabetesCheckbox.checked).toBe(true)
      expect(hypertensionCheckbox.checked).toBe(true)
    })

    it('should submit form with valid data', async () => {
      const mockSubmit = vi.fn()
      render(<ComparisonForm onSubmit={mockSubmit} />)

      // Fill form
      fireEvent.change(screen.getByLabelText(/age/i), { target: { value: '35' } })
      fireEvent.change(screen.getByLabelText(/zip code/i), { target: { value: '90001' } })
      fireEvent.change(screen.getByLabelText(/state/i), { target: { value: 'CA' } })

      // Submit
      fireEvent.click(screen.getByRole('button', { name: /compare costs/i }))

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            age: 35,
            zipCode: '90001',
            state: 'CA',
          })
        )
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle minimum age value', () => {
      const mockSubmit = vi.fn()
      render(<ComparisonForm onSubmit={mockSubmit} />)

      const ageInput = screen.getByLabelText(/age/i) as HTMLInputElement

      fireEvent.change(ageInput, { target: { value: '18' } })

      expect(ageInput.value).toBe('18')
    })

    it('should handle maximum age value', () => {
      const mockSubmit = vi.fn()
      render(<ComparisonForm onSubmit={mockSubmit} />)

      const ageInput = screen.getByLabelText(/age/i) as HTMLInputElement

      fireEvent.change(ageInput, { target: { value: '100' } })

      expect(ageInput.value).toBe('100')
    })

    it('should handle zero doctor visits', () => {
      const mockSubmit = vi.fn()
      render(<ComparisonForm onSubmit={mockSubmit} />)

      const visitsInput = screen.getByLabelText(/annual doctor visits/i) as HTMLInputElement

      fireEvent.change(visitsInput, { target: { value: '0' } })

      expect(visitsInput.value).toBe('0')
    })

    it('should handle many doctor visits', () => {
      const mockSubmit = vi.fn()
      render(<ComparisonForm onSubmit={mockSubmit} />)

      const visitsInput = screen.getByLabelText(/annual doctor visits/i) as HTMLInputElement

      fireEvent.change(visitsInput, { target: { value: '50' } })

      expect(visitsInput.value).toBe('50')
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      const mockSubmit = vi.fn()
      render(<ComparisonForm onSubmit={mockSubmit} />)

      expect(screen.getByLabelText(/age/i)).toHaveAttribute('type', 'number')
      expect(screen.getByLabelText(/zip code/i)).toHaveAttribute('type', 'text')
      expect(screen.getByLabelText(/state/i)).toBeInTheDocument()
    })

    it('should have helpful hint text', () => {
      const mockSubmit = vi.fn()
      render(<ComparisonForm onSubmit={mockSubmit} />)

      expect(
        screen.getByText(/how many times do you visit a doctor per year/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/how many prescription medications do you take/i)
      ).toBeInTheDocument()
    })
  })
})

describe('ComparisonResults Component', () => {
  const mockResults = {
    traditionalTotalAnnual: 8000,
    dpcTotalAnnual: 6000,
    annualSavings: 2000,
    percentageSavings: 25,
    recommendedPlan: 'DPC_CATASTROPHIC' as const,
    breakdown: {
      traditional: {
        premiums: 4800,
        deductible: 1500,
        copays: 420,
        prescriptions: 1080,
        outOfPocket: 1500,
        total: 8000,
      },
      dpc: {
        premiums: 900,
        deductible: 8000,
        copays: 0,
        prescriptions: 540,
        outOfPocket: 540,
        total: 6000,
      },
    },
  }

  const mockProviders = [
    {
      provider: {
        name: 'Dr. Sarah Johnson',
        practiceName: 'Johnson Family Medicine DPC',
        city: 'Springfield',
        state: 'CA',
        monthlyFee: 75,
        rating: 4.8,
        phone: '555-0100',
        website: 'https://johnsonfamilydpc.com',
      },
      distanceMiles: 3.5,
      matchScore: 95,
      matchReasons: ['Very close to your location', 'Highly rated by patients'],
    },
  ]

  describe('Rendering', () => {
    it('should display savings summary', () => {
      render(<ComparisonResults results={mockResults} />)

      expect(screen.getByText(/you could save/i)).toBeInTheDocument()
      expect(screen.getByText(/\$2,000\/year/i)).toBeInTheDocument()
    })

    it('should display both plan comparisons', () => {
      render(<ComparisonResults results={mockResults} />)

      expect(screen.getByText(/traditional insurance/i)).toBeInTheDocument()
      expect(screen.getByText(/dpc \+ catastrophic/i)).toBeInTheDocument()
    })

    it('should display cost breakdowns', () => {
      render(<ComparisonResults results={mockResults} />)

      expect(screen.getByText(/monthly premium/i)).toBeInTheDocument()
      expect(screen.getByText(/annual deductible/i)).toBeInTheDocument()
      expect(screen.getByText(/copays/i)).toBeInTheDocument()
      expect(screen.getByText(/prescriptions/i)).toBeInTheDocument()
    })

    it('should display DPC benefits', () => {
      render(<ComparisonResults results={mockResults} />)

      expect(screen.getByText(/benefits of dpc/i)).toBeInTheDocument()
      expect(screen.getByText(/unlimited primary care visits/i)).toBeInTheDocument()
      expect(screen.getByText(/same-day or next-day appointments/i)).toBeInTheDocument()
    })

    it('should display provider matches', () => {
      render(<ComparisonResults results={mockResults} providers={mockProviders} />)

      expect(screen.getByText(/recommended dpc providers/i)).toBeInTheDocument()
      expect(screen.getByText(/dr\. sarah johnson/i)).toBeInTheDocument()
    })

    it('should display provider details', () => {
      render(<ComparisonResults results={mockResults} providers={mockProviders} />)

      expect(screen.getByText(/johnson family medicine dpc/i)).toBeInTheDocument()
      expect(screen.getByText(/3\.5 miles away/i)).toBeInTheDocument()
      expect(screen.getByText(/\$75\/month/i)).toBeInTheDocument()
      expect(screen.getByText(/95% match/i)).toBeInTheDocument()
    })
  })

  describe('Conditional Rendering', () => {
    it('should show green card when DPC saves money', () => {
      render(<ComparisonResults results={mockResults} />)

      expect(screen.getByText(/you could save/i)).toBeInTheDocument()
    })

    it('should show warning card when traditional is cheaper', () => {
      const expensiveDPCResults = {
        ...mockResults,
        annualSavings: -1000,
        percentageSavings: -12.5,
        recommendedPlan: 'TRADITIONAL' as const,
      }

      render(<ComparisonResults results={expensiveDPCResults} />)

      expect(screen.getByText(/higher cost/i)).toBeInTheDocument()
      expect(screen.getByText(/\$1,000\/year/i)).toBeInTheDocument()
    })

    it('should highlight recommended plan', () => {
      render(<ComparisonResults results={mockResults} />)

      expect(screen.getByText(/recommended/i)).toBeInTheDocument()
    })

    it('should not show providers section when no providers', () => {
      render(<ComparisonResults results={mockResults} />)

      expect(screen.queryByText(/recommended dpc providers/i)).not.toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    it('should format currency correctly', () => {
      render(<ComparisonResults results={mockResults} />)

      // Should format with commas
      expect(screen.getByText(/\$8,000/i)).toBeInTheDocument()
      expect(screen.getByText(/\$6,000/i)).toBeInTheDocument()
    })

    it('should display percentage savings', () => {
      render(<ComparisonResults results={mockResults} />)

      expect(screen.getByText(/25\.0%/i)).toBeInTheDocument()
    })

    it('should display provider ratings', () => {
      render(<ComparisonResults results={mockResults} providers={mockProviders} />)

      expect(screen.getByText(/4\.8/i)).toBeInTheDocument()
    })
  })

  describe('Interactive Elements', () => {
    it('should have clickable phone links', () => {
      render(<ComparisonResults results={mockResults} providers={mockProviders} />)

      const phoneLink = screen.getByText(/555-0100/i).closest('a')
      expect(phoneLink).toHaveAttribute('href', 'tel:555-0100')
    })

    it('should have clickable website links', () => {
      render(<ComparisonResults results={mockResults} providers={mockProviders} />)

      const websiteLink = screen.getByText(/visit website/i)
      expect(websiteLink).toHaveAttribute('href', 'https://johnsonfamilydpc.com')
      expect(websiteLink).toHaveAttribute('target', '_blank')
      expect(websiteLink).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero savings', () => {
      const zeroSavingsResults = {
        ...mockResults,
        annualSavings: 0,
        percentageSavings: 0,
      }

      render(<ComparisonResults results={zeroSavingsResults} />)

      expect(screen.getByText(/\$0\/year/i)).toBeInTheDocument()
    })

    it('should handle large savings amounts', () => {
      const largeSavingsResults = {
        ...mockResults,
        annualSavings: 15000,
        traditionalTotalAnnual: 25000,
      }

      render(<ComparisonResults results={largeSavingsResults} />)

      expect(screen.getByText(/\$15,000\/year/i)).toBeInTheDocument()
    })

    it('should handle providers without ratings', () => {
      const providersWithoutRating = [
        {
          ...mockProviders[0],
          provider: { ...mockProviders[0].provider, rating: undefined },
        },
      ]

      render(<ComparisonResults results={mockResults} providers={providersWithoutRating} />)

      // Should still render provider
      expect(screen.getByText(/dr\. sarah johnson/i)).toBeInTheDocument()
    })

    it('should handle providers without website', () => {
      const providersWithoutWebsite = [
        {
          ...mockProviders[0],
          provider: { ...mockProviders[0].provider, website: undefined },
        },
      ]

      render(<ComparisonResults results={mockResults} providers={providersWithoutWebsite} />)

      // Should not show website button
      expect(screen.queryByText(/visit website/i)).not.toBeInTheDocument()
    })
  })
})
