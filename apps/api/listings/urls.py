from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoriesView,
    CountryCitiesView,
    CountryRegionsView,
    CoverImageUploadView,
    FavoriteViewSet,
    ListingReportViewSet,
    ListingSearchView,
    ListingViewSet,
    MarketStatsView,
    ModerationBulkDecisionView,
    ModerationHistoryView,
    ModerationQueueView,
    ModerationStatsView,
    ReviewViewSet,
    SearchAlertViewSet,
)

router = DefaultRouter()
router.register('listings', ListingViewSet, basename='listing')
router.register('favorites', FavoriteViewSet, basename='favorite')
router.register('reports', ListingReportViewSet, basename='listing-report')
router.register('reviews', ReviewViewSet, basename='review')
router.register('search-alerts', SearchAlertViewSet, basename='search-alert')

urlpatterns = [
    path('listings/search/', ListingSearchView.as_view(), name='listing-search'),
    path('', include(router.urls)),
    path('meta/regions/', CountryRegionsView.as_view(), name='regions'),
    path('meta/cities/', CountryCitiesView.as_view(), name='cities'),
    path('meta/categories/', CategoriesView.as_view(), name='categories'),
    path('meta/stats/', MarketStatsView.as_view(), name='stats'),
    path('uploads/cover-image/', CoverImageUploadView.as_view(), name='listing-cover-image-upload'),
    path('moderation/queue/', ModerationQueueView.as_view(), name='moderation-queue'),
    path('moderation/history/', ModerationHistoryView.as_view(), name='moderation-history'),
    path('moderation/stats/', ModerationStatsView.as_view(), name='moderation-stats'),
    path('moderation/bulk-decision/', ModerationBulkDecisionView.as_view(), name='moderation-bulk-decision'),
]
