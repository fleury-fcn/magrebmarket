import secrets
from decimal import Decimal

from django.core.files.storage import default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from .models import Favorite, Listing, ListingImage
from .serializers import ListingWriteSerializer

TEST_GIF = (
	b"GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!\xf9\x04\x01\n\x00\x01\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02L\x01\x00;"
)


class MetaEndpointsTests(APITestCase):
	def test_regions_endpoint_returns_payload(self):
		response = self.client.get(reverse('regions'))
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertGreater(len(response.json()), 0)

	def test_categories_endpoint_returns_payload(self):
		response = self.client.get(reverse('categories'))
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(any(item['slug'] == 'immobilier' for item in response.json()))


class ModerationEndpointsTests(APITestCase):
	def setUp(self):
		self.admin = User.objects.create_superuser(
			email='admin@example.com',
			password=secrets.token_urlsafe(12),
		)
		self.seller = User.objects.create_user(
			email='seller@example.com',
			password=secrets.token_urlsafe(12),
		)
		self.listing = Listing.objects.create(
			seller=self.seller,
			title='Camion benne test',
			slug='camion-benne-test',
			description=' '.join(['robuste'] * 30),
			price=Decimal('125000.00'),
			currency='MAD',
			category='vehicules',
			sub_category='utilitaires',
			country='MA',
			region='Casablanca-Settat',
			city='Casablanca',
			zip_code='20000',
			status=Listing.Status.PENDING,
			condition=Listing.Condition.USED,
			contact_email='seller@example.com',
			auto_moderation_score=0.9,
		)

	def test_queue_requires_admin(self):
		response = self.client.get(reverse('moderation-queue'))
		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

	def test_queue_returns_pending_listing(self):
		self.client.force_authenticate(self.admin)
		response = self.client.get(reverse('moderation-queue'))
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['count'], 1)
		self.assertEqual(response.data['results'][0]['slug'], self.listing.slug)

	def test_queue_flagged_filter(self):
		self.client.force_authenticate(self.admin)
		response = self.client.get(reverse('moderation-queue'), {'flagged': 'true'})
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['count'], 1)

	def test_stats_endpoint_counts_items(self):
		self.client.force_authenticate(self.admin)
		response = self.client.get(reverse('moderation-stats'))
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['pending'], 1)
		self.assertEqual(response.data['flagged'], 1)

	def test_bulk_decision_publishes_listing(self):
		self.client.force_authenticate(self.admin)
		payload = {
			'decisions': [
				{
					'slug': self.listing.slug,
					'status': Listing.Status.PUBLISHED,
					'notes': 'Validée',
				}
			]
		}
		response = self.client.post(reverse('moderation-bulk-decision'), payload, format='json')
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.listing.refresh_from_db()
		self.assertEqual(self.listing.status, Listing.Status.PUBLISHED)
		self.assertIsNotNone(self.listing.moderated_at)
		self.assertEqual(response.data['updated'], 1)

	def test_history_returns_moderated_entries(self):
		self.client.force_authenticate(self.admin)
		self.listing.status = Listing.Status.ARCHIVED
		self.listing.moderated_at = timezone.now()
		self.listing.moderated_by = self.admin
		self.listing.save()
		response = self.client.get(reverse('moderation-history'))
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['count'], 1)


class CoverImageUploadTests(APITestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			email='uploader@example.com',
			password=secrets.token_urlsafe(12),
		)
		self.url = reverse('listing-cover-image-upload')
		self._uploaded_paths: list[str] = []

	def tearDown(self):
		for path in self._uploaded_paths:
			if default_storage.exists(path):
				default_storage.delete(path)

	def _image_file(self, name='photo.gif'):
		return SimpleUploadedFile(name, TEST_GIF, content_type='image/gif')

	def test_upload_requires_authentication(self):
		response = self.client.post(self.url, data={'file': self._image_file()}, format='multipart')
		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

	def test_upload_returns_media_path(self):
		self.client.force_authenticate(self.user)
		response = self.client.post(self.url, data={'file': self._image_file()}, format='multipart')
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertIn('path', response.data)
		self.assertIn('url', response.data)
		path = response.data['path']
		self._uploaded_paths.append(path)
		self.assertTrue(default_storage.exists(path))
		self.assertTrue(response.data['url'].startswith('http'))
		self.assertIn('/media/', response.data['url'])


