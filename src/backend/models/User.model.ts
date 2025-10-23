import { db } from '../database/connection';
import { NotFoundError, ConflictError } from '../utils/errors';
import bcrypt from 'bcrypt';
import { config } from '../config/environment';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string | null;
  phoneNumber: string | null;
  dateOfBirth: Date | null;
  zipcode: string | null;
  phiEncrypted: boolean;
  consentDate: Date | null;
  privacyPolicyVersion: string | null;
  emailVerified: boolean;
  isActive: boolean;
  failedLoginAttempts: number;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateUserData {
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  zipcode?: string;
}

export interface UpdateUserData {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  zipcode?: string;
}

export class UserModel {
  static async create(data: CreateUserData): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, config.security.saltRounds);

    const query = `
      INSERT INTO users (
        email, password_hash, full_name, phone_number, date_of_birth, zipcode,
        consent_date, privacy_policy_version
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, '1.0')
      RETURNING *
    `;

    const values = [
      data.email.toLowerCase(),
      passwordHash,
      data.fullName || null,
      data.phoneNumber || null,
      data.dateOfBirth || null,
      data.zipcode || null,
    ];

    const result = await db.query<User>(query, values);
    return result.rows[0];
  }

  static async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL';
    const result = await db.query<User>(query, [id]);
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL';
    const result = await db.query<User>(query, [email.toLowerCase()]);
    return result.rows[0] || null;
  }

  static async update(id: string, data: UpdateUserData): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError('User');
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.fullName !== undefined) {
      updates.push(`full_name = $${paramCount++}`);
      values.push(data.fullName);
    }
    if (data.phoneNumber !== undefined) {
      updates.push(`phone_number = $${paramCount++}`);
      values.push(data.phoneNumber);
    }
    if (data.dateOfBirth !== undefined) {
      updates.push(`date_of_birth = $${paramCount++}`);
      values.push(data.dateOfBirth);
    }
    if (data.zipcode !== undefined) {
      updates.push(`zipcode = $${paramCount++}`);
      values.push(data.zipcode);
    }

    if (updates.length === 0) {
      return user;
    }

    values.push(id);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query<User>(query, values);
    return result.rows[0];
  }

  static async updatePassword(id: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, config.security.saltRounds);

    const query = `
      UPDATE users
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;

    await db.query(query, [passwordHash, id]);
  }

  static async verifyEmail(id: string): Promise<void> {
    const query = `
      UPDATE users
      SET email_verified = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await db.query(query, [id]);
  }

  static async incrementFailedLoginAttempts(id: string): Promise<number> {
    const query = `
      UPDATE users
      SET failed_login_attempts = failed_login_attempts + 1
      WHERE id = $1
      RETURNING failed_login_attempts
    `;

    const result = await db.query<{ failed_login_attempts: number }>(query, [id]);
    return result.rows[0].failed_login_attempts;
  }

  static async resetFailedLoginAttempts(id: string): Promise<void> {
    const query = `
      UPDATE users
      SET failed_login_attempts = 0, last_login = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await db.query(query, [id]);
  }

  static async softDelete(id: string): Promise<void> {
    const query = `
      UPDATE users
      SET deleted_at = CURRENT_TIMESTAMP, is_active = false
      WHERE id = $1
    `;

    await db.query(query, [id]);
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
