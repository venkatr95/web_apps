export type UserRole = "user" | "admin" | "seller" | "employee";

export interface User {
  _id: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  clerkUserId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  profileImage?: {
    asset: {
      _ref: string;
      _type: string;
    };
    hotspot?: any;
    crop?: any;
    _type: string;
  };
  role: UserRole;
  addresses?: Array<{
    _ref: string;
    _type: string;
    _key: string;
  }>;
  preferences?: {
    newsletter?: boolean;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    preferredCurrency?: "USD" | "EUR" | "GBP" | "CAD";
    preferredLanguage?: "en" | "es" | "fr" | "de";
  };
  rewardPoints?: number;
  wishlist?: Array<{
    _ref: string;
    _type: string;
    _key: string;
  }>;
  cart?: Array<{
    product: {
      _ref: string;
      _type: string;
    };
    quantity: number;
    addedAt: string;
    size?: string;
    color?: string;
    _key: string;
  }>;
  orders?: Array<{
    _ref: string;
    _type: string;
    _key: string;
  }>;
  loyaltyPoints?: number;
  totalSpent?: number;
  walletBalance?: number;
  walletTransactions?: Array<{
    id: string;
    type:
      | "credit_refund"
      | "credit_manual"
      | "debit_order"
      | "debit_withdrawal";
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description: string;
    orderId?: string;
    withdrawalRequestId?: string;
    processedBy?: string;
    createdAt: string;
    status: "completed" | "pending" | "failed" | "cancelled";
    _key: string;
  }>;
  withdrawalRequests?: Array<{
    id: string;
    amount: number;
    method: "bank" | "paypal" | "stripe" | "check";
    bankDetails?: {
      accountHolderName?: string;
      bankName?: string;
      accountNumber?: string;
      routingNumber?: string;
      swiftCode?: string;
    };
    paypalEmail?: string;
    status:
      | "pending"
      | "approved"
      | "processing"
      | "completed"
      | "rejected"
      | "cancelled";
    requestedAt: string;
    processedAt?: string;
    processedBy?: string;
    rejectionReason?: string;
    notes?: string;
    transactionId?: string;
    _key: string;
  }>;
  lastLogin?: string;
  isActive?: boolean;
  premiumStatus?: "none" | "pending" | "active" | "rejected" | "cancelled";
  premiumAppliedAt?: string;
  premiumApprovedBy?: string;
  premiumApprovedAt?: string;
  premiumRejectedAt?: string;
  rejectionReason?: string;
  isBusiness?: boolean;
  businessStatus?: "none" | "pending" | "active" | "rejected" | "cancelled";
  businessApprovedBy?: string;
  businessApprovedAt?: string;
  businessRejectedAt?: string;
  businessAppliedAt?: string;
  membershipType?: "standard" | "premium" | "business" | "vip";
  activatedAt?: string;
  activatedBy?: string;
  isEmployee?: boolean;
  isAdmin?: boolean;
  employeeRole?:
    | "callcenter"
    | "packer"
    | "warehouse"
    | "deliveryman"
    | "incharge"
    | "accounts";
  employeeStatus?: "active" | "inactive" | "suspended";
  employeeAssignedBy?: string;
  employeeAssignedAt?: string;
  employeeSuspendedBy?: string;
  employeeSuspendedAt?: string;
  employeeSuspensionReason?: string;
  employeePerformance?: {
    ordersProcessed?: number;
    ordersConfirmed?: number;
    ordersPacked?: number;
    ordersAssignedForDelivery?: number;
    ordersDelivered?: number;
    cashCollected?: number;
    paymentsReceived?: number;
    lastActiveAt?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    type: "promo" | "order" | "system" | "marketing" | "general";
    read: boolean;
    priority: "low" | "medium" | "high" | "urgent";
    sentAt: string;
    readAt?: string;
    sentBy?: string;
    actionUrl?: string;
    _key: string;
  }>;
}

export interface UserRoleUpdate {
  userId: string;
  newRole: UserRole;
}

export interface UserForRoleManagement {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: UserRole;
  _createdAt: string;
  isActive?: boolean;
  employeeStatus?: "active" | "inactive" | "suspended";
}
