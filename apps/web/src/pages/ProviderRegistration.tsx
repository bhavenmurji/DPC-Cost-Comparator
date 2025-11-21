import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface ProviderRegistrationForm {
  // Account
  email: string
  password: string
  confirmPassword: string

  // Provider details
  providerName: string
  practiceName: string
  npi?: string

  // Location
  address: string
  city: string
  state: string
  zipCode: string

  // Contact
  phone: string
  website?: string

  // DPC Details
  monthlyFee: number
  familyFee?: number
  acceptingPatients: boolean

  // Agreement
  agreeToTerms: boolean
}

export default function ProviderRegistration() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<ProviderRegistrationForm>({
    email: '',
    password: '',
    confirmPassword: '',
    providerName: '',
    practiceName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    monthlyFee: 0,
    acceptingPatients: true,
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ProviderRegistrationForm, string>>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProviderRegistrationForm, string>> = {}

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required'
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.providerName.trim()) {
      newErrors.providerName = 'Provider name is required'
    }

    if (!formData.practiceName.trim()) {
      newErrors.practiceName = 'Practice name is required'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.state || formData.state.length !== 2) {
      newErrors.state = 'Valid state code is required'
    }

    if (!formData.zipCode || formData.zipCode.length !== 5) {
      newErrors.zipCode = 'Valid 5-digit ZIP code is required'
    }

    if (!formData.phone || !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Valid 10-digit phone number is required'
    }

    if (!formData.monthlyFee || formData.monthlyFee <= 0) {
      newErrors.monthlyFee = 'Monthly fee must be greater than 0'
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000'
      const response = await fetch(`${API_URL}/api/providers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.providerName,
          provider: {
            name: formData.providerName,
            practiceName: formData.practiceName,
            npi: formData.npi,
            address: formData.address,
            city: formData.city,
            state: formData.state.toUpperCase(),
            zipCode: formData.zipCode,
            phone: formData.phone.replace(/\D/g, ''),
            website: formData.website,
            monthlyFee: formData.monthlyFee,
            familyFee: formData.familyFee,
            acceptingPatients: formData.acceptingPatients,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Registration failed')
      }

      setSuccess(true)

      // Redirect to provider portal login after 2 seconds
      setTimeout(() => {
        navigate('/provider/login')
      }, 2000)
    } catch (err) {
      setErrors({
        email: err instanceof Error ? err.message : 'Registration failed. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof ProviderRegistrationForm, value: any) => {
    setFormData({ ...formData, [field]: value })
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined })
    }
  }

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>✅</div>
          <h2 style={styles.successTitle}>Registration Successful!</h2>
          <p style={styles.successText}>
            Thank you for registering your practice! We've sent a verification email to {formData.email}.
          </p>
          <p style={styles.successText}>
            Please verify your email to access your provider dashboard.
          </p>
          <p style={styles.redirectText}>Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Register Your DPC Practice</h1>
        <p style={styles.subtitle}>
          Join Ignite Health Partnerships and connect with patients searching for DPC care
        </p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Account Information */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Account Information</h2>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="provider@practice.com"
              style={errors.email ? { ...styles.input, ...styles.inputError } : styles.input}
              required
            />
            {errors.email && <span style={styles.error}>{errors.email}</span>}
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Minimum 8 characters"
                style={errors.password ? { ...styles.input, ...styles.inputError } : styles.input}
                required
              />
              {errors.password && <span style={styles.error}>{errors.password}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password *</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Re-enter password"
                style={errors.confirmPassword ? { ...styles.input, ...styles.inputError } : styles.input}
                required
              />
              {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
            </div>
          </div>
        </section>

        {/* Practice Information */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Practice Information</h2>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Provider Name *</label>
              <input
                type="text"
                value={formData.providerName}
                onChange={(e) => handleChange('providerName', e.target.value)}
                placeholder="Dr. Jane Smith"
                style={errors.providerName ? { ...styles.input, ...styles.inputError } : styles.input}
                required
              />
              {errors.providerName && <span style={styles.error}>{errors.providerName}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Practice Name *</label>
              <input
                type="text"
                value={formData.practiceName}
                onChange={(e) => handleChange('practiceName', e.target.value)}
                placeholder="Smith Family Medicine"
                style={errors.practiceName ? { ...styles.input, ...styles.inputError } : styles.input}
                required
              />
              {errors.practiceName && <span style={styles.error}>{errors.practiceName}</span>}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>NPI (Optional)</label>
            <input
              type="text"
              value={formData.npi || ''}
              onChange={(e) => handleChange('npi', e.target.value)}
              placeholder="1234567890"
              style={styles.input}
              maxLength={10}
            />
          </div>
        </section>

        {/* Location */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Practice Location</h2>

          <div style={styles.formGroup}>
            <label style={styles.label}>Street Address *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="123 Main St, Suite 100"
              style={errors.address ? { ...styles.input, ...styles.inputError } : styles.input}
              required
            />
            {errors.address && <span style={styles.error}>{errors.address}</span>}
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Los Angeles"
                style={errors.city ? { ...styles.input, ...styles.inputError } : styles.input}
                required
              />
              {errors.city && <span style={styles.error}>{errors.city}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>State *</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
                placeholder="CA"
                style={errors.state ? { ...styles.input, ...styles.inputError } : styles.input}
                maxLength={2}
                required
              />
              {errors.state && <span style={styles.error}>{errors.state}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>ZIP Code *</label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                placeholder="90210"
                style={errors.zipCode ? { ...styles.input, ...styles.inputError } : styles.input}
                maxLength={5}
                required
              />
              {errors.zipCode && <span style={styles.error}>{errors.zipCode}</span>}
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Contact Information</h2>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                style={errors.phone ? { ...styles.input, ...styles.inputError } : styles.input}
                required
              />
              {errors.phone && <span style={styles.error}>{errors.phone}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Website (Optional)</label>
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://www.yourpractice.com"
                style={styles.input}
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Membership Pricing</h2>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Individual Monthly Fee *</label>
              <div style={styles.inputPrefix}>
                <span style={styles.prefix}>$</span>
                <input
                  type="number"
                  value={formData.monthlyFee || ''}
                  onChange={(e) => handleChange('monthlyFee', parseFloat(e.target.value))}
                  placeholder="75"
                  style={errors.monthlyFee ? { ...styles.input, ...styles.inputError } : styles.input}
                  min="0"
                  step="1"
                  required
                />
              </div>
              {errors.monthlyFee && <span style={styles.error}>{errors.monthlyFee}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Family Monthly Fee (Optional)</label>
              <div style={styles.inputPrefix}>
                <span style={styles.prefix}>$</span>
                <input
                  type="number"
                  value={formData.familyFee || ''}
                  onChange={(e) => handleChange('familyFee', parseFloat(e.target.value) || undefined)}
                  placeholder="150"
                  style={styles.input}
                  min="0"
                  step="1"
                />
              </div>
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.acceptingPatients}
                onChange={(e) => handleChange('acceptingPatients', e.target.checked)}
                style={styles.checkbox}
              />
              Currently accepting new patients
            </label>
          </div>
        </section>

        {/* Terms Agreement */}
        <section style={styles.section}>
          <div style={styles.formGroup}>
            <label style={errors.agreeToTerms ? { ...styles.checkboxLabel, color: '#dc2626' } : styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
                style={styles.checkbox}
                required
              />
              I agree to the Terms of Service and Privacy Policy *
            </label>
            {errors.agreeToTerms && <span style={styles.error}>{errors.agreeToTerms}</span>}
          </div>
        </section>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={loading ? { ...styles.submitButton, ...styles.submitButtonDisabled } : styles.submitButton}
        >
          {loading ? 'Creating Account...' : 'Register Practice'}
        </button>

        <p style={styles.loginLink}>
          Already have an account? <a href="/provider/login" style={styles.link}>Login</a>
        </p>
      </form>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '2rem 1rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: '#6b7280',
  },
  form: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  section: {
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #e5e7eb',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '1rem',
  },
  formGroup: {
    marginBottom: '1rem',
    flex: 1,
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  inputPrefix: {
    position: 'relative',
  },
  prefix: {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1rem',
    color: '#6b7280',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    color: '#374151',
    cursor: 'pointer',
  },
  checkbox: {
    marginRight: '0.5rem',
    width: '1rem',
    height: '1rem',
    cursor: 'pointer',
  },
  error: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#dc2626',
    marginTop: '0.25rem',
  },
  submitButton: {
    width: '100%',
    padding: '1rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
  loginLink: {
    textAlign: 'center',
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '1rem',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '600',
  },
  successCard: {
    maxWidth: '600px',
    margin: '4rem auto',
    backgroundColor: '#fff',
    padding: '3rem 2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  successIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  successTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '1rem',
  },
  successText: {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '0.5rem',
    lineHeight: '1.6',
  },
  redirectText: {
    fontSize: '0.875rem',
    color: '#9ca3af',
    marginTop: '2rem',
    fontStyle: 'italic',
  },
}
