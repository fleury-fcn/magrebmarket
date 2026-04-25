from __future__ import annotations

import uuid
from decimal import Decimal, InvalidOperation
from pathlib import Path

from django.core.files.storage import default_storage
from django.db import transaction
from django.db.models import Count, Max, Min, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import filters, mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .constants import CATEGORY_FIELD_SCHEMAS, COUNTRY_CITIES, COUNTRY_REGIONS, LISTING_CATEGORIES
from .models import Favorite, Listing, ListingReport, Review, SearchAlert, generate_listing_slug
from .moderation import apply_auto_moderation, apply_promotion_rules
from .permissions import IsOwnerOrReadOnly
from .serializers import (
	CoverImageUploadSerializer,
	FavoriteSerializer,
	ListingModerationSerializer,
	ListingReportSerializer,
	ListingSearchResultSerializer,
	ListingSerializer,
	ListingWriteSerializer,
        ModerationBulkDecisionSerializer,
        ReviewSerializer,
        SearchAlertSerializer,
)
FLAGGED_SCORE_THRESHOLD = 0.6


class ModerationQueuePagination(PageNumberPagination):
	page_size = 25
	page_size_query_param = 'page_size'
	max_page_size = 100


class ListingSearchPagination(PageNumberPagination):
	page_size = 12
	page_size_query_param = 'page_size'
	max_page_size = 48

	def get_paginated_response(self, data):
		return Response(
			{
				'results': data,
				'page': self.page.number,
				'page_size': self.page.paginator.per_page,
				'total_results': self.page.paginator.count,
				'total_pages': self.page.paginator.num_pages,
				'has_next': self.page.has_next(),
				'has_previous': self.page.has_previous(),
			}
		)


class ListingViewSet(viewsets.ModelViewSet):
	queryset = Listing.objects.select_related('seller', 'moderated_by').prefetch_related('images')
	permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
	lookup_field = 'slug'
	filter_backends = [filters.OrderingFilter]
	ordering_fields = ['created_at', 'published_at', 'price']
	ordering = ['-created_at']

	def get_serializer_class(self):
		if self.action in ['create', 'update', 'partial_update']:
			return ListingWriteSerializer
		return ListingSerializer

	def get_queryset(self):
		queryset = super().get_queryset()
		if self.request.user.is_staff:
			return self._apply_filters(queryset)
		if self.action == 'retrieve' and self.request.user.is_authenticated:
			queryset = queryset.filter(Q(status=Listing.Status.PUBLISHED) | Q(seller=self.request.user))
		else:
			queryset = queryset.filter(status=Listing.Status.PUBLISHED)
		return self._apply_filters(queryset)

	def _apply_filters(self, queryset):
		params = self.request.query_params
		if country := params.get('country'):
			queryset = queryset.filter(country__iexact=country)
		if category := params.get('category'):
			queryset = queryset.filter(category__iexact=category)
		if region := params.get('region'):
			queryset = queryset.filter(region__icontains=region)
		if city := params.get('city'):
			queryset = queryset.filter(city__icontains=city)
		if params.get('featured') == 'true':
			queryset = queryset.filter(is_featured=True)
		if promotion_type := params.get('promotion_type'):
			queryset = queryset.filter(promotion_type=promotion_type)
		if params.get('negotiable') == 'true':
			queryset = queryset.filter(negotiable=True)
		if min_price := params.get('min_price'):
			queryset = queryset.filter(price__gte=min_price)
		if max_price := params.get('max_price'):
			queryset = queryset.filter(price__lte=max_price)
		if condition := params.get('condition'):
			queryset = queryset.filter(condition=condition)
		if query := params.get('q'):
			queryset = queryset.filter(
				Q(title__icontains=query) | Q(description__icontains=query) | Q(region__icontains=query) | Q(city__icontains=query)
			)
		return queryset

	def perform_create(self, serializer):
		listing = serializer.save(
			seller=self.request.user if self.request.user.is_authenticated else None,
			slug=generate_listing_slug(serializer.validated_data['title']),
			status=Listing.Status.PENDING,
		)
		apply_promotion_rules(listing)
		apply_auto_moderation(listing)
		listing.save()
		return listing

	def perform_update(self, serializer):
		listing = serializer.save()
		apply_promotion_rules(listing)
		apply_auto_moderation(listing)
		listing.save()
		return listing

	@action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='me')
	def my_listings(self, request):
		queryset = self.queryset.filter(seller=request.user)
		page = self.paginate_queryset(queryset)
		serializer = self.get_serializer(page if page is not None else queryset, many=True)
		if page is not None:
			return self.get_paginated_response(serializer.data)
		return Response(serializer.data)

	@action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
	def publish(self, request, slug=None):
		listing = self.get_object()
		if listing.seller != request.user:
			return Response(status=status.HTTP_403_FORBIDDEN)
		listing.publish()
		listing.save(update_fields=['status', 'published_at'])
		serializer = self.get_serializer(listing)
		return Response(serializer.data)

	@action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
	def moderate(self, request, slug=None):
		listing = self.get_object()
		status_value = request.data.get('status')
		if status_value not in Listing.Status.values:
			return Response({'status': 'Statut invalide'}, status=status.HTTP_400_BAD_REQUEST)
		notes = request.data.get('notes', '')
		listing.moderation_notes = notes
		listing.moderated_by = request.user
		listing.moderated_at = timezone.now()
		if status_value == Listing.Status.PUBLISHED:
			listing.publish()
		else:
			listing.status = status_value
		listing.save()
		serializer = self.get_serializer(listing)
		return Response(serializer.data)


class FavoriteViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
	serializer_class = FavoriteSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		return Favorite.objects.filter(user=self.request.user).select_related('listing')

	def perform_create(self, serializer):
		serializer.save(user=self.request.user)


class ListingReportViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
	serializer_class = ListingReportSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		if self.request.user.is_staff:
			return ListingReport.objects.select_related('listing', 'reporter')
		return ListingReport.objects.filter(reporter=self.request.user)

	def perform_create(self, serializer):
		serializer.save(reporter=self.request.user)


class ReviewViewSet(viewsets.ModelViewSet):
	serializer_class = ReviewSerializer
	permission_classes = [permissions.IsAuthenticatedOrReadOnly]

	def get_queryset(self):
		qs = Review.objects.select_related('listing', 'reviewer')
		if listing_id := self.request.query_params.get('listing'):
			qs = qs.filter(listing_id=listing_id)
		return qs

	def perform_create(self, serializer):
		serializer.save(reviewer=self.request.user)


class ModerationBaseView(ListAPIView):
	permission_classes = [permissions.IsAdminUser]
	serializer_class = ListingModerationSerializer
	pagination_class = ModerationQueuePagination
	queryset = Listing.objects.select_related('seller', 'moderated_by').prefetch_related('images')

	def _boolean_param(self, value: str | None) -> bool:
		if not value:
			return False
		return value.lower() in {'1', 'true', 'yes'}

	def apply_common_filters(self, queryset):
		params = self.request.query_params
		if country := params.get('country'):
			queryset = queryset.filter(country__iexact=country)
		if region := params.get('region'):
			queryset = queryset.filter(region__icontains=region)
		if reviewer := params.get('moderated_by'):
			queryset = queryset.filter(moderated_by_id=reviewer)
		if promotion := params.get('promotion_type'):
			queryset = queryset.filter(promotion_type=promotion)
		if q := params.get('q'):
			queryset = queryset.filter(
				Q(title__icontains=q)
				| Q(description__icontains=q)
				| Q(seller__email__icontains=q)
			)
		return queryset


class ModerationQueueView(ModerationBaseView):
	def get_queryset(self):
		queryset = super().get_queryset()
		params = self.request.query_params
		status_param = params.get('status') or Listing.Status.PENDING
		queryset = queryset.filter(status=status_param)
		queryset = self.apply_common_filters(queryset)
		if self._boolean_param(params.get('flagged')):
			queryset = queryset.filter(auto_moderation_score__gte=FLAGGED_SCORE_THRESHOLD)
		return queryset.order_by('-auto_moderation_score', 'created_at')


class ModerationHistoryView(ModerationBaseView):
	def get_queryset(self):
		queryset = super().get_queryset().exclude(moderated_at__isnull=True)
		queryset = self.apply_common_filters(queryset)
		if status_param := self.request.query_params.get('status'):
			queryset = queryset.filter(status=status_param)
		return queryset.order_by('-moderated_at')


