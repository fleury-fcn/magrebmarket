from __future__ import annotations

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator

_url_validator = URLValidator()


def validate_cover_image_reference(value: str | None) -> None:
	"""Allow either HTTP(S) URLs or media paths for cover images."""
	if not value:
		return
	reference = value.strip()
	if not reference:
		return
	if reference.startswith(('http://', 'https://')):
		_url_validator(reference)
		return
	media_url = settings.MEDIA_URL or ''
	if reference.lower().startswith(('javascript:', 'data:')):
		raise ValidationError("Fournissez une URL valide ou un chemin media relatif.")
	allowed_prefixes = [media_url, '/media/', 'media/', '/']
	if any(reference.startswith(prefix) for prefix in allowed_prefixes if prefix):
		return
	if '://' not in reference:
		return
	raise ValidationError("Fournissez une URL valide ou un chemin media relatif.")
