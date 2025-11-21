import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Checkbox } from './ui/checkbox'
import PrescriptionPricing from './PrescriptionPricing'
import LabTestPricing from './LabTestPricing'

interface ComparisonFormData {
  age: number
  zipCode: string
  state: string
  chronicConditions: string[]
  annualDoctorVisits: number
  prescriptionCount: number
  prescriptionCosts?: number
  labTestCosts?: number
}

interface ComparisonFormProps {
  onSubmit: (data: ComparisonFormData) => void
  loading?: boolean
}

export default function ComparisonForm({ onSubmit, loading = false }: ComparisonFormProps) {
  const [formData, setFormData] = useState<ComparisonFormData>({
    age: 35,
    zipCode: '',
    state: '',
    chronicConditions: [],
    annualDoctorVisits: 4,
    prescriptionCount: 0,
    prescriptionCosts: 0,
    labTestCosts: 0,
  })

  const [showAdvancedPricing, setShowAdvancedPricing] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleConditionToggle = (condition: string) => {
    setFormData((prev) => ({
      ...prev,
      chronicConditions: prev.chronicConditions.includes(condition)
        ? prev.chronicConditions.filter((c) => c !== condition)
        : [...prev.chronicConditions, condition],
    }))
  }

  const commonConditions = [
    'Diabetes',
    'Hypertension',
    'Asthma',
    'Arthritis',
    'High Cholesterol',
    'Depression/Anxiety',
  ]

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  ]

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">DPC Cost Comparison Calculator</CardTitle>
          <CardDescription>
            Compare the costs of traditional insurance vs. Direct Primary Care + Catastrophic coverage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Personal Information</h3>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="18"
                max="100"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  type="text"
                  pattern="[0-9]{5}"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  placeholder="12345"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => setFormData({ ...formData, state: value })}
                >
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Health Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Health Information</h3>

            <div className="space-y-2">
              <Label htmlFor="doctorVisits">Annual Doctor Visits</Label>
              <Input
                id="doctorVisits"
                type="number"
                min="0"
                max="50"
                value={formData.annualDoctorVisits}
                onChange={(e) =>
                  setFormData({ ...formData, annualDoctorVisits: parseInt(e.target.value) })
                }
              />
              <p className="text-sm text-muted-foreground">
                How many times do you visit a doctor per year?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prescriptions">Monthly Prescriptions</Label>
              <Input
                id="prescriptions"
                type="number"
                min="0"
                max="20"
                value={formData.prescriptionCount}
                onChange={(e) =>
                  setFormData({ ...formData, prescriptionCount: parseInt(e.target.value) })
                }
              />
              <p className="text-sm text-muted-foreground">
                How many prescription medications do you take regularly?
              </p>
            </div>

            <div className="space-y-3">
              <Label>Chronic Conditions (select all that apply)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {commonConditions.map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition}
                      checked={formData.chronicConditions.includes(condition)}
                      onCheckedChange={() => handleConditionToggle(condition)}
                    />
                    <label
                      htmlFor={condition}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {condition}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Cost Analysis */}
          {formData.zipCode && formData.zipCode.length === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Detailed Cost Analysis (Optional)</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedPricing(!showAdvancedPricing)}
                >
                  {showAdvancedPricing ? '− Hide' : '+ Show'} Detailed Pricing
                </Button>
              </div>

              {showAdvancedPricing && (
                <div className="space-y-4">
                  <PrescriptionPricing
                    zipCode={formData.zipCode}
                    onPricesUpdate={(cost) => setFormData({ ...formData, prescriptionCosts: cost })}
                  />
                  <LabTestPricing
                    zipCode={formData.zipCode}
                    onPricesUpdate={(cost) => setFormData({ ...formData, labTestCosts: cost })}
                  />
                </div>
              )}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? 'Calculating...' : 'Compare Costs'}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
