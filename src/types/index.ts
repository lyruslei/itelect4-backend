import type { Types } from "mongoose";

// ===== ENUMS =====
export enum ClaimStatus {
  Pending,
  Approved,
  Rejected,
}

export const enum UserRole {
  Student = "student",
  Admin = "admin",
}

// ===== INTERFACES =====
export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "admin";
  isActive: boolean;
}

export interface Item {
  id: number;
  title: string;
  description: string;
  location: string;
  status: "lost" | "found" | "claimed";
  reportedById: number;
  reportedAt: Date;
}

export interface Claim {
  id: number;
  itemId: number;
  claimantId: number;
  status: ClaimStatus;
  createdAt: Date;
  notes?: string;
}

// ===== TYPE ALIASES & GENERICS =====
export type StringOrNumber = string | number;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ===== UTILITY TYPES =====
export type ItemUpdate = Partial<Item>;
export type UserPreview = Pick<User, "id" | "name" | "role">;
export type PublicItem = Omit<Item, "reportedById">;
export type RoleCount = Record<"student" | "admin", number>;

// Helper function for ReturnType demonstration
export function createClaim(itemId: number, claimantId: number, notes?: string) {
  return {
    id: Date.now(),
    itemId,
    claimantId,
    status: ClaimStatus.Pending,
    createdAt: new Date(),
    notes,
  };
}

export type NewClaim = ReturnType<typeof createClaim>;

// ===== WIRE / API TYPES =====
export type ApiItem = Omit<Item, "id" | "reportedAt"> & {
  id: string;
  reportedAt: string;
};

export type NewItem = Omit<ApiItem, "id">;

export type ApiClaim = Omit<Claim, "id" | "createdAt"> & {
  id: string;
  createdAt: string;
};

export type NewClaimApi = Omit<ApiClaim, "id">;

// ===== DB-FACING TYPES =====
export type UserDoc = Omit<User, "id"> & { password: string };
export type ItemDoc = Omit<Item, "id" | "reportedById"> & { reportedById: Types.ObjectId };
export type NewItemBody = Pick<Item, "title" | "description" | "location" | "status">;
export type ClaimDoc = Omit<Claim, "id">;

