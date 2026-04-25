from __future__ import annotations

from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import Conversation, Message
from .serializers import ConversationCreateSerializer, ConversationSerializer, MessageSerializer


class ConversationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.select_related('listing', 'buyer', 'seller').filter(
            Q(buyer=user) | Q(seller=user)
        )

    def get_serializer_class(self):
        if self.action == 'create':
            return ConversationCreateSerializer
        return ConversationSerializer

    def create(self, request, *args, **kwargs):
        serializer = ConversationCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        listing = serializer.validated_data['listing']
        conversation, created = Conversation.objects.get_or_create(
            listing=listing,
            buyer=request.user,
            defaults={"seller": listing.seller},
        )
        if not created and not conversation.is_open:
            conversation.is_open = True
            conversation.save(update_fields=["is_open"])
        response_serializer = ConversationSerializer(conversation)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class ConversationMessageView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_conversation(self) -> Conversation:
        conversation = get_object_or_404(Conversation.objects.select_related('buyer', 'seller'), pk=self.kwargs['conversation_id'])
        if self.request.user not in (conversation.buyer, conversation.seller):
            raise PermissionDenied("Accès refusé")
        return conversation

    def get_queryset(self):
        conversation = self.get_conversation()
        conversation.messages.filter(is_read=False).exclude(sender=self.request.user).update(
            is_read=True,
            read_at=timezone.now(),
        )
        return conversation.messages.select_related('sender')

    def perform_create(self, serializer):
        conversation = self.get_conversation()
        serializer.save(conversation=conversation, sender=self.request.user)
