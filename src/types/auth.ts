export type UserRole = "WHOLESALER" | "SHOP_OWNER" | "ADMIN";

export type ConnectionStatus =
  | "PENDING_REVIEW"
  | "REVISION_REQUIRED"
  | "ACTIVE"
  | "REJECTED"
  | "BLOCKED";

export type ConnectionSource = "INVITE" | "DIRECTORY";

export type PaymentTerms = "PAY_UPFRONT" | "CASH_ON_DELIVERY" | "NET_30";

export interface UserProfile {
  id: string;
  email?: string;
  role: UserRole;
  business_name: string;
  contact_person: string | null;
  phone_number: string;
  avatar_url: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface WholesalerProfile {
  id: string;
  description: string | null;
  trade_license_number: string | null;
  tax_id: string | null;
  warehouse_address: string;
  rating: number;
  review_count: number;
  categories: string[];
  is_catalog_public: boolean;
  accepted_payment_terms: PaymentTerms[];
}

export interface ShopOwnerProfile {
  id: string;
  trade_license_number: string | null;
  delivery_address: string;
  shop_category: string | null;
}
