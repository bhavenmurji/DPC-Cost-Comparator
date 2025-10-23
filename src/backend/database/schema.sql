-- DPC Cost Comparator Database Schema
-- PostgreSQL 14+
-- HIPAA-compliant design with encryption and audit trails

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================
-- USERS AND AUTHENTICATION
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone_number VARCHAR(20),
    date_of_birth DATE,
    zipcode VARCHAR(10),

    -- HIPAA Compliance
    phi_encrypted BOOLEAN DEFAULT true,
    consent_date TIMESTAMP WITH TIME ZONE,
    privacy_policy_version VARCHAR(20),

    -- Account status
    email_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    failed_login_attempts INTEGER DEFAULT 0,
    last_login TIMESTAMP WITH TIME ZONE,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INSURANCE PLANS
-- ============================================

CREATE TABLE insurance_carriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    website VARCHAR(500),
    customer_service_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE insurance_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    carrier_id UUID REFERENCES insurance_carriers(id) ON DELETE CASCADE,
    plan_name VARCHAR(255) NOT NULL,
    plan_type VARCHAR(50) NOT NULL, -- PPO, HMO, EPO, POS
    metal_tier VARCHAR(20), -- Bronze, Silver, Gold, Platinum

    -- Costs
    monthly_premium DECIMAL(10, 2) NOT NULL,
    annual_deductible DECIMAL(10, 2) NOT NULL,
    out_of_pocket_max DECIMAL(10, 2) NOT NULL,
    copay_primary_care DECIMAL(10, 2),
    copay_specialist DECIMAL(10, 2),
    copay_emergency DECIMAL(10, 2),
    coinsurance_percentage INTEGER, -- 0-100

    -- Coverage details
    includes_prescription BOOLEAN DEFAULT true,
    includes_dental BOOLEAN DEFAULT false,
    includes_vision BOOLEAN DEFAULT false,
    network_size VARCHAR(20), -- Small, Medium, Large, National

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_premium CHECK (monthly_premium >= 0),
    CONSTRAINT valid_deductible CHECK (annual_deductible >= 0),
    CONSTRAINT valid_oop_max CHECK (out_of_pocket_max >= annual_deductible),
    CONSTRAINT valid_coinsurance CHECK (coinsurance_percentage BETWEEN 0 AND 100)
);

CREATE TABLE user_insurance_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES insurance_plans(id) ON DELETE CASCADE,
    policy_number VARCHAR(100) ENCRYPTED, -- Encrypted PHI
    group_number VARCHAR(100),
    coverage_start_date DATE NOT NULL,
    coverage_end_date DATE,
    is_primary BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_coverage_dates CHECK (coverage_end_date IS NULL OR coverage_end_date > coverage_start_date)
);

-- ============================================
-- DPC PROVIDERS
-- ============================================

CREATE TABLE dpc_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    practice_name VARCHAR(255) NOT NULL,

    -- Location
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zipcode VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Contact
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    website VARCHAR(500),

    -- DPC Details
    monthly_membership_fee DECIMAL(10, 2) NOT NULL,
    family_membership_fee DECIMAL(10, 2),
    enrollment_fee DECIMAL(10, 2) DEFAULT 0,
    age_restrictions VARCHAR(100), -- e.g., "18+", "All ages", "Adults only"

    -- Services
    services_included TEXT[], -- Array of included services
    prescription_discount_available BOOLEAN DEFAULT false,
    lab_work_included BOOLEAN DEFAULT false,
    telehealth_available BOOLEAN DEFAULT true,

    -- Provider info
    number_of_physicians INTEGER DEFAULT 1,
    accepts_new_patients BOOLEAN DEFAULT true,
    patient_panel_size INTEGER,

    -- Metadata
    is_verified BOOLEAN DEFAULT false,
    rating DECIMAL(3, 2), -- 0.00 to 5.00
    review_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_membership_fee CHECK (monthly_membership_fee >= 0),
    CONSTRAINT valid_rating CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5))
);

-- Full-text search index for providers
CREATE INDEX idx_dpc_providers_search ON dpc_providers
    USING gin(to_tsvector('english', practice_name || ' ' || COALESCE(city, '') || ' ' || COALESCE(state, '')));

CREATE TABLE dpc_provider_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES dpc_providers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL,
    review_text TEXT,
    is_verified_patient BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_rating CHECK (rating BETWEEN 1 AND 5)
);

-- ============================================
-- COST COMPARISONS
-- ============================================

CREATE TABLE cost_comparison_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scenario_name VARCHAR(255) NOT NULL,

    -- Health profile
    age INTEGER NOT NULL,
    has_chronic_conditions BOOLEAN DEFAULT false,
    chronic_conditions TEXT[], -- Array of conditions
    estimated_annual_visits INTEGER DEFAULT 4,
    estimated_specialist_visits INTEGER DEFAULT 2,
    estimated_prescriptions INTEGER DEFAULT 0,
    estimated_lab_work INTEGER DEFAULT 2,

    -- Selected options
    insurance_plan_id UUID REFERENCES insurance_plans(id) ON DELETE SET NULL,
    dpc_provider_id UUID REFERENCES dpc_providers(id) ON DELETE SET NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_age CHECK (age BETWEEN 0 AND 120),
    CONSTRAINT valid_visits CHECK (estimated_annual_visits >= 0)
);

