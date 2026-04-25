from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    model = User
    list_display = ("email", "first_name", "last_name", "is_staff", "is_verified")
    ordering = ("email",)
    search_fields = ("email", "first_name", "last_name")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Informations personnelles", {"fields": ("first_name", "last_name", "phone_number", "country", "city", "date_of_birth", "avatar")} ),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Statuts", {"fields": ("last_login", "date_joined", "is_verified")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password1", "password2", "first_name", "last_name", "is_staff", "is_superuser"),
        }),
    )
    filter_horizontal = ("groups", "user_permissions")
    add_form_template = None

    def get_fieldsets(self, request, obj=None):  # pragma: no cover - admin only
        fieldsets = super().get_fieldsets(request, obj)
        return fieldsets
