from __future__ import annotations

from datetime import timedelta
from typing import List, Tuple

from django.utils import timezone

from .models import Listing

SUSPECT_KEYWORDS = {
    "arnaque": "Mot-clé suspect",
    "scam": "Mot-clé suspect (scam)",
    "bitcoin": "Référence aux crypto-actifs",
    "investment": "Promesse d'investissement",
    "wire transfer": "Demande de virement",
}

MIN_DESCRIPTION_WORDS = 20


def apply_promotion_rules(listing: Listing) -> None:
    now = timezone.now()
    if listing.promotion_type == Listing.PromotionType.PREMIUM:
        listing.is_featured = True
        listing.promotion_ends_at = now + timedelta(days=30)
    elif listing.promotion_type == Listing.PromotionType.URGENT:
        listing.is_featured = True
        listing.promotion_ends_at = now + timedelta(days=10)
    else:
        listing.is_featured = False
        listing.promotion_ends_at = None


def analyze_content(listing: Listing) -> Tuple[float, List[str]]:
    text = f"{listing.title} {listing.description}".lower()
    flags: List[str] = []
    score = 0.0

    for keyword, label in SUSPECT_KEYWORDS.items():
        if keyword in text:
            flags.append(label)
            score += 0.4

    if len(listing.description.split()) < MIN_DESCRIPTION_WORDS:
        flags.append("Description trop courte")
        score += 0.2

    if listing.price <= 0:
        flags.append("Prix nul ou négatif")
        score += 0.2

    return min(score, 1.0), flags


def apply_auto_moderation(listing: Listing) -> None:
    score, flags = analyze_content(listing)
    listing.auto_moderation_score = score
    listing.auto_moderation_flags = flags
    if score >= 0.8:
        listing.status = Listing.Status.PENDING