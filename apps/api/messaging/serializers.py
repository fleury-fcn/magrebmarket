from __future__ import annotations

from rest_framework import serializers

from accounts.serializers import PublicUserSerializer
from listings.serializers import ListingSerializer
from .models import Conversation, Message


class ConversationSerializer(serializers.ModelSerializer):
    listing = ListingSerializer(read_only=True)
    buyer = PublicUserSerializer(read_only=True)
    seller = PublicUserSerializer(read_only=True)

    class Meta:
        model = Conversation
        fields = [
            'id',
            'listing',
            'buyer',
            'seller',
            'is_open',
            'last_message_at',
            'created_at',
        ]


class ConversationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = ['listing']

    def validate_listing(self, listing):
        request = self.context['request']
        if listing.seller == request.user:
            raise serializers.ValidationError("Vous ne pouvez pas démarrer une conversation avec vous-même")
        return listing


class MessageSerializer(serializers.ModelSerializer):
    sender = PublicUserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'body', 'is_read', 'created_at', 'read_at']
        read_only_fields = ['conversation', 'sender', 'is_read', 'read_at']
