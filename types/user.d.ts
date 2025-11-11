export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string | Date | null;
  updatedAt: string | Date | null;
}
