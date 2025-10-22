import sql from 'mssql';
import { getPool } from '../config/database';
import { RefreshToken } from '../api/auth/auth.dto';

export class RefreshTokenModel {
  static async create(tokenData: Omit<RefreshToken, 'id' | 'createdAt'>): Promise<RefreshToken> {
    const pool = getPool();
    const request = pool.request();

    // Optional: delete old tokens for single-session users
    await pool.request()
        .input('userId', sql.Int, tokenData.userId)
        .query(`DELETE FROM RefreshTokens WHERE userId = @userId`);

    const result = await request
      .input('token', sql.VarChar(500), tokenData.token)
      .input('userId', sql.Int, tokenData.userId)
      .input('expiresAt', sql.DateTime, tokenData.expiresAt)
      .input('isRevoked', sql.Bit, tokenData.isRevoked)
      .query(`
        INSERT INTO RefreshTokens (token, userId, expiresAt, isRevoked, createdAt)
        OUTPUT INSERTED.*
        VALUES (@token, @userId, @expiresAt, @isRevoked, GETDATE())
      `);
    
    return result.recordset[0];
  }


  static async findByToken(token: string): Promise<RefreshToken | null> {
    const pool = getPool();
    const request = pool.request();
    
    const result = await request
      .input('token', sql.VarChar(500), token)
      .query(`
        SELECT * FROM RefreshTokens 
        WHERE token = @token AND isRevoked = 0 AND expiresAt > GETDATE()
      `);
    
    return result.recordset[0] || null;
  }

  static async revokeByUserId(userId: number): Promise<void> {
    const pool = getPool();
    const request = pool.request();
    
    await request
      .input('userId', sql.Int, userId)
      .query(`
        UPDATE RefreshTokens 
        SET isRevoked = 1 
        WHERE userId = @userId AND isRevoked = 0
      `);
  }

  static async revokeByToken(token: string): Promise<void> {
    const pool = getPool();
    const request = pool.request();
    
    await request
      .input('token', sql.VarChar(500), token)
      .query(`
        UPDATE RefreshTokens 
        SET isRevoked = 1 
        WHERE token = @token
      `);
  }
}