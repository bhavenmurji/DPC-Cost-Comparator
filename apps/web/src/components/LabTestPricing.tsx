import { useState, useEffect } from 'react'
import { pricingService, LabTestComparison } from '../services/pricingService'

interface LabTestPricingProps {
  zipCode: string
  onPricesUpdate?: (totalCost: number) => void
}

export default function LabTestPricing({ zipCode, onPricesUpdate }: LabTestPricingProps) {
  const [labTests, setLabTests] = useState<string[]>([''])
  const [comparisons, setComparisons] = useState<LabTestComparison[]>([])
  const [, setLoading] = useState(false)
  const [commonTests, setCommonTests] = useState<string[]>([])

  useEffect(() => {
    loadCommonLabTests()
  }, [])

  useEffect(() => {
    const totalCost = comparisons.reduce((sum, comp) => sum + comp.lowestPrice, 0)
    onPricesUpdate?.(totalCost)
  }, [comparisons, onPricesUpdate])

  const loadCommonLabTests = async () => {
    try {
      const tests = await pricingService.getCommonLabTests()
      setCommonTests(tests)
    } catch (err) {
      console.error('Failed to load common lab tests:', err)
    }
  }

  const addLabTest = () => {
    setLabTests([...labTests, ''])
  }

  const removeLabTest = (index: number) => {
    setLabTests(labTests.filter((_, i) => i !== index))
    setComparisons(comparisons.filter((_, i) => i !== index))
  }

  const updateLabTest = (index: number, value: string) => {
    const updated = [...labTests]
    updated[index] = value
    setLabTests(updated)
  }

  const searchPrices = async (testName: string, index: number) => {
    if (!testName.trim()) return

    setLoading(true)
    try {
      const comparison = await pricingService.compareLabTestPrices(testName, zipCode)
      const updated = [...comparisons]
      updated[index] = comparison
      setComparisons(updated)
    } catch (err) {
      console.error('Failed to fetch lab test prices:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalAnnualCost = comparisons.reduce((sum, comp) => sum + comp.lowestPrice, 0)
  const totalPotentialSavings = comparisons.reduce((sum, comp) => sum + comp.potentialSavings, 0)

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Lab Tests</h3>
      <p style={styles.description}>
        Add common lab tests to estimate annual costs and compare providers
      </p>

      <div style={styles.testsList}>
        {labTests.map((test, index) => (
          <div key={index} style={styles.testRow}>
            <div style={styles.inputGroup}>
              <input
                type="text"
                value={test}
                onChange={(e) => updateLabTest(index, e.target.value)}
                onBlur={() => test && searchPrices(test, index)}
                placeholder="Enter lab test name"
                list={`labtest-suggestions-${index}`}
                style={styles.input}
              />
              <datalist id={`labtest-suggestions-${index}`}>
                {commonTests.map((commonTest) => (
                  <option key={commonTest} value={commonTest} />
                ))}
              </datalist>

              {labTests.length > 1 && (
                <button onClick={() => removeLabTest(index)} style={styles.removeButton}>
                  ✕
                </button>
              )}
            </div>

            {comparisons[index] && (
              <div style={styles.comparisonCard}>
                <div style={styles.comparisonHeader}>
                  <span style={styles.testName}>{comparisons[index].testName}</span>
                  <span style={styles.lowestPrice}>
                    Lowest: ${comparisons[index].lowestPrice.toFixed(2)}
                  </span>
                </div>

                <div style={styles.pricesList}>
                  {comparisons[index].prices.map((price, i) => (
                    <div key={i} style={styles.priceItem}>
                      <span>{price.provider}</span>
                      <div style={styles.priceDetails}>
                        <span style={styles.price}>${price.withoutInsurance.toFixed(2)}</span>
                        {price.withInsurance && (
                          <span style={styles.withInsurance}>
                            (${price.withInsurance.toFixed(2)} with insurance)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {comparisons[index].potentialSavings > 0 && (
                  <div style={styles.savingsBanner}>
                    Save ${comparisons[index].potentialSavings.toFixed(2)} vs average
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={addLabTest} style={styles.addButton}>
        + Add Another Lab Test
      </button>

      {comparisons.length > 0 && (
        <div style={styles.summary}>
          <div style={styles.summaryRow}>
            <span>Estimated Annual Lab Cost:</span>
            <span style={styles.totalCost}>${totalAnnualCost.toFixed(2)}</span>
          </div>
          {totalPotentialSavings > 0 && (
            <div style={styles.summaryRow}>
              <span>Potential Savings:</span>
              <span style={styles.savings}>${totalPotentialSavings.toFixed(2)}</span>
            </div>
          )}
          <div style={styles.note}>
            Note: DPC practices often include basic lab work in monthly membership fees
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '1.5rem',
    backgroundColor: '#f0f9ff',
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
  testsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1rem',
  },
  testRow: {
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
    border: '1px solid #bfdbfe',
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
    border: '1px solid #bfdbfe',
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
  testName: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  lowestPrice: {
    color: '#2563eb',
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
  priceDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.25rem',
  },
  price: {
    fontWeight: '500',
  },
  withInsurance: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  savingsBanner: {
    marginTop: '0.75rem',
    padding: '0.5rem',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
    textAlign: 'center',
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#fff',
    border: '1px solid #bfdbfe',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#1e40af',
    width: '100%',
  },
  summary: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#fff',
    border: '2px solid #2563eb',
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
    color: '#2563eb',
    fontWeight: '500',
    backgroundColor: '#dbeafe',
    padding: '0.25rem 0.5rem',
    borderRadius: '3px',
  },
  note: {
    marginTop: '0.75rem',
    fontSize: '0.75rem',
    color: '#6b7280',
    fontStyle: 'italic',
    padding: '0.5rem',
    backgroundColor: '#f3f4f6',
    borderRadius: '4px',
  },
}
