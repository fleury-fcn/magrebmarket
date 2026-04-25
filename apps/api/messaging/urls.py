from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ConversationMessageView, ConversationViewSet

router = DefaultRouter()
router.register('messages/conversations', ConversationViewSet, basename='conversation')

urlpatterns = [
    path('', include(router.urls)),
    path('messages/conversations/<uuid:conversation_id>/messages/', ConversationMessageView.as_view(), name='conversation-messages'),
]
