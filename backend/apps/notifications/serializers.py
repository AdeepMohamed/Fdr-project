from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    fdr_number = serializers.CharField(
        source='related_fdr.fdr_number', read_only=True, default=''
    )

    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message',
            'is_read', 'read_at', 'related_fdr', 'fdr_number',
            'email_sent', 'created_at',
        ]
        read_only_fields = ['id', 'notification_type', 'title', 'message',
                            'related_fdr', 'email_sent', 'created_at']
