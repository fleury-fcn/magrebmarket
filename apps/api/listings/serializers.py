from __future__ import annotations

from typing import Iterable

from django.conf import settings
from rest_framework import serializers

from accounts.serializers import PublicUserSerializer
from .constants import CATEGORY_FIELD_SCHEMAS, COUNTRY_CITIES, COUNTRY_REGIONS
from .models import Favorite, Listing, ListingImage, ListingReport, Review, SearchAlert

ABSOLUTE_URL_PREFIXES = ('http://', 'https://')


def resolve_cover_image_url(value: str | None, request) -> str | None:
    if not value:
        return None
    reference = value.strip()
    if not reference:
        return None
    if reference.startswith(ABSOLUTE_URL_PREFIXES):
        return reference
    media_url = settings.MEDIA_URL or '/'
    if media_url.startswith(ABSOLUTE_URL_PREFIXES):
        resolved = f"{media_url.rstrip('/')}/{reference.lstrip('/')}"
        return resolved
    if reference.startswith('/'):
        resolved_path = reference
    else:
        base_path = media_url.rstrip('/') or ''
        resolved_path = f"{base_path}/{reference.lstrip('/')}"
    if not resolved_path.startswith('/'):
        resolved_path = f"/{resolved_path.lstrip('/')}"
    if request:
        return request.build_absolute_uri(resolved_path)
    return resolved_path


class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ['id', 'image_url', 'is_primary', 'order']


class ListingSerializer(serializers.ModelSerializer):
    seller = PublicUserSerializer(read_only=True)
    moderated_by = PublicUserSerializer(read_only=True)
    images = ListingImageSerializer(many=True, read_only=True)
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            'id',
            'title',
            'slug',
            'description',
            'price',
            'currency',
            'category',
            'sub_category',
            'country',
            'region',
            'city',
            'zip_code',
            'status',
            'condition',
            'is_featured',
            'promotion_type',
            'promotion_ends_at',
            'negotiable',
            'contact_email',
            'contact_phone',
            'whatsapp',
            'cover_image',
            'tags',
            'attributes',
            'views_count',
            'published_at',
            'expires_at',
            'created_at',
            'updated_at',
            'moderation_notes',
            'moderated_at',
            'moderated_by',
            'auto_moderation_score',
            'auto_moderation_flags',
            'seller',
            'images',
        ]
        read_only_fields = [
            'status',
            'views_count',
            'published_at',
            'expires_at',
            'created_at',
            'updated_at',
            'seller',
            'slug',
            'moderation_notes',
            'moderated_at',
            'moderated_by',
            'auto_moderation_score',
            'auto_moderation_flags',
            'promotion_ends_at',
        ]

    def get_cover_image(self, obj):
        return resolve_cover_image_url(obj.cover_image, self.context.get('request'))


