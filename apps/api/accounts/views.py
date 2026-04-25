from __future__ import annotations

import logging

from django.contrib.auth import login, logout
from django.middleware.csrf import get_token
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SellerRating, User
from .serializers import (
    LoginSerializer,
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    ProfileSerializer,
    PublicUserSerializer,
    RegisterSerializer,
    SellerRatingSerializer,
)


logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request, user)
        headers = self.get_success_headers(serializer.data)
        return Response(ProfileSerializer(user).data, status=status.HTTP_201_CREATED, headers=headers)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        login(request, user)
        return Response(ProfileSerializer(user).data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class PasswordChangeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = User.objects.filter(email__iexact=email).first()
        if user:
            logger.info("Password reset requested for user id=%s", user.id)
            # Email service not yet configured; request is acknowledged for UX consistency.
        return Response(status=status.HTTP_204_NO_CONTENT)


class CSRFTokenView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes: tuple = ()

    def get(self, request):
        token = get_token(request)
        return Response({"csrfToken": token})


class PublicUserView(generics.RetrieveAPIView):
    """GET /api/users/<id>/ — profil public d'un vendeur."""
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.all()


class SellerRatingsView(APIView):
    """
    GET  /api/users/<id>/ratings/ — liste des avis sur ce vendeur
    POST /api/users/<id>/ratings/ — soumettre un avis (authentifié, pas soi-même)
    """

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request, pk):
        ratings = SellerRating.objects.filter(seller_id=pk).select_related("reviewer")
        serializer = SellerRatingSerializer(ratings, many=True)
        return Response(serializer.data)

    def post(self, request, pk):
        if str(request.user.pk) == str(pk):
            return Response({"detail": "Vous ne pouvez pas vous noter vous-même."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            seller = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "Vendeur introuvable."}, status=status.HTTP_404_NOT_FOUND)

        existing = SellerRating.objects.filter(seller=seller, reviewer=request.user).first()
        serializer = SellerRatingSerializer(instance=existing, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(seller=seller, reviewer=request.user)
        http_status = status.HTTP_200_OK if existing else status.HTTP_201_CREATED
        return Response(serializer.data, status=http_status)

