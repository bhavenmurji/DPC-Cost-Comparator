import { db } from '../database/connection';
import { NotFoundError } from '../utils/errors';

export interface InsurancePlan {
  id: string;
  carrierId: string;
  planName: string;
  planType: string;
  metalTier: string | null;
  monthlyPremium: number;
  annualDeductible: number;
  outOfPocketMax: number;
  copayPrimaryCare: number | null;
  copaySpecialist: number | null;
  copayEmergency: number | null;
  coinsurancePercentage: number | null;
  includesPrescription: boolean;
  includesDental: boolean;
  includesVision: boolean;
  networkSize: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsurancePlanWithCarrier extends InsurancePlan {
  carrierName: string;
  carrierPhone: string | null;
}

export interface InsurancePlanFilters {
  planType?: string;
  metalTier?: string;
  maxPremium?: number;
  maxDeductible?: number;
  carrierId?: string;
  includesPrescription?: boolean;
}

export class InsurancePlanModel {
  static async findById(id: string): Promise<InsurancePlan | null> {
    const query = 'SELECT * FROM insurance_plans WHERE id = $1 AND is_active = true';
    const result = await db.query<InsurancePlan>(query, [id]);
    return result.rows[0] || null;
  }

  static async findAll(filters?: InsurancePlanFilters, limit: number = 50, offset: number = 0): Promise<InsurancePlan[]> {
    let query = 'SELECT * FROM insurance_plans WHERE is_active = true';
    const values: any[] = [];
    let paramCount = 1;

    if (filters?.planType) {
      query += ` AND plan_type = $${paramCount++}`;
      values.push(filters.planType);
    }

    if (filters?.metalTier) {
      query += ` AND metal_tier = $${paramCount++}`;
      values.push(filters.metalTier);
    }

    if (filters?.maxPremium) {
      query += ` AND monthly_premium <= $${paramCount++}`;
      values.push(filters.maxPremium);
    }

    if (filters?.maxDeductible) {
      query += ` AND annual_deductible <= $${paramCount++}`;
      values.push(filters.maxDeductible);
    }

    if (filters?.carrierId) {
      query += ` AND carrier_id = $${paramCount++}`;
      values.push(filters.carrierId);
    }

    if (filters?.includesPrescription !== undefined) {
      query += ` AND includes_prescription = $${paramCount++}`;
      values.push(filters.includesPrescription);
    }

    query += ` ORDER BY monthly_premium ASC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    values.push(limit, offset);

    const result = await db.query<InsurancePlan>(query, values);
    return result.rows;
  }

  static async findWithCarrierInfo(id: string): Promise<InsurancePlanWithCarrier | null> {
    const query = `
      SELECT
        ip.*,
        ic.name as carrier_name,
        ic.customer_service_phone as carrier_phone
      FROM insurance_plans ip
      JOIN insurance_carriers ic ON ip.carrier_id = ic.id
      WHERE ip.id = $1 AND ip.is_active = true AND ic.is_active = true
    `;

    const result = await db.query<InsurancePlanWithCarrier>(query, [id]);
    return result.rows[0] || null;
  }

  static async search(searchTerm: string, limit: number = 20): Promise<InsurancePlanWithCarrier[]> {
    const query = `
      SELECT
        ip.*,
        ic.name as carrier_name,
        ic.customer_service_phone as carrier_phone
      FROM insurance_plans ip
      JOIN insurance_carriers ic ON ip.carrier_id = ic.id
      WHERE
        ip.is_active = true
        AND ic.is_active = true
        AND (
          ip.plan_name ILIKE $1
          OR ic.name ILIKE $1
        )
      ORDER BY ip.monthly_premium ASC
      LIMIT $2
    `;

    const result = await db.query<InsurancePlanWithCarrier>(query, [`%${searchTerm}%`, limit]);
    return result.rows;
  }

  static async getCarriers(): Promise<{ id: string; name: string; website: string | null }[]> {
    const query = `
      SELECT id, name, website
      FROM insurance_carriers
      WHERE is_active = true
      ORDER BY name ASC
    `;

    const result = await db.query(query);
    return result.rows;
  }
}