CREATE TABLE cost_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID NOT NULL REFERENCES cost_comparison_scenarios(id) ON DELETE CASCADE,
    calculation_type VARCHAR(50) NOT NULL, -- 'insurance_only', 'dpc_only', 'insurance_plus_dpc'

    -- Calculated costs
    total_annual_cost DECIMAL(10, 2) NOT NULL,
    monthly_premium DECIMAL(10, 2) DEFAULT 0,
    out_of_pocket_costs DECIMAL(10, 2) DEFAULT 0,
    dpc_membership_cost DECIMAL(10, 2) DEFAULT 0,
    estimated_savings DECIMAL(10, 2),

    -- Breakdown
    cost_breakdown JSONB NOT NULL, -- Detailed cost breakdown

    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_cost CHECK (total_annual_cost >= 0)
);

-- ============================================
-- AUDIT LOGS (HIPAA Requirement)
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, etc.
    resource_type VARCHAR(100) NOT NULL, -- users, insurance_plans, dpc_providers, etc.
    resource_id UUID,

    -- Details
    ip_address INET,
    user_agent TEXT,
    request_method VARCHAR(10),
    request_path VARCHAR(500),
    response_status INTEGER,

    -- Changes (for UPDATE actions)
    old_values JSONB,
    new_values JSONB,

    -- PHI access tracking
    phi_accessed BOOLEAN DEFAULT false,
    access_reason TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Retention: Keep for 6 years (HIPAA requirement)
    retention_until TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '6 years')
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- Sessions
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Insurance
CREATE INDEX idx_insurance_plans_carrier_id ON insurance_plans(carrier_id);
CREATE INDEX idx_insurance_plans_is_active ON insurance_plans(is_active);
CREATE INDEX idx_user_insurance_plans_user_id ON user_insurance_plans(user_id);

-- DPC Providers
CREATE INDEX idx_dpc_providers_zipcode ON dpc_providers(zipcode);
CREATE INDEX idx_dpc_providers_state ON dpc_providers(state);
CREATE INDEX idx_dpc_providers_location ON dpc_providers USING gist(ll_to_earth(latitude, longitude));
CREATE INDEX idx_dpc_providers_is_active ON dpc_providers(is_active);

-- Cost Comparisons
CREATE INDEX idx_cost_comparison_scenarios_user_id ON cost_comparison_scenarios(user_id);
CREATE INDEX idx_cost_calculations_scenario_id ON cost_calculations(scenario_id);

-- Audit Logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_retention ON audit_logs(retention_until);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_plans_updated_at BEFORE UPDATE ON insurance_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dpc_providers_updated_at BEFORE UPDATE ON dpc_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cost_comparison_scenarios_updated_at BEFORE UPDATE ON cost_comparison_scenarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Active insurance plans with carrier info
CREATE VIEW active_insurance_plans_with_carriers AS
SELECT
    ip.*,
    ic.name as carrier_name,
    ic.customer_service_phone as carrier_phone
FROM insurance_plans ip
JOIN insurance_carriers ic ON ip.carrier_id = ic.id
WHERE ip.is_active = true AND ic.is_active = true;

-- Active DPC providers with ratings
CREATE VIEW active_dpc_providers_with_ratings AS
SELECT
    dp.*,
    ROUND(AVG(dpr.rating), 2) as avg_rating,
    COUNT(dpr.id) as total_reviews
FROM dpc_providers dp
LEFT JOIN dpc_provider_reviews dpr ON dp.id = dpr.provider_id
WHERE dp.is_active = true
GROUP BY dp.id;

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert sample insurance carrier
INSERT INTO insurance_carriers (name, website, customer_service_phone) VALUES
('Blue Cross Blue Shield', 'https://www.bcbs.com', '1-800-555-0100'),
('UnitedHealthcare', 'https://www.uhc.com', '1-800-555-0200'),
('Aetna', 'https://www.aetna.com', '1-800-555-0300');

-- Insert sample insurance plans
INSERT INTO insurance_plans (carrier_id, plan_name, plan_type, metal_tier, monthly_premium, annual_deductible, out_of_pocket_max, copay_primary_care, copay_specialist, coinsurance_percentage)
SELECT
    id,
    'Standard PPO Plan',
    'PPO',
    'Silver',
    450.00,
    3000.00,
    8000.00,
    30.00,
    60.00,
    20
FROM insurance_carriers WHERE name = 'Blue Cross Blue Shield' LIMIT 1;

-- Insert sample DPC provider
INSERT INTO dpc_providers (practice_name, address_line1, city, state, zipcode, phone_number, email, monthly_membership_fee, services_included, lab_work_included)
VALUES (
    'HealthFirst Direct Primary Care',
    '123 Main Street',
    'Austin',
    'TX',
    '78701',
    '512-555-0100',
    'info@healthfirstdpc.com',
    75.00,
    ARRAY['Annual physical', 'Unlimited visits', 'Care coordination', 'Chronic disease management'],
    true
);

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO dpc_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO dpc_app_user;
