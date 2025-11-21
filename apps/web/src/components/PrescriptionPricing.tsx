import { useState, useEffect } from 'react'
import { pricingService, PrescriptionComparison } from '../services/pricingService'

interface PrescriptionPricingProps {
  zipCode: string
  onPricesUpdate?: (totalMonthlyCost: number) => void
}

export default function PrescriptionPricing({ zipCode, onPricesUpdate }: PrescriptionPricingProps) {
  const [medications, setMedications] = useState<string[]>([''])
  const [comparisons, setComparisons] = useState<PrescriptionComparison[]>([])
  const [, setLoading] = useState(false)
  const [commonMeds, setCommonMeds] = useState<string[]>([])

  useEffect(() => {
    loadCommonMedications()
  }, [])

  useEffect(() => {
    const totalCost = comparisons.reduce((sum, comp) => sum + comp.lowestPrice, 0)
    onPricesUpdate?.(totalCost)
  }, [comparisons, onPricesUpdate])

  const loadCommonMedications = async () => {
    try {
      const meds = await pricingService.getCommonPrescriptions()
      setCommonMeds(meds)
    } catch (err) {
      console.error('Failed to load common medications:', err)
    }
  }

  const addMedication = () => {
    setMedications([...medications, ''])
  }

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
    setComparisons(comparisons.filter((_, i) => i !== index))
  }

  const updateMedication = (index: number, value: string) => {
    const updated = [...medications]
    updated[index] = value
    setMedications(updated)
  }

  const searchPrices = async (medName: string, index: number) => {
    if (!medName.trim()) return

    setLoading(true)
    try {
      const comparison = await pricingService.comparePrescriptionPrices(medName, zipCode)
      const updated = [...comparisons]
      updated[index] = comparison
      setComparisons(updated)
    } catch (err) {
      console.error('Failed to fetch prescription prices:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalMonthlyCost = comparisons.reduce((sum, comp) => sum + comp.lowestPrice, 0)
  const totalPotentialSavings = comparisons.reduce((sum, comp) => sum + comp.potentialSavings, 0)

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Prescription Medications</h3>
      <p style={styles.description}>
        Add your medications to compare prices across pharmacies and find the best deals
      </p>

      <div style={styles.medicationsList}>
        {medications.map((med, index) => (
          <div key={index} style={styles.medicationRow}>
            <div style={styles.inputGroup}>
              <input
                type="text"
                value={med}
                onChange={(e) => updateMedication(index, e.target.value)}
                onBlur={() => med && searchPrices(med, index)}
                placeholder="Enter medication name"
                list={`medication-suggestions-${index}`}
                style={styles.input}
              />
              <datalist id={`medication-suggestions-${index}`}>
                {commonMeds.map((commonMed) => (
                  <option key={commonMed} value={commonMed} />
                ))}
              </datalist>

              {medications.length > 1 && (
                <button onClick={() => removeMedication(index)} style={styles.removeButton}>
                  ✕
                </button>
              )}
            </div>

            {comparisons[index] && (
              <div style={styles.comparisonCard}>
                <div style={styles.comparisonHeader}>
                  <span style={styles.medName}>{comparisons[index].medication}</span>
                  <span style={styles.lowestPrice}>
                    Lowest: ${comparisons[index].lowestPrice.toFixed(2)}/mo
                  </span>
                </div>

                <div style={styles.pricesList}>
                  {comparisons[index].prices.slice(0, 3).map((price, i) => (
                    <div key={i} style={styles.priceItem}>
                      <span>{price.pharmacy}</span>
                      <div>
                        <span style={styles.price}>${price.price.toFixed(2)}</span>
                        {price.savingsProgram && (
                          <span style={styles.savings}>{price.savingsProgram}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {comparisons[index].potentialSavings > 0 && (
                  <div style={styles.savingsBanner}>
                    Save ${comparisons[index].potentialSavings.toFixed(2)}/mo vs average
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={addMedication} style={styles.addButton}>
        + Add Another Medication
      </button>

      {comparisons.length > 0 && (
        <div style={styles.summary}>
          <div style={styles.summaryRow}>
            <span>Total Monthly Cost (lowest prices):</span>
            <span style={styles.totalCost}>${totalMonthlyCost.toFixed(2)}</span>
          </div>
          {totalPotentialSavings > 0 && (
            <div style={styles.summaryRow}>
              <span>Potential Monthly Savings:</span>
              <span style={styles.savings}>${totalPotentialSavings.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '1.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#1a1a1a',
  },
  description: {
    fontSize: '0.875rem',
    color: '#666',
    marginBottom: '1.5rem',
  },
  medicationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1rem',
  },
  medicationRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  inputGroup: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
  },
  removeButton: {
    width: '36px',
    height: '36px',
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    color: '#dc2626',
    cursor: 'pointer',
    fontSize: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparisonCard: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '1rem',
  },
  comparisonHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #e5e7eb',
  },
  medName: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  lowestPrice: {
    color: '#10b981',
    fontWeight: '600',
  },
  pricesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  priceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.875rem',
    padding: '0.5rem 0',
  },
  price: {
    fontWeight: '500',
    marginRight: '0.5rem',
  },
  savingsBanner: {
    marginTop: '0.75rem',
    padding: '0.5rem',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
    textAlign: 'center',
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    width: '100%',
  },
  summary: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#fff',
    border: '2px solid #10b981',
    borderRadius: '6px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    fontSize: '0.9rem',
  },
  totalCost: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  savings: {
    fontSize: '0.75rem',
    color: '#10b981',
    fontWeight: '500',
    backgroundColor: '#d1fae5',
    padding: '0.25rem 0.5rem',
    borderRadius: '3px',
  },
}
