from django.urls import path

from .views import (
    CSRFTokenView,
    LoginView,
    LogoutView,
    PasswordChangeView,
    PasswordResetRequestView,
    ProfileView,
    PublicUserView,
    RegisterView,
    SellerRatingsView,
)

app_name = "accounts"

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/profile/", ProfileView.as_view(), name="profile"),
    path("auth/password/", PasswordChangeView.as_view(), name="password-change"),
    path("auth/password/reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("auth/csrf/", CSRFTokenView.as_view(), name="csrf"),
    path("users/<int:pk>/", PublicUserView.as_view(), name="public-user"),
    path("users/<int:pk>/ratings/", SellerRatingsView.as_view(), name="seller-ratings"),
]