class ListingSearchResultSerializer(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()
    photos = serializers.SerializerMethodField()
    is_urgent = serializers.SerializerMethodField()
    is_pro = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()
    posted_at = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    departement = serializers.CharField(source='region', read_only=True)

    class Meta:
        model = Listing
        fields = [
            'id',
            'slug',
            'title',
            'description',
            'price',
            'currency',
            'category',
            'sub_category',
            'country',
            'region',
            'departement',
            'city',
            'zip_code',
            'condition',
            'negotiable',
            'promotion_type',
            'is_urgent',
            'is_pro',
            'is_favorite',
            'cover_image',
            'photos',
            'posted_at',
            'views_count',
        ]
        read_only_fields = fields

    def get_cover_image(self, obj):
        return resolve_cover_image_url(obj.cover_image, self.context.get('request'))

    def get_photos(self, obj):
        request = self.context.get('request')
        photos: list[str] = []
        cover = self.get_cover_image(obj)
        if cover:
            photos.append(cover)
        images_qs = obj.images.all() if hasattr(obj, 'images') else []
        for image in images_qs:
            resolved = resolve_cover_image_url(image.image_url, request)
            if resolved and resolved not in photos:
                photos.append(resolved)
        return photos

    def get_is_urgent(self, obj):
        return obj.promotion_type == Listing.PromotionType.URGENT

    def get_is_pro(self, obj):
        seller = getattr(obj, 'seller', None)
        return bool(seller and (seller.is_staff or seller.is_superuser))

    def get_is_favorite(self, obj):
        favorite_ids = self.context.get('favorite_ids') or set()
        return obj.id in favorite_ids

    def get_posted_at(self, obj):
        return (obj.published_at or obj.created_at)

    def get_price(self, obj):
        return float(obj.price) if obj.price is not None else None


class ListingWriteSerializer(serializers.ModelSerializer):
    images = ListingImageSerializer(many=True, required=False)

    class Meta:
        model = Listing
        fields = [
            'title',
            'description',
            'price',
            'currency',
            'category',
            'sub_category',
            'country',
            'region',
            'city',
            'zip_code',
            'condition',
            'negotiable',
            'contact_email',
            'contact_phone',
            'whatsapp',
            'cover_image',
            'tags',
            'attributes',
            'promotion_type',
            'images',
        ]

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        listing = Listing.objects.create(**validated_data)
        self._sync_images(listing, images_data)
        return listing

    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if images_data is not None:
            instance.images.all().delete()
            self._sync_images(instance, images_data)
        return instance

    def _sync_images(self, listing: Listing, images_data: Iterable[dict]):
        for order, image in enumerate(images_data):
            ListingImage.objects.create(
                listing=listing,
                image_url=image['image_url'],
                is_primary=image.get('is_primary', order == 0),
                order=image.get('order', order),
            )

    def validate(self, attrs):
        attrs = super().validate(attrs)
        self._validate_region(attrs)
        self._validate_city(attrs)
        self._validate_attributes(attrs)
        return attrs

    def validate_cover_image(self, value):
        if not value:
            return ''
        reference = value.strip()
        if not reference:
            return ''
        if reference.startswith(ABSOLUTE_URL_PREFIXES):
            return reference
        media_prefixes = [settings.MEDIA_URL, '/media/', 'media/']
        for prefix in media_prefixes:
            if prefix and reference.startswith(prefix):
                reference = reference[len(prefix):]
                break
        return reference.lstrip('/')

    def _validate_region(self, attrs):
        country = attrs.get('country')
        region = attrs.get('region')
        if not (country and region):
            return
        region_entry = next((item for item in COUNTRY_REGIONS if item['code'] == country), None)
        if not region_entry:
            return
        valid_regions = set(region_entry['regions'])
        if region not in valid_regions:
            raise serializers.ValidationError({'region': "Cette région n'est pas disponible pour ce pays."})

    def _validate_city(self, attrs):
        country = attrs.get('country')
        city = attrs.get('city')
        if not (country and city):
            return
        valid_cities = COUNTRY_CITIES.get(country)
        if valid_cities and city not in valid_cities:
            raise serializers.ValidationError({'city': "Cette ville n'est pas disponible pour ce pays."})

    def _validate_attributes(self, attrs):
        category = attrs.get('category')
        if category not in CATEGORY_FIELD_SCHEMAS:
            return
        attributes = attrs.get('attributes') or {}
        if not isinstance(attributes, dict):
            raise serializers.ValidationError({'attributes': 'Format invalide'})
        field_errors: dict[str, str] = {}
        for field_schema in CATEGORY_FIELD_SCHEMAS[category]:
            field_name = field_schema['name']
            value = attributes.get(field_name)
            if field_schema.get('required') and (value is None or value == ''):
                field_errors[field_name] = 'Champ obligatoire pour cette catégorie.'
        if field_errors:
            raise serializers.ValidationError({'attributes': field_errors})


class FavoriteSerializer(serializers.ModelSerializer):
    listing = ListingSerializer(read_only=True)
    listing_id = serializers.PrimaryKeyRelatedField(
        source='listing', queryset=Listing.objects.all(), write_only=True
    )

    class Meta:
        model = Favorite
        fields = ['id', 'listing', 'listing_id', 'created_at']


class ListingReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingReport
        fields = ['id', 'listing', 'reason', 'message', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']


class ReviewSerializer(serializers.ModelSerializer):
    reviewer = PublicUserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'listing', 'reviewer', 'rating', 'comment', 'created_at']
        read_only_fields = ['reviewer', 'created_at']

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('La note doit être comprise entre 1 et 5')
        return value


class ListingModerationSerializer(serializers.ModelSerializer):
    seller_id = serializers.IntegerField(source='seller.id', read_only=True)
    seller_email = serializers.SerializerMethodField()
    seller_name = serializers.SerializerMethodField()
    seller_country = serializers.CharField(source='seller.country', read_only=True)
    seller_city = serializers.CharField(source='seller.city', read_only=True)
    photos_count = serializers.SerializerMethodField()
    moderated_by = PublicUserSerializer(read_only=True)
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            'id',
            'slug',
            'title',
            'status',
            'price',
            'currency',
            'country',
            'region',
            'city',
            'zip_code',
            'category',
            'sub_category',
            'promotion_type',
            'negotiable',
            'is_featured',
            'condition',
            'auto_moderation_score',
            'auto_moderation_flags',
            'moderation_notes',
            'moderated_at',
            'moderated_by',
            'created_at',
            'updated_at',
            'published_at',
            'cover_image',
            'seller_id',
            'seller_email',
            'seller_name',
            'seller_country',
            'seller_city',
            'photos_count',
        ]
        read_only_fields = fields

    def get_seller_email(self, obj):
        return getattr(obj.seller, 'email', None)

    def get_seller_name(self, obj):
        if not obj.seller:
            return None
        full_name = f"{obj.seller.first_name} {obj.seller.last_name}".strip()
        return full_name or obj.seller.email

    def get_photos_count(self, obj):
        return obj.images.count()

    def get_cover_image(self, obj):
        return resolve_cover_image_url(obj.cover_image, self.context.get('request'))


class ModerationDecisionItemSerializer(serializers.Serializer):
    slug = serializers.SlugField()
    status = serializers.ChoiceField(choices=Listing.Status.choices)
    notes = serializers.CharField(required=False, allow_blank=True, default='', trim_whitespace=True)

    def validate_notes(self, value):
        return value.strip()


class ModerationBulkDecisionSerializer(serializers.Serializer):
    decisions = ModerationDecisionItemSerializer(many=True, min_length=1, max_length=50)


class CoverImageUploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        max_size = 5 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError('La taille maximale autorisée est de 5 Mo.')
        content_type = getattr(value, 'content_type', '') or ''
        if not content_type.startswith('image/'):
            raise serializers.ValidationError("Le fichier doit être une image (JPEG, PNG, GIF...).")
        return value


class SearchAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchAlert
        fields = ["id", "label", "query", "category", "country", "min_price", "max_price", "is_active", "created_at"]
        read_only_fields = ["id", "created_at"]
