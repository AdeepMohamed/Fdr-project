from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True, default='')
    user_name = serializers.CharField(source='user.get_full_name', read_only=True, default='')

    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'user_email', 'user_name', 'action',
            'entity_type', 'entity_id', 'summary', 'details',
            'created_at',
        ]
