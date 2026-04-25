export type DashboardTab = 'overview' | 'ads' | 'messages' | 'favorites' | 'alerts' | 'profile' | 'settings';

export type ListingItem = {
  id: number;
  slug: string;
  title: string;
  price: number;
  currency: string;
  status: 'draft' | 'pending' | 'published' | 'archived';
  city: string;
  region: string;
  views_count: number;
  created_at: string;
  cover_image: string | null;
};

export type FavoriteItem = {
  id: number;
  listing: ListingItem;
  created_at: string;
};

export type ConversationItem = {
  id: string;
  listing: ListingItem;
  buyer: { id: number; first_name: string; last_name: string; email: string };
  seller: { id: number; first_name: string; last_name: string; email: string };
  is_open: boolean;
  last_message_at: string;
  created_at: string;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type DashboardStats = {
  published: number;
  pending: number;
  drafts: number;
  totalViews: number;
  favoritesCount: number;
  conversationsCount: number;
};
