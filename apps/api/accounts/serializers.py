from __future__ import annotations

from django.contrib.auth import authenticate
from django.db.models import Avg
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from .models import SellerRating, User


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.lower()


class PublicUserSerializer(serializers.ModelSerializer):
    avg_rating = serializers.SerializerMethodField()
    ratings_count = serializers.SerializerMethodField()
    listings_count = serializers.SerializerMethodField()
    date_joined = serializers.DateTimeField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "city",
            "country",
            "avatar",
            "is_verified",
            "date_joined",
            "avg_rating",
            "ratings_count",
            "listings_count",
        ]

    def get_avg_rating(self, obj):
        result = obj.ratings_received.aggregate(avg=Avg("score"))["avg"]
        return round(result, 1) if result else None

    def get_ratings_count(self, obj):
        return obj.ratings_received.count()

    def get_listings_count(self, obj):
        return obj.listings.filter(status="published").count()


class SellerRatingSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()
    reviewer_avatar = serializers.SerializerMethodField()

    class Meta:
        model = SellerRating
        fields = ["id", "score", "comment", "created_at", "reviewer_name", "reviewer_avatar"]
        read_only_fields = ["id", "created_at", "reviewer_name", "reviewer_avatar"]

    def get_reviewer_name(self, obj):
        u = obj.reviewer
        return f"{u.first_name} {u.last_name}".strip() or u.email.split("@")[0]

    def get_reviewer_avatar(self, obj):
        return obj.reviewer.avatar or None

    def validate_score(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Le score doit être entre 1 et 5.")
        return value


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "password",
            "first_name",
            "last_name",
            "phone_number",
            "country",
            "city",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        user = authenticate(self.context.get("request"), email=email, password=password)
        if not user:
            raise serializers.ValidationError(_("Identifiants invalides"))
        attrs["user"] = user
        return attrs


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "country",
            "city",
            "is_verified",
            "date_of_birth",
            "avatar",
        ]
        read_only_fields = ["email", "is_verified"]


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        user = self.context["request"].user
        if not user.check_password(attrs["current_password"]):
            raise serializers.ValidationError({"current_password": _("Mot de passe actuel incorrect")})
        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user
