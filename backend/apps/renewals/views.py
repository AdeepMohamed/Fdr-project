from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import RenewalRecord
from .serializers import (
    RenewalRecordSerializer,
    RenewalCreateSerializer,
    RenewalDecisionSerializer,
)
from apps.fdrs.models import FDRRecord
from apps.accounts.permissions import IsOfficialOrAdmin
from apps.audit.models import AuditLog
from apps.notifications.models import Notification


class RenewalListView(generics.ListAPIView):
    """List renewal records."""
    serializer_class = RenewalRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = RenewalRecord.objects.select_related(
            'old_fdr', 'new_fdr', 'submitted_by', 'reviewed_by'
        )
        user = self.request.user
        if user.role == 'institution':
            qs = qs.filter(
                old_fdr__institution__members__user=user
            )
        return qs


class RenewalCreateView(APIView):
    """Submit a renewal for an existing FDR."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = RenewalCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            old_fdr = FDRRecord.objects.get(pk=data['old_fdr_id'])
        except FDRRecord.DoesNotExist:
            return Response(
                {'detail': 'Original FDR not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check permission
        if request.user.role == 'institution':
            if not old_fdr.institution.members.filter(user=request.user).exists():
                return Response(
                    {'detail': 'Access denied.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Create new FDR record linked to old one
        new_fdr = FDRRecord.objects.create(
            institution=old_fdr.institution,
            created_by=request.user,
            fdr_number=data['fdr_number'],
            bank_name=data['bank_name'],
            branch_name=data.get('branch_name', ''),
            amount=data['amount'],
            currency=old_fdr.currency,
            issue_date=data['issue_date'],
            maturity_date=data['maturity_date'],
            instrument_type=data.get('instrument_type', 'fdr'),
            previous_fdr=old_fdr,
            renewal_count=old_fdr.renewal_count + 1,
            verification_status='pending_verification',
            submitted_at=timezone.now(),
        )

        # Create renewal record
        renewal = RenewalRecord.objects.create(
            old_fdr=old_fdr,
            new_fdr=new_fdr,
            submitted_by=request.user,
            reason=data.get('reason', ''),
        )

        # Update old FDR status
        old_fdr.admin_status = 'renewed'
        old_fdr.save()

        AuditLog.objects.create(
            user=request.user,
            action='renewal_submitted',
            entity_type='RenewalRecord',
            entity_id=str(renewal.id),
            summary=f'Renewal submitted: {old_fdr.fdr_number} -> {new_fdr.fdr_number}',
        )

        return Response(
            RenewalRecordSerializer(renewal).data,
            status=status.HTTP_201_CREATED
        )


class RenewalDecisionView(APIView):
    """Official decision on a renewal."""
    permission_classes = [IsOfficialOrAdmin]

    def post(self, request, pk):
        try:
            renewal = RenewalRecord.objects.select_related(
                'old_fdr', 'new_fdr'
            ).get(pk=pk)
        except RenewalRecord.DoesNotExist:
            return Response(
                {'detail': 'Renewal record not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = RenewalDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        renewal.status = serializer.validated_data['status']
        renewal.observations = serializer.validated_data.get('observations', '')
        renewal.reviewed_by = request.user
        renewal.reviewed_at = timezone.now()
        renewal.save()

        # Notify submitter
        Notification.objects.create(
            recipient=renewal.submitted_by,
            notification_type='verification_update',
            title=f'Renewal Update - {renewal.old_fdr.fdr_number}',
            message=f'Renewal status: {renewal.status}. {renewal.observations}',
            related_fdr=renewal.new_fdr,
        )

        AuditLog.objects.create(
            user=request.user,
            action='renewal_decision',
            entity_type='RenewalRecord',
            entity_id=str(renewal.id),
            summary=f'Renewal decision: {renewal.status}',
        )

        return Response(RenewalRecordSerializer(renewal).data)
