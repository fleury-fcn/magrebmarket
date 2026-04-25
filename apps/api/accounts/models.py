from __future__ import annotations

from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import UserManager


class User(AbstractUser):
    username = None  # supprimé au profit de l'e-mail
    email = models.EmailField("Adresse e-mail", unique=True)
    first_name = models.CharField("Prénom", max_length=80)
    last_name = models.CharField("Nom", max_length=80)
    phone_number = models.CharField(max_length=32, blank=True)
    country = models.CharField(max_length=2, blank=True)
    city = models.CharField(max_length=120, blank=True)
    is_verified = models.BooleanField(default=False)
    date_of_birth = models.DateField(null=True, blank=True)
    avatar = models.URLField(blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    objects = UserManager()

    class Meta(AbstractUser.Meta):
        swappable = "AUTH_USER_MODEL"

    def __str__(self) -> str:  # pragma: no cover - affichage admin
        return f"{self.first_name} {self.last_name}".strip() or self.email
