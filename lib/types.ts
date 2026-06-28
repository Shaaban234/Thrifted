// Core domain types shared across the app.

export interface Filters {
  query: string;
  category: string | null;
  brand: string | null;
  size: string | null;
  condition: string | null;
  color: string | null;
  price: string | null; // PRICE_RANGES label
  sort: string; // SORT_OPTIONS key
}

export type ItemCondition =
  | "New with tags"
  | "New without tags"
  | "Very good"
  | "Good"
  | "Satisfactory";

export type ItemStatus = "active" | "reserved" | "sold";

export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  bio?: string;
  location?: string;
  ratingAvg: number;
  reviewCount: number;
  followers: number;
  following: number;
  joinedAt: string;
}

export interface Item {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  brand: string;
  category: string;
  subcategory?: string;
  size: string;
  condition: ItemCondition;
  color: string;
  price: number; // in EUR
  photos: string[];
  status: ItemStatus;
  views: number;
  likes: number;
  createdAt: string;
}

export type MessageType = "text" | "offer" | "system";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  type: MessageType;
  offerAmount?: number;
  offerStatus?: "pending" | "accepted" | "declined";
  createdAt: string;
}

export interface Conversation {
  id: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unread: number;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "completed";

export interface Order {
  id: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  protectionFee: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId?: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export type NotificationType = "like" | "offer" | "sold" | "follow" | "review" | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  actorId?: string; // the other user involved
  itemId?: string;
  conversationId?: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number; // positive = credit, negative = debit
  type: "sale" | "payout" | "fee" | "purchase";
  label: string;
  createdAt: string;
}