class ModerationStatsView(APIView):
	permission_classes = [permissions.IsAdminUser]

	def get(self, request):
		today = timezone.now().date()
		payload = {
			'pending': Listing.objects.filter(status=Listing.Status.PENDING).count(),
			'flagged': Listing.objects.filter(
				status=Listing.Status.PENDING, auto_moderation_score__gte=FLAGGED_SCORE_THRESHOLD
			).count(),
			'published_today': Listing.objects.filter(
				status=Listing.Status.PUBLISHED, moderated_at__date=today
			).count(),
			'archived_today': Listing.objects.filter(
				status=Listing.Status.ARCHIVED, moderated_at__date=today
			).count(),
		}
		return Response(payload)


class ModerationBulkDecisionView(APIView):
	permission_classes = [permissions.IsAdminUser]

	def post(self, request):
		serializer = ModerationBulkDecisionSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		decisions = serializer.validated_data['decisions']
		updated = []
		with transaction.atomic():
			for entry in decisions:
				listing = get_object_or_404(Listing.objects.select_for_update(), slug=entry['slug'])
				listing.moderation_notes = entry.get('notes', '')
				listing.moderated_by = request.user
				listing.moderated_at = timezone.now()
				if entry['status'] == Listing.Status.PUBLISHED:
					listing.publish()
				else:
					listing.status = entry['status']
				listing.save()
				updated.append(listing)
		serialized = ListingModerationSerializer(updated, many=True, context={'request': request}).data
		return Response({'updated': len(updated), 'results': serialized})


class CoverImageUploadView(APIView):
	permission_classes = [permissions.IsAuthenticated]
	parser_classes = [MultiPartParser, FormParser]

	def post(self, request):
		serializer = CoverImageUploadSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		file_obj = serializer.validated_data['file']
		extension = Path(file_obj.name).suffix or '.jpg'
		filename = f"listings/cover_images/{uuid.uuid4().hex}{extension}"
		saved_path = default_storage.save(filename, file_obj)
		relative_url = default_storage.url(saved_path)
		full_url = relative_url
		if not relative_url.startswith(('http://', 'https://')):
			full_url = request.build_absolute_uri(relative_url)
		payload = {
			'path': saved_path,
			'url': full_url,
			'relative_url': relative_url,
			'size': file_obj.size,
			'content_type': file_obj.content_type,
			'filename': Path(saved_path).name,
		}
		return Response(payload, status=status.HTTP_201_CREATED)


class CountryRegionsView(APIView):
	permission_classes = [permissions.AllowAny]

	def get(self, request):  # pragma: no cover
		country = request.query_params.get('country')
		if country:
			entry = next((item for item in COUNTRY_REGIONS if item['code'] == country.upper()), None)
			if entry:
				return Response(entry)
			return Response({}, status=status.HTTP_404_NOT_FOUND)
		return Response(COUNTRY_REGIONS)


class CategoriesView(APIView):
	permission_classes = [permissions.AllowAny]

	def get(self, request):  # pragma: no cover
		known_categories: dict[str, dict] = {
			entry['slug']: {
				'slug': entry['slug'],
				'title': entry['title'],
				'description': entry.get('description', ''),
			}
			for entry in LISTING_CATEGORIES
		}

		for slug in CATEGORY_FIELD_SCHEMAS.keys():
			if slug not in known_categories:
				known_categories[slug] = {
					'slug': slug,
					'title': slug.replace('_', ' ').replace('-', ' ').title(),
					'description': '',
				}

		db_categories = (
			Listing.objects.exclude(category__isnull=True)
			.exclude(category__exact='')
			.values_list('category', flat=True)
			.distinct()
		)
		for raw_slug in db_categories:
			slug = raw_slug.strip().lower()
			if slug and slug not in known_categories:
				known_categories[slug] = {
					'slug': slug,
					'title': slug.replace('_', ' ').replace('-', ' ').title(),
					'description': '',
				}

		ordered_slugs = [entry['slug'] for entry in LISTING_CATEGORIES]
		remaining_slugs = sorted(slug for slug in known_categories.keys() if slug not in ordered_slugs)
		payload = [known_categories[slug] for slug in ordered_slugs + remaining_slugs]
		return Response(payload)


class CountryCitiesView(APIView):
	permission_classes = [permissions.AllowAny]

	def get(self, request):  # pragma: no cover
		country = request.query_params.get('country')
		if not country:
			return Response({'countries': list(COUNTRY_CITIES.keys())})
		country_code = country.upper()
		cities = COUNTRY_CITIES.get(country_code)
		if cities is None:
			return Response({}, status=status.HTTP_404_NOT_FOUND)
		query = request.query_params.get('q')
		if query:
			needle = query.lower()
			cities = [city for city in cities if needle in city.lower()]
		return Response({'country': country_code, 'cities': cities})


