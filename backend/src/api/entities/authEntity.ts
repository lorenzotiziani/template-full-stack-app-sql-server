export interface User {
    id: number;
    email: string;
    password: string;
    nome: string;
    cognome: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface UserSafe {
    id: number;
    email: string;
    nome: string;
    cognome: string;
    isActive: boolean;
}

export interface AuthResponse {
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
}
export interface JwtPayload {
    userId: number;
    email: string;
    iat?: number;
    exp?: number;
}
export interface RefreshToken {
    id: number;
    token: string;
    userId: number;
    expiresAt: Date;
    isRevoked: boolean;
    createdAt: Date;
}