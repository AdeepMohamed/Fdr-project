from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ReleaseRequest
from .serializers import (
    ReleaseRequestSerializer,
    ReleaseRequestCreateSerializer,
    ReleaseDecisionSerializer,
)
from apps.accounts.permissions import IsOfficialOrAdmin
from apps.audit.models import AuditLog
from apps.notifications.models import Notification


class ReleaseRequestListCreateView(generics.ListCreateAPIView):
    """List or create release requests."""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReleaseRequestCreateSerializer
        return ReleaseRequestSerializer

    def get_queryset(self):
        qs = ReleaseRequest.objects.select_related(
            'fdr_record__institution', 'requested_by', 'reviewed_by'
        )
        user = self.request.user
        if user.role == 'institution':
            qs = qs.filter(fdr_record__institution__members__user=user)
        return qs

    def perform_create(self, serializer):
        release = serializer.save(requested_by=self.request.user)
        AuditLog.objects.create(
            user=self.request.user,
            action='release_request_submitted',
            entity_type='ReleaseRequest',
            entity_id=str(release.id),
            summary=f'Release request submitted for FDR {release.fdr_record.fdr_number}',
        )


class ReleaseRequestDetailView(generics.RetrieveAPIView):
    """View a release request."""
    serializer_class = ReleaseRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = ReleaseRequest.objects.select_related(
            'fdr_record__institution', 'requested_by', 'reviewed_by'
        )
        user = self.request.user
        if user.role == 'institution':
            qs = qs.filter(fdr_record__institution__members__user=user)
        return qs


class ReleaseDecisionView(APIView):
    """Official decision on a release request."""
    permission_classes = [IsOfficialOrAdmin]

    def post(self, request, pk):
        try:
            release = ReleaseRequest.objects.select_related('fdr_record').get(pk=pk)
        except ReleaseRequest.DoesNotExist:
            return Response(
                {'detail': 'Release request not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ReleaseDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']

        # Validate state transition
        if not release.can_transition_to(new_status):
            return Response(
                {'detail': f'Invalid transition from {release.status} to {new_status}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        release.status = new_status
        release.observations = serializer.validated_data.get('observations', '')
        release.reviewed_by = request.user
        release.reviewed_at = timezone.now()

        if new_status == 'approved':
            release.approved_by = request.user
        if new_status == 'completed':
            release.completed_at = timezone.now()
            # Update FDR status
            release.fdr_record.admin_status = 'released'
            release.fdr_record.save()

        release.save()

        # Notify
        Notification.objects.create(
            recipient=release.requested_by,
            notification_type='release_update',
            title=f'Release Request Update - {release.fdr_record.fdr_number}',
            message=f'Release request status: {new_status}. {release.observations}',
            related_fdr=release.fdr_record,
        )

        AuditLog.objects.create(
            user=request.user,
            action='release_decision',
            entity_type='ReleaseRequest',
            entity_id=str(release.id),
            summary=f'Release decision: {new_status} for FDR {release.fdr_record.fdr_number}',
            details={'old_status': release.status, 'new_status': new_status},
        )

        return Response(ReleaseRequestSerializer(release).data)
