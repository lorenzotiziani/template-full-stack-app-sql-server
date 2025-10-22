import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../user/user.model';
import { RefreshTokenModel } from '../../models/RefreshToken';
import { loginDTO, registerDTO, AuthResponse, JwtPayload } from '../auth/auth.dto';
import { jwtConfig } from '../../config/jwt';

export class AuthService {
  static async register(data: registerDTO): Promise<AuthResponse> {
    // Verifica se l'utente esiste già
    const existingUser = await UserModel.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email già registrata');
    }


    if (data.password !== data.confirm) {
      throw new Error('Le password non coincidono');
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    // Crea utente
    const user = await UserModel.create({
      email: data.email,
      password: hashedPassword,
      nome: data.nome,
      cognome: data.cognome,
      isActive: true
    });

    // Genera tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    // Salva refresh token
    await RefreshTokenModel.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: false
    });

    const { password, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    };
  }

  static async login(data: loginDTO): Promise<AuthResponse> {
    const user = await UserModel.findByEmail(data.email);
    if (!user) {
      throw new Error('Credenziali non valide');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new Error('Credenziali non valide');
    }

    await RefreshTokenModel.revokeByUserId(user.id);


    const { accessToken, refreshToken } = await this.generateTokens(user);

    await RefreshTokenModel.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: false
    });

    const { password, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    };
  }

  static async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {

    const storedToken = await RefreshTokenModel.findByToken(token);
    if (!storedToken) {
      throw new Error('Refresh token non valido');
    }

    // Verifica JWT
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, jwtConfig.refreshSecret) as JwtPayload;
    } catch (error) {
      await RefreshTokenModel.revokeByToken(token);
      throw new Error('Refresh token non valido');
    }

    // Trova utente
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      throw new Error('Utente non trovato');
    }

    // Revoca vecchio token
    await RefreshTokenModel.revokeByToken(token);

    // Genera nuovi tokens
    const tokens = await this.generateTokens(user);

    // Salva nuovo refresh token
    await RefreshTokenModel.create({
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: false
    });

    return tokens;
  }

  static async logout(refreshToken: string): Promise<void> {
    await RefreshTokenModel.revokeByToken(refreshToken);
  }

  private static async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string }> {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email
  };

  // Opzioni per access token
  const accessTokenOptions: jwt.SignOptions = {
    expiresIn: jwtConfig.expiresIn
  };

  // Opzioni per refresh token
  const refreshTokenOptions: jwt.SignOptions = {
    expiresIn: jwtConfig.refreshExpiresIn
  };

  const accessToken = jwt.sign(payload, jwtConfig.secret, accessTokenOptions);
  const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, refreshTokenOptions);

  return { accessToken, refreshToken };
}

  static async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new Error('Token non valido');
    }
  }
}