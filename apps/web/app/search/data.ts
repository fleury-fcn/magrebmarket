import type { Ad, Category, Condition } from './types';

export const LBC = {
	orange: '#FF6E14',
	orangeHover: '#E85C0D',
	orangeLight: '#FFF2E7',
	orangeBorder: '#FFC299',
	green: '#009E60',
	white: '#FFFFFF',
	gray50: '#F8F8F8',
	gray100: '#EEEEEE',
	gray200: '#DDDDDD',
	gray300: '#BBBBBB',
	gray400: '#999999',
	gray600: '#666666',
	gray700: '#444444',
	gray900: '#1F1F1F',
	urgent: '#FF3B30',
	pro: '#2563EB',
} as const;

export const CONDITIONS: Array<{ id: Condition; label: string; color: string }> = [
	{ id: 'new', label: 'Neuf', color: '#00B894' },
	{ id: 'like_new', label: 'Comme neuf', color: '#1E90FF' },
	{ id: 'used', label: 'Occasion', color: '#F39C12' },
	{ id: 'refurbished', label: 'Reconditionné', color: '#8E44AD' },
];

export const RADIUS_OPTIONS = [
	{ label: 'Partout', value: 0 },
	{ label: '< 10 km', value: 10 },
	{ label: '< 20 km', value: 20 },
	{ label: '< 50 km', value: 50 },
	{ label: '< 100 km', value: 100 },
	{ label: '< 200 km', value: 200 },
	{ label: 'France entière', value: 1000 },
];

export const CATEGORIES: Category[] = [
	{
		id: 'immobilier',
		label: 'Immobilier',
		icon: '🏡',
		count: 28400,
		subcategories: [
			{ id: 'appartements', label: 'Appartements', count: 18200 },
			{ id: 'maisons', label: 'Maisons', count: 7600 },
			{ id: 'colocations', label: 'Colocations', count: 1100 },
		],
	},
	{
		id: 'vehicules',
		label: 'Véhicules',
		icon: '🚗',
		count: 41200,
		subcategories: [
			{ id: 'voitures', label: 'Voitures', count: 27800 },
			{ id: 'motos', label: 'Motos', count: 4200 },
			{ id: 'utilitaires', label: 'Utilitaires', count: 2100 },
		],
	},
	{
		id: 'multimedia',
		label: 'Multimédia',
		icon: '💻',
		count: 36700,
		subcategories: [
			{ id: 'informatique', label: 'Informatique', count: 12300 },
			{ id: 'telephonie', label: 'Téléphonie', count: 9400 },
			{ id: 'image_son', label: 'Image & Son', count: 7400 },
		],
	},
	{
		id: 'maison',
		label: 'Maison',
		icon: '🪑',
		count: 19400,
		subcategories: [
			{ id: 'ameublement', label: 'Ameublement', count: 5400 },
			{ id: 'electromenager', label: 'Électroménager', count: 3600 },
			{ id: 'decoration', label: 'Décoration', count: 2800 },
		],
	},
	{
		id: 'loisirs',
		label: 'Loisirs',
		icon: '🎮',
		count: 15800,
		subcategories: [
			{ id: 'jeux', label: 'Jeux & jouets', count: 4200 },
			{ id: 'sport', label: 'Sports', count: 5200 },
			{ id: 'musique', label: 'Musique', count: 1700 },
		],
	},
	{
		id: 'vetements',
		label: 'Mode',
		icon: '👗',
		count: 22100,
		subcategories: [
			{ id: 'femmes', label: 'Femmes', count: 9900 },
			{ id: 'hommes', label: 'Hommes', count: 6100 },
			{ id: 'enfants', label: 'Enfants', count: 3200 },
		],
	},
	{
		id: 'services',
		label: 'Services',
		icon: '🧰',
		count: 5200,
		subcategories: [
			{ id: 'cours', label: 'Cours particuliers', count: 900 },
			{ id: 'soutien', label: 'Soutien scolaire', count: 1100 },
			{ id: 'bien_etre', label: 'Bien-être', count: 600 },
		],
	},
	{
		id: 'emploi',
		label: 'Emploi',
		icon: '💼',
		count: 8900,
		subcategories: [
			{ id: 'cd i', label: 'CDI', count: 3100 },
			{ id: 'cdd', label: 'CDD', count: 2100 },
			{ id: 'freelance', label: 'Freelance', count: 900 },
		],
	},
	{
		id: 'autres',
		label: 'Autres',
		icon: '✨',
		count: 6400,
		subcategories: [
			{ id: 'collection', label: 'Collection', count: 800 },
			{ id: 'evenements', label: 'Événementiel', count: 500 },
		],
	},
];

const placeholderPhotos = [
	'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=60',
	'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=600&q=60',
	'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=60',
	'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=60',
	'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=600&q=60',
];

const cities = [
	{ city: 'Paris', zip: '75011', dept: '75' },
	{ city: 'Lyon', zip: '69003', dept: '69' },
	{ city: 'Marseille', zip: '13008', dept: '13' },
	{ city: 'Toulouse', zip: '31000', dept: '31' },
	{ city: 'Bordeaux', zip: '33000', dept: '33' },
	{ city: 'Nice', zip: '06000', dept: '06' },
	{ city: 'Nantes', zip: '44000', dept: '44' },
	{ city: 'Lille', zip: '59000', dept: '59' },
];

const lorem =
	"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sit amet nisl viverra, semper lacus sit amet, fringilla lacus.";

export const MOCK_ADS: Ad[] = Array.from({ length: 16 }).map((_, index) => {
	const category = CATEGORIES[index % CATEGORIES.length];
	const subcategory = category.subcategories[index % category.subcategories.length];
	const cityInfo = cities[index % cities.length];
	const condition = CONDITIONS[index % CONDITIONS.length];
	const price = index % 3 === 0 ? null : 100 + index * 45;
	return {
		id: `ad-${index + 1}`,
		title: `${subcategory.label} ${index + 1}`,
		price,
		negotiable: index % 4 === 0,
		city: cityInfo.city,
		zipCode: cityInfo.zip,
		departement: cityInfo.dept,
		category: category.id,
		subcategory: subcategory.id,
		condition: condition.id,
		description: `${subcategory.label} ${index + 1}. ${lorem}`,
		photos: placeholderPhotos.slice(0, (index % placeholderPhotos.length) + 1),
		postedAt: new Date(Date.now() - index * 3600 * 1000 * 8),
		isUrgent: index % 5 === 0,
		isPro: index % 3 === 0,
		isFavorite: index % 7 === 0,
		views: 120 + index * 13,
	};
});
