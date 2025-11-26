export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string | Date | null;
  updatedAt: string | Date | null;
  role: string | null;
  banned: boolean;
  banReason: string | null;
  banExpiresAt: string | Date | null;
}

export interface AdminUserListParams {
  search?: string;
  page?: number;
  perPage?: number;
}

export interface AdminUserListResult {
  users: AdminUser[];
  total: number;
  verifiedTotal: number;
  recentSignups: number;
  lastUpdatedUser: AdminUser | null;
  page: number;
  perPage: number;
}
