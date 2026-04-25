from __future__ import annotations

import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify

from .validators import validate_cover_image_reference


def generate_listing_slug(title: str) -> str:
    base = slugify(title)[:48]
    return f"{base}-{uuid.uuid4().hex[:6]}"


class Listing(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Brouillon"
        PENDING = "pending", "En validation"
        PUBLISHED = "published", "Publiée"
        ARCHIVED = "archived", "Archivée"

    class PromotionType(models.TextChoices):
        STANDARD = "standard", "Standard"
        URGENT = "urgent", "Urgente"
        PREMIUM = "premium", "Premium"

    class Condition(models.TextChoices):
        NEW = "new", "Neuf"
        LIKE_NEW = "like_new", "Comme neuf"
        USED = "used", "Occasion"
        REFURBISHED = "refurbished", "Reconditionné"

    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="listings",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=210, unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="MAD")
    category = models.CharField(max_length=40)
    sub_category = models.CharField(max_length=60, blank=True)
    country = models.CharField(max_length=2)
    region = models.CharField(max_length=80)
    city = models.CharField(max_length=120, blank=True)
    zip_code = models.CharField(max_length=16, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    condition = models.CharField(max_length=20, choices=Condition.choices, default=Condition.USED)
    is_featured = models.BooleanField(default=False)
    promotion_type = models.CharField(
        max_length=20, choices=PromotionType.choices, default=PromotionType.STANDARD
    )
    promotion_ends_at = models.DateTimeField(null=True, blank=True)
    negotiable = models.BooleanField(default=False)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=32, blank=True)
    whatsapp = models.CharField(max_length=32, blank=True)
    cover_image = models.TextField(blank=True, validators=[validate_cover_image_reference])
    tags = models.JSONField(default=list, blank=True)
    attributes = models.JSONField(default=dict, blank=True)
    views_count = models.PositiveIntegerField(default=0)
    published_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    moderation_notes = models.TextField(blank=True)
    moderated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="moderated_listings",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    moderated_at = models.DateTimeField(null=True, blank=True)
    auto_moderation_score = models.FloatField(default=0)
    auto_moderation_flags = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:  # pragma: no cover - admin display
        return self.title

    def publish(self):
        self.status = self.Status.PUBLISHED
        self.published_at = timezone.now()


class ListingImage(models.Model):
    listing = models.ForeignKey(Listing, related_name="images", on_delete=models.CASCADE)
    image_url = models.TextField()
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "created_at"]


class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="favorites", on_delete=models.CASCADE)
    listing = models.ForeignKey(Listing, related_name="favorited_by", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "listing")


class ListingReport(models.Model):
    class Reason(models.TextChoices):
        SCAM = "scam", "Arnaque"
        SPAM = "spam", "Spam"
        INAPPROPRIATE = "inappropriate", "Inapproprié"
        OTHER = "other", "Autre"

    class Status(models.TextChoices):
        PENDING = "pending", "En attente"
        REVIEWED = "reviewed", "Traité"
        DISMISSED = "dismissed", "Classé"

    listing = models.ForeignKey(Listing, related_name="reports", on_delete=models.CASCADE)
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="reports", on_delete=models.CASCADE)
    reason = models.CharField(max_length=32, choices=Reason.choices)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Review(models.Model):
    listing = models.ForeignKey(Listing, related_name="reviews", on_delete=models.CASCADE)
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="given_reviews", on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("listing", "reviewer")



class SearchAlert(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='search_alerts',
        on_delete=models.CASCADE,
    )
    label = models.CharField(max_length=200)
    query = models.CharField(max_length=200, blank=True)
    category = models.CharField(max_length=40, blank=True)
    country = models.CharField(max_length=2, blank=True)
    min_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    max_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_notified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user} — {self.label}"
