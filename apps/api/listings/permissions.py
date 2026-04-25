from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Autorise la lecture à tous et limite l'édition au propriétaire."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        seller = getattr(obj, "seller", None)
        return seller == request.user
