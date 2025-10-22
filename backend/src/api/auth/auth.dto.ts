import * as z from "zod"

const passwordRequirements =  z.string().min(8).nonempty()
    .refine((password) => /[A-Z]/.test(password), {
      message: "Needs an uppercase character",
    })
    .refine((password) => /[a-z]/.test(password), {
      message: "Needs a lowercase character",
    })
    .refine((password) => /[0-9]/.test(password), { 
      message: "Needs a number" 
    })
    .refine((password) => /[!@#$%^&*]/.test(password), {
      message: "Needs a special char",
    })

export const loginRequirements = z.object({
  email:z.string().email(),
  password:passwordRequirements
})

export const registerRequirements = z.object({
  email:z.string().email(),
  password:passwordRequirements,
  confirm:passwordRequirements,
  nome: z.string().min(2).max(100).nonempty(),
  cognome: z.string().min(2).max(100).nonempty(),
})

export type loginDTO = z.infer<typeof loginRequirements>
export type registerDTO = z.infer<typeof registerRequirements>

export interface User {
  id: number;
  email: string;
  password: string;
  nome: string;
  cognome: string;
  isActive: boolean;
}

export interface UserSafe {
  id: number;
  email: string;
  nome: string;
  cognome: string;
  isActive: boolean;
};

export interface RefreshToken {
  id: number;
  token: string;
  userId: number;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
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