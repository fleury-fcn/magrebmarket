from django.contrib import admin

from .models import Favorite, Listing, ListingImage, ListingReport, Review


class ListingImageInline(admin.TabularInline):
	model = ListingImage
	extra = 0


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
	list_display = ('title', 'seller', 'country', 'region', 'category', 'status', 'is_featured')
	list_filter = ('status', 'country', 'category', 'is_featured')
	search_fields = ('title', 'description', 'seller__email')
	prepopulated_fields = {"slug": ("title",)}
	inlines = [ListingImageInline]


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
	list_display = ('user', 'listing', 'created_at')
	search_fields = ('user__email', 'listing__title')


@admin.register(ListingReport)
class ListingReportAdmin(admin.ModelAdmin):
	list_display = ('listing', 'reporter', 'reason', 'status', 'created_at')
	list_filter = ('status', 'reason')
	search_fields = ('listing__title', 'reporter__email')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
	list_display = ('listing', 'reviewer', 'rating', 'created_at')
	search_fields = ('listing__title', 'reviewer__email')
