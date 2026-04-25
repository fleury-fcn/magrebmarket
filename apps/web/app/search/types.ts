export type Condition = 'new' | 'like_new' | 'used' | 'refurbished';

export type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc';

export interface Ad {
	id: string;
	title: string;
	price: number | null;
	negotiable: boolean;
	city: string;
	zipCode: string;
	departement: string;
	category: string;
	subcategory: string;
	condition: Condition;
	description: string;
	photos: string[];
	postedAt: Date;
	isUrgent: boolean;
	isPro: boolean;
	isFavorite: boolean;
	views: number;
}

export interface SearchFilters {
	query: string;
	category: string;
	subcategory: string;
	priceMin: string;
	priceMax: string;
	conditions: Condition[];
	location: string;
	city: string;
	country: string;
	promotionType: string;
	radius: number;
	sortBy: SortOption;
	isPro: boolean | null;
	isUrgent: boolean | null;
	withPhoto: boolean;
	page: number;
}

export interface Category {
	id: string;
	label: string;
	icon: string;
	count: number;
	subcategories: { id: string; label: string; count: number }[];
}
