import { db } from '../database/connection';
import { NotFoundError } from '../utils/errors';

export interface DPCProvider {
  id: string;
  practiceName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  zipcode: string;
  latitude: number | null;
  longitude: number | null;
  phoneNumber: string;
  email: string | null;
  website: string | null;
  monthlyMembershipFee: number;
  familyMembershipFee: number | null;
  enrollmentFee: number | null;
  ageRestrictions: string | null;
  servicesIncluded: string[];
  prescriptionDiscountAvailable: boolean;
  labWorkIncluded: boolean;
  telehealthAvailable: boolean;
  numberOfPhysicians: number;
  acceptsNewPatients: boolean;
  patientPanelSize: number | null;
  isVerified: boolean;
  rating: number | null;
  reviewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DPCProviderFilters {
  state?: string;
  zipcode?: string;
  maxMembershipFee?: number;
  labWorkIncluded?: boolean;
  telehealthAvailable?: boolean;
  acceptsNewPatients?: boolean;
  minRating?: number;
}

export class DPCProviderModel {
  static async findById(id: string): Promise<DPCProvider | null> {
    const query = 'SELECT * FROM dpc_providers WHERE id = $1 AND is_active = true';
    const result = await db.query<DPCProvider>(query, [id]);
    return result.rows[0] || null;
  }

  static async findAll(
    filters?: DPCProviderFilters,
    limit: number = 50,
    offset: number = 0
  ): Promise<DPCProvider[]> {
    let query = 'SELECT * FROM dpc_providers WHERE is_active = true';
    const values: any[] = [];
    let paramCount = 1;

    if (filters?.state) {
      query += ` AND state = $${paramCount++}`;
      values.push(filters.state.toUpperCase());
    }

    if (filters?.zipcode) {
      query += ` AND zipcode = $${paramCount++}`;
      values.push(filters.zipcode);
    }

    if (filters?.maxMembershipFee) {
      query += ` AND monthly_membership_fee <= $${paramCount++}`;
      values.push(filters.maxMembershipFee);
    }

    if (filters?.labWorkIncluded !== undefined) {
      query += ` AND lab_work_included = $${paramCount++}`;
      values.push(filters.labWorkIncluded);
    }

    if (filters?.telehealthAvailable !== undefined) {
      query += ` AND telehealth_available = $${paramCount++}`;
      values.push(filters.telehealthAvailable);
    }

    if (filters?.acceptsNewPatients !== undefined) {
      query += ` AND accepts_new_patients = $${paramCount++}`;
      values.push(filters.acceptsNewPatients);
    }

    if (filters?.minRating) {
      query += ` AND rating >= $${paramCount++}`;
      values.push(filters.minRating);
    }

    query += ` ORDER BY monthly_membership_fee ASC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    values.push(limit, offset);

    const result = await db.query<DPCProvider>(query, values);
    return result.rows;
  }

  static async search(searchTerm: string, limit: number = 20): Promise<DPCProvider[]> {
    const query = `
      SELECT *
      FROM dpc_providers
      WHERE
        is_active = true
        AND (
          practice_name ILIKE $1
          OR city ILIKE $1
          OR state ILIKE $1
          OR zipcode ILIKE $1
        )
      ORDER BY rating DESC NULLS LAST, monthly_membership_fee ASC
      LIMIT $2
    `;

    const result = await db.query<DPCProvider>(query, [`%${searchTerm}%`, limit]);
    return result.rows;
  }

  static async findByLocation(
    latitude: number,
    longitude: number,
    radiusMiles: number = 25,
    limit: number = 20
  ): Promise<DPCProvider[]> {
    // Using Haversine formula for distance calculation
    const query = `
      SELECT *,
        (
          3959 * acos(
            cos(radians($1)) *
            cos(radians(latitude)) *
            cos(radians(longitude) - radians($2)) +
            sin(radians($1)) *
            sin(radians(latitude))
          )
        ) AS distance_miles
      FROM dpc_providers
      WHERE
        is_active = true
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND (
          3959 * acos(
            cos(radians($1)) *
            cos(radians(latitude)) *
            cos(radians(longitude) - radians($2)) +
            sin(radians($1)) *
            sin(radians(latitude))
          )
        ) <= $3
      ORDER BY distance_miles ASC, rating DESC NULLS LAST
      LIMIT $4
    `;

    const result = await db.query<DPCProvider>(
      query,
      [latitude, longitude, radiusMiles, limit]
    );
    return result.rows;
  }

  static async getReviews(providerId: string, limit: number = 10, offset: number = 0) {
    const query = `
      SELECT
        id,
        rating,
        review_text,
        is_verified_patient,
        created_at
      FROM dpc_provider_reviews
      WHERE provider_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await db.query(query, [providerId, limit, offset]);
    return result.rows;
  }

  static async getAverageRating(providerId: string): Promise<{ avgRating: number; totalReviews: number }> {
    const query = `
      SELECT
        ROUND(AVG(rating), 2) as avg_rating,
        COUNT(*) as total_reviews
      FROM dpc_provider_reviews
      WHERE provider_id = $1
    `;

    const result = await db.query(query, [providerId]);
    return {
      avgRating: parseFloat(result.rows[0].avg_rating) || 0,
      totalReviews: parseInt(result.rows[0].total_reviews) || 0,
    };
  }
}