class MarketStatsView(APIView):
	permission_classes = [permissions.AllowAny]

	def get(self, request):
		data = {
			'active_listings': Listing.objects.filter(status=Listing.Status.PUBLISHED).count(),
			'featured': Listing.objects.filter(status=Listing.Status.PUBLISHED, is_featured=True).count(),
			'drafts': Listing.objects.filter(status=Listing.Status.DRAFT).count(),
			'generated_at': timezone.now(),
		}
		return Response(data)


class ListingSearchView(ListAPIView):
	permission_classes = [permissions.AllowAny]
	serializer_class = ListingSearchResultSerializer
	pagination_class = ListingSearchPagination

	def get_queryset(self):
		queryset = (
			Listing.objects.filter(status=Listing.Status.PUBLISHED)
			.select_related('seller')
			.prefetch_related('images')
		)
		return self._apply_filters(queryset)

	def list(self, request, *args, **kwargs):
		queryset = self.filter_queryset(self.get_queryset())
		self.search_meta = self._build_meta(queryset)
		page = self.paginate_queryset(queryset)
		if page is not None:
			self.favorite_ids = self._favorite_ids_for(page)
			serializer = self.get_serializer(page, many=True)
			response = self.get_paginated_response(serializer.data)
		else:
			self.favorite_ids = self._favorite_ids_for(queryset)
			serializer = self.get_serializer(queryset, many=True)
			response = Response(serializer.data)
		response.data['meta'] = self.search_meta
		return response

	def get_serializer_context(self):
		context = super().get_serializer_context()
		context['favorite_ids'] = getattr(self, 'favorite_ids', set())
		return context

	def _favorite_ids_for(self, listings):
		if not self.request.user.is_authenticated:
			return set()
		ids = [listing.id for listing in listings]
		if not ids:
			return set()
		return set(
			Favorite.objects.filter(user=self.request.user, listing_id__in=ids).values_list('listing_id', flat=True)
		)

	def _apply_filters(self, queryset):
		params = self.request.query_params
		self._search_needs_distinct = False
		queryset = self._apply_query_filter(queryset, params)
		queryset = self._apply_category_filters(queryset, params)
		queryset = self._apply_geo_filters(queryset, params)
		queryset = self._apply_price_filters(queryset, params)
		queryset = self._apply_condition_filter(queryset, params)
		queryset = self._apply_media_filter(queryset)
		queryset = self._apply_flag_filters(queryset)
		sort_param = params.get('sort') or params.get('sort_by') or params.get('sortBy')
		queryset = self._apply_sort(queryset, sort_param)
		if self._search_needs_distinct:
			queryset = queryset.distinct()
		return queryset

	def _apply_query_filter(self, queryset, params):
		q = params.get('q') or params.get('query')
		if not q:
			return queryset
		needle = q.strip()
		if not needle:
			return queryset
		return queryset.filter(
			Q(title__icontains=needle)
			| Q(description__icontains=needle)
			| Q(city__icontains=needle)
			| Q(region__icontains=needle)
			| Q(zip_code__icontains=needle)
		)

	def _apply_category_filters(self, queryset, params):
		if category := params.get('category'):
			queryset = queryset.filter(category__iexact=category)
		if subcategory := (params.get('sub_category') or params.get('subcategory')):
			queryset = queryset.filter(sub_category__iexact=subcategory)
		return queryset

	def _apply_geo_filters(self, queryset, params):
		if country := params.get('country'):
			queryset = queryset.filter(country__iexact=country)
		if region := params.get('region'):
			queryset = queryset.filter(region__icontains=region)
		if city := params.get('city'):
			queryset = queryset.filter(city__icontains=city)
		if location := params.get('location'):
			needle = location.strip()
			if needle:
				queryset = queryset.filter(
					Q(city__icontains=needle) | Q(region__icontains=needle) | Q(zip_code__icontains=needle)
				)
		return queryset

	def _apply_price_filters(self, queryset, params):
		min_price = self._decimal_param(params.get('min_price') or params.get('price_min'))
		if min_price is not None:
			queryset = queryset.filter(price__gte=min_price)
		max_price = self._decimal_param(params.get('max_price') or params.get('price_max'))
		if max_price is not None:
			queryset = queryset.filter(price__lte=max_price)
		return queryset

	def _apply_condition_filter(self, queryset, params):
		conditions = self._extract_list('condition', 'conditions')
		if not conditions:
			return queryset
		valid_conditions = set(Listing.Condition.values)
		selected = [value for value in conditions if value in valid_conditions]
		if not selected:
			return queryset
		return queryset.filter(condition__in=selected)

	def _apply_media_filter(self, queryset):
		if not self._truthy('with_photo', 'withPhoto'):
			return queryset
		self._search_needs_distinct = True
		return queryset.filter(Q(cover_image__gt='') | Q(images__image_url__isnull=False))

	def _apply_flag_filters(self, queryset):
		# Generic promotion_type filter (e.g. premium, standard, urgent)
		promotion_type_param = self.request.query_params.get('promotion_type')
		if promotion_type_param:
			valid_types = {choice[0] for choice in Listing.PromotionType.choices}
			if promotion_type_param in valid_types:
				return queryset.filter(promotion_type=promotion_type_param)
		# Legacy specific flags
		if self._truthy('is_urgent', 'urgent', 'isUrgent'):
			queryset = queryset.filter(promotion_type=Listing.PromotionType.URGENT)
		pro_filter = self._boolean_param('is_pro', 'pro', 'isPro')
		if pro_filter is True:
			return queryset.filter(seller__is_staff=True)
		if pro_filter is False:
			return queryset.filter(Q(seller__isnull=True) | Q(seller__is_staff=False))
		return queryset

	def _apply_sort(self, queryset, sort_key):
		mapping = {
			'price_asc': 'price',
			'price_desc': '-price',
			'date_asc': 'published_at',
			'date_desc': '-published_at',
		}
		if sort_key in mapping:
			return queryset.order_by(mapping[sort_key], '-created_at')
		# default relevance-like ordering
		return queryset.order_by('-is_featured', '-promotion_type', '-published_at', '-created_at')

	def _build_meta(self, queryset):
		total = queryset.count()
		aggregates = queryset.aggregate(min_price=Min('price'), max_price=Max('price'))
		conditions = queryset.values('condition').annotate(count=Count('id')).order_by('-count')
		categories = queryset.values('category').annotate(count=Count('id')).order_by('-count')
		regions = (
			queryset.exclude(region='')
			.values('region')
			.annotate(count=Count('id'))
			.order_by('-count')[:8]
		)
		return {
			'total_results': total,
			'price_min': float(aggregates['min_price']) if aggregates['min_price'] is not None else None,
			'price_max': float(aggregates['max_price']) if aggregates['max_price'] is not None else None,
			'conditions': {row['condition']: row['count'] for row in conditions if row['condition']},
			'categories': {row['category']: row['count'] for row in categories if row['category']},
			'top_regions': [{'label': row['region'], 'count': row['count']} for row in regions],
		}

	def _decimal_param(self, raw_value):
		if raw_value is None:
			return None
		try:
			return Decimal(raw_value)
		except (InvalidOperation, TypeError, ValueError):
			return None

	def _boolean_param(self, *names):
		true_values = {'1', 'true', 'yes'}
		false_values = {'0', 'false', 'no'}
		for name in names:
			value = self.request.query_params.get(name)
			if value is None:
				continue
			lowered = value.strip().lower()
			if lowered in true_values:
				return True
			if lowered in false_values:
				return False
		return None

	def _truthy(self, *names):
		return self._boolean_param(*names) is True

	def _extract_list(self, *names):
		values: list[str] = []
		params = self.request.query_params
		for name in names:
			values.extend(params.getlist(name))
		if not values:
			for name in names:
				raw = params.get(name)
				if raw:
					values.extend(part.strip() for part in raw.split(','))
					break
		return [value for value in (item.strip() for item in values) if value]


class SearchAlertViewSet(viewsets.ModelViewSet):
    """
    CRUD des alertes de recherche pour l'utilisateur authentifié.
    GET    /api/search-alerts/         → liste
    POST   /api/search-alerts/         → créer
    PATCH  /api/search-alerts/<id>/    → activer/désactiver
    DELETE /api/search-alerts/<id>/    → supprimer
    """
    serializer_class = SearchAlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SearchAlert.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
