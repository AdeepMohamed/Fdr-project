from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend

from .models import AuditLog
from .serializers import AuditLogSerializer
from apps.accounts.permissions import IsOfficialOrAdmin


class AuditLogListView(generics.ListAPIView):
    """List audit logs. Accessible only to officials and admins."""
    serializer_class = AuditLogSerializer
    permission_classes = [IsOfficialOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['action', 'entity_type', 'user']
    search_fields = ['summary', 'entity_id', 'action']
    ordering_fields = ['created_at', 'action']
    ordering = ['-created_at']
    queryset = AuditLog.objects.select_related('user').all()