class ListingCoverImageSerializationTests(APITestCase):
	def setUp(self):
		self.listing = Listing.objects.create(
			title='Test couverture',
			slug='test-couverture',
			description='Une description suffisante.' * 3,
			price=Decimal('999.00'),
			currency='MAD',
			category='vehicules',
			country='MA',
			region='Casablanca-Settat',
			city='Casablanca',
			zip_code='20000',
			status=Listing.Status.PUBLISHED,
			condition=Listing.Condition.USED,
			contact_email='test@example.com',
			cover_image='listings/cover_images/demo.jpg',
		)

	def test_detail_returns_absolute_cover_image(self):
		response = self.client.get(reverse('listing-detail', kwargs={'slug': self.listing.slug}))
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertTrue(response.data['cover_image'].startswith('http://testserver'))
		self.assertIn('/media/', response.data['cover_image'])

	def test_write_serializer_normalizes_media_paths(self):
		payload = {
			'title': 'Annonce media path',
			'description': 'description longue' * 5,
			'price': '1500.00',
			'currency': 'MAD',
			'category': 'vehicules',
			'sub_category': '',
			'country': 'MA',
			'region': 'Casablanca-Settat',
			'city': 'Casablanca',
			'zip_code': '20000',
			'condition': Listing.Condition.USED,
			'negotiable': True,
			'contact_email': 'seller@example.com',
			'contact_phone': '',
			'whatsapp': '',
			'cover_image': '/media/listings/cover_images/test.jpg',
			'tags': [],
			'attributes': {},
			'promotion_type': Listing.PromotionType.STANDARD,
		}
		serializer = ListingWriteSerializer(data=payload)
		self.assertTrue(serializer.is_valid(), serializer.errors)
		self.assertEqual(serializer.validated_data['cover_image'], 'listings/cover_images/test.jpg')


class ListingSearchApiTests(APITestCase):
	def setUp(self):
		self.url = reverse('listing-search')
		self.visitor = User.objects.create_user(
			email='visitor@example.com',
			password=secrets.token_urlsafe(12),
		)
		self.individual = User.objects.create_user(
			email='citizen@example.com',
			password=secrets.token_urlsafe(12),
		)
		self.pro = User.objects.create_user(
			email='pro@example.com',
			password=secrets.token_urlsafe(12),
			is_staff=True,
		)
		self.urgent_listing = Listing.objects.create(
			seller=self.individual,
			title='Quad urgent désert',
			slug='quad-urgent-desert',
			description='robuste et récent',
			price=Decimal('9500.00'),
			currency='MAD',
			category='vehicules',
			sub_category='quad',
			country='MA',
			region='Marrakech-Safi',
			city='Marrakech',
			zip_code='40000',
			status=Listing.Status.PUBLISHED,
			condition=Listing.Condition.USED,
			contact_email='citizen@example.com',
			promotion_type=Listing.PromotionType.URGENT,
			negotiable=True,
			published_at=timezone.now(),
			cover_image='listings/cover_images/quad.jpg',
		)
		self.pro_listing = Listing.objects.create(
			seller=self.pro,
			title='Berline premium import',
			slug='berline-premium-import',
			description='kilométrage faible',
			price=Decimal('18500.00'),
			currency='MAD',
			category='vehicules',
			sub_category='voitures',
			country='MA',
			region='Casablanca-Settat',
			city='Casablanca',
			zip_code='20000',
			status=Listing.Status.PUBLISHED,
			condition=Listing.Condition.NEW,
			contact_email='pro@example.com',
			promotion_type=Listing.PromotionType.STANDARD,
			published_at=timezone.now(),
		)
		ListingImage.objects.create(listing=self.pro_listing, image_url='listings/gallery/berline.jpg')
		self.draft_listing = Listing.objects.create(
			seller=self.individual,
			title='Prototype secret',
			slug='prototype-secret',
			description='non publié',
			price=Decimal('5000.00'),
			currency='MAD',
			category='vehicules',
			sub_category='concept',
			country='MA',
			region='Rabat-Salé-Kénitra',
			city='Rabat',
			zip_code='10000',
			status=Listing.Status.DRAFT,
			condition=Listing.Condition.USED,
			contact_email='citizen@example.com',
		)

	def test_search_returns_only_published_results(self):
		response = self.client.get(self.url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(response.data['total_results'], 2)
		self.assertEqual(response.data['meta']['total_results'], 2)
		slugs = {item['slug'] for item in response.data['results']}
		self.assertNotIn(self.draft_listing.slug, slugs)

	def test_search_supports_query_and_category_filters(self):
		response = self.client.get(self.url, {'q': 'Berline', 'category': 'vehicules'})
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data['results']), 1)
		self.assertEqual(response.data['results'][0]['slug'], self.pro_listing.slug)

	def test_search_honors_price_and_condition_filters(self):
		response = self.client.get(
			self.url,
			{
				'min_price': '10000',
				'condition': Listing.Condition.NEW,
			},
		)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data['results']), 1)
		self.assertEqual(response.data['results'][0]['slug'], self.pro_listing.slug)

	def test_search_with_photo_filter(self):
		response = self.client.get(self.url, {'with_photo': 'true'})
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		# both published listings expose a cover or gallery photo
		self.assertEqual(len(response.data['results']), 2)

	def test_search_marks_favorite_for_authenticated_user(self):
		Favorite.objects.create(user=self.visitor, listing=self.urgent_listing)
		self.client.force_authenticate(self.visitor)
		response = self.client.get(self.url)
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		record = next(item for item in response.data['results'] if item['slug'] == self.urgent_listing.slug)
		self.assertTrue(record['is_favorite'])

	def test_search_supports_sort_by_price_desc(self):
		response = self.client.get(self.url, {'sort': 'price_desc'})
		self.assertEqual(response.status_code, status.HTTP_200_OK)
		prices = [item['price'] for item in response.data['results']]
		self.assertEqual(prices, sorted(prices, reverse=True))
		self.assertIn(Listing.Condition.USED, response.data['meta']['conditions'])
