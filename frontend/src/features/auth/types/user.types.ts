import type { ApiResponse } from '@/shared/types/api-response.types';

export type UserRole = 'USER' | 'ADMIN';

export interface PublicUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatarUrl: string | null;
    lastLogin: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface LoginResponseData {
    accessToken: string;
    refreshToken: string;
    user: PublicUser;
}

export type CurrentUserResponse = ApiResponse<PublicUser>;
export type LoginResponse = ApiResponse<LoginResponseData>;
export type RegisterResponse = ApiResponse<null>;
