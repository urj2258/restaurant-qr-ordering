// Category Types
export interface Category {
  id: string;
  name: string;
  image?: string;
  description?: string;
  displayOrder: number;
}

// Menu Item Types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  categoryName: string; // Denormalized for easier display
  isAvailable: boolean;
  isPopular?: boolean;
  extras?: Extra[];
  sizes?: Size[];
}

export interface Extra {
  id: string;
  name: string;
  price: number;
}

export interface Size {
  id: string;
  name: string;
  priceModifier: number;
}

// User Types
export type UserRole = 'admin' | 'kitchen' | 'staff';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
}

// Cart Types

// Cart Types
export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedSize?: Size;
  selectedExtras: Extra[];
  specialInstructions?: string;
}

// Order Types
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'served' | 'cancelled';

// Payment Types
// Payment Types
export type PaymentMethod = 'EasyPaisa' | 'JazzCash' | 'Bank Transfer' | 'Cash on Delivery' | 'COD' | 'Easypaisa' | 'BankTransfer' | 'Digital';

export interface Order {
  id: string;
  customerId?: string;
  tableId?: string; // Optional for delivery/pickup
  customerName?: string; // For delivery
  phone?: string;
  address?: string;
  city?: string;
  streetAddress?: string;
  items: CartItem[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  subtotal?: number; // Mobile has totalPrice, Web has subtotal/tax/total. make optional or align logic
  tax?: number;
  total: number; // Mobile uses totalPrice, map to this
  specialInstructions?: string;
  feedback?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
  latitude?: number;
  longitude?: number;
}

// Table Types
export interface Table {
  id: string; // Changed from number to string for UUID
  name: string;
  seats: number;
  isOccupied: boolean;
  currentOrderId?: string;
}

// Analytics Types
export interface DailyStats {
  date: string;
  orders: number;
  revenue: number;
}

export interface PopularItem {
  menuItemId: string;
  name: string;
  orderCount: number;
}

export interface TableStats {
  tableId: string;
  orderCount: number;
}
