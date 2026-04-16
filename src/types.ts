import { LucideIcon } from 'lucide-react';

export type PostType = 'ТАЖНА ВЕСТ' | 'ПОСЛЕДЕН ПОЗДРАВ' | 'СОЧУВСТВО' | 'ПОМЕН';

export type PomenSubtype = '7 дена' | '40 дена' | '6 месеци' | '1 година' | '2 години' | '5 години' | '10 години' | 'Сеќавање';

export type PackageType = 'Основен' | 'Истакнат';

export type PostStatus = 'pending_payment' | 'Во плаќање' | 'Чека одобрување' | 'Објавено' | 'Одбиено' | 'Тргнато' | 'Во проверка' | 'Потребна корекција';

export interface GuestbookEntry {
  id: string;
  senderName: string;
  text: string;
  status: 'pending' | 'approved';
  createdAt: string;
}

export interface ReminderIntent {
  type: '40_days' | '6_months' | '1_year' | 'annual';
  scheduledDate: string;
  notified: boolean;
}

export interface MemorialPost {
  id: string;
  slug: string;
  type: PostType;
  pomenSubtype?: PomenSubtype;
  fullName: string;
  city: string;
  birthYear?: number;
  deathYear?: number;
  age?: number;
  dateOfDeath?: string;
  dateOfFuneral?: string;
  timeOfFuneral?: string;
  placeOfFuneral?: string;
  familyNote?: string;
  pomenDate?: string;
  pomenTime?: string;
  pomenPlace?: string;
  condolenceFamily?: string;
  senderType?: 'семејство' | 'пријатели' | 'колеги' | 'фирма' | 'друго';
  senderName: string;
  farewellTitle?: string;
  introText?: string;
  email: string;
  phone: string;
  mainText: string;
  aiRefinedText?: string;
  aiRefinedIntro?: string;
  photoUrl: string;
  package: PackageType;
  selectedFrameStyle?: 'elegant' | 'orthodox' | 'catholic' | 'muslim' | 'star' | 'clean';
  status: PostStatus;
  createdAt: string;
  isFeatured?: boolean;
  guestbookEnabled: boolean;
  guestbookEntries?: GuestbookEntry[];
  reminders?: ReminderIntent[];
  // Payment fields
  paymentStatus?: 'unpaid' | 'paid' | 'cancelled' | 'failed' | 'refunded';
  paymentCheckoutId?: string;
  paymentOrderId?: string;
  paidAt?: string;
  featuredUntil?: string;
  refundAt?: string;
  // Link to a main memorial post (e.g. For condolences or farewells)
  relatedToId?: string;
  relatedToSlug?: string;
  // OG image for social sharing (1200x630 PNG stored in Firebase Storage)
  ogImageUrl?: string;
  // Photo crop position (CSS object-position value, e.g. "center 30%")
  photoPosition?: string;
}

export interface City {
  name: string;
  slug: string;
}

export interface PricingPackage {
  name: PackageType;
  price: string;
  features: string[];
  color: string;
}
