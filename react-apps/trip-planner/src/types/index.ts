// User Types
export interface User {
  id: string;
  name: string;
  avatar?: string;
  nickname?: string;
}

export interface Destination {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  description: string;
  rating: number;
  price?: string;
  tags?: string[];
}

// Travel Types
export interface TravelGroup {
  id: string;
  name: string;
  members: User[];
}

export interface TravelItinerary {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  numberOfPeople: number;
  activities: ItineraryActivity[];
  travelGroup?: TravelGroup;
  travelType: string;
}

export interface ItineraryActivity {
  id: string;
  title: string;
  description: string;
  time: string;
  day: number;
  location?: string;
  imageUrl?: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  isItinerary?: boolean;
  itineraryId?: string;
}

export interface Attachment {
  id: string;
  type: "image" | "pdf" | "expense";
  url: string;
  name: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: ChatMessage[];
  isGroup: boolean;
  groupName?: string;
  lastActivityAt: string;
}

// Expense Types
export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  paidBy: string;
  participants: ExpenseParticipant[];
  date: string;
  category: string;
  notes?: string;
  receiptUrl?: string;
}

export interface ExpenseParticipant {
  userId: string;
  share: number;
  isPaid: boolean;
}

export interface ExpenseReport {
  id: string;
  title: string;
  expenses: Expense[];
  totalAmount: number;
  currency: string;
  generatedAt: string;
}

// Theme Type
export type ThemeMode = "light" | "dark" | "system";
