from django.utils import timezone
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Discrepancy, VerificationRecord
from .serializers import (
    DiscrepancySerializer,
    VerificationRecordSerializer,
    VerificationDecisionSerializer,
    CorrectionRequestSerializer,
)
from apps.fdrs.models import FDRRecord
from apps.accounts.permissions import IsOfficialOrAdmin
from apps.audit.models import AuditLog
from apps.notifications.models import Notification


class DiscrepancyListView(generics.ListAPIView):
    """List discrepancies, optionally filtered by FDR record."""
    serializer_class = DiscrepancySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Discrepancy.objects.select_related('fdr_record', 'reviewed_by')
        fdr_id = self.request.query_params.get('fdr_id')
        if fdr_id:
            qs = qs.filter(fdr_record_id=fdr_id)
        user = self.request.user
        if user.role == 'institution':
            qs = qs.filter(fdr_record__institution__members__user=user)
        return qs


class VerificationDecisionView(APIView):
    """Official submits a verification decision for an FDR."""
    permission_classes = [IsOfficialOrAdmin]

    def post(self, request, fdr_id):
        try:
            fdr = FDRRecord.objects.get(pk=fdr_id)
        except FDRRecord.DoesNotExist:
            return Response(
                {'detail': 'FDR record not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Prevent institution users from verifying
        if request.user.role == 'institution':
            return Response(
                {'detail': 'Institution users cannot verify records.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = VerificationDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        outcome = serializer.validated_data['outcome']
        observations = serializer.validated_data.get('observations', '')
        correction_fields = serializer.validated_data.get('correction_fields', [])

        # Create verification record
        record = VerificationRecord.objects.create(
            fdr_record=fdr,
            reviewer=request.user,
            outcome=outcome,
            observations=observations,
            correction_fields=correction_fields,
        )

        # Update FDR status based on outcome
        status_map = {
            'verified': 'verified',
            'correction_requested': 'correction_requested',
            'rejected': 'rejected',
            'additional_docs': 'under_review',
        }
        fdr.verification_status = status_map.get(outcome, 'under_review')
        if outcome == 'verified':
            fdr.verified_at = timezone.now()
        fdr.save()

        # Notify the institution
        Notification.objects.create(
            recipient=fdr.created_by,
            notification_type='verification_update',
            title=f'FDR {fdr.fdr_number} - Verification Update',
            message=f'Your FDR {fdr.fdr_number} has been reviewed. Outcome: {outcome}. {observations}',
            related_fdr=fdr,
        )

        # Audit log
        AuditLog.objects.create(
            user=request.user,
            action='verification_decision',
            entity_type='FDRRecord',
            entity_id=str(fdr.id),
            summary=f'Verification decision: {outcome} for FDR {fdr.fdr_number}',
            details={'outcome': outcome, 'observations': observations},
        )

        return Response(
            VerificationRecordSerializer(record).data,
            status=status.HTTP_201_CREATED
        )


class CorrectionRequestView(APIView):
    """Official requests corrections on an FDR."""
    permission_classes = [IsOfficialOrAdmin]

    def post(self, request, fdr_id):
        try:
            fdr = FDRRecord.objects.get(pk=fdr_id)
        except FDRRecord.DoesNotExist:
            return Response(
                {'detail': 'FDR record not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CorrectionRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        observations = serializer.validated_data['observations']
        correction_fields = serializer.validated_data['correction_fields']

        # Create verification record
        VerificationRecord.objects.create(
            fdr_record=fdr,
            reviewer=request.user,
            outcome='correction_requested',
            observations=observations,
            correction_fields=correction_fields,
        )

        fdr.verification_status = 'correction_requested'
        fdr.save()

        # Notify institution
        Notification.objects.create(
            recipient=fdr.created_by,
            notification_type='correction_request',
            title=f'Correction Required - FDR {fdr.fdr_number}',
            message=f'Corrections needed for FDR {fdr.fdr_number}: {observations}',
            related_fdr=fdr,
        )

        AuditLog.objects.create(
            user=request.user,
            action='correction_requested',
            entity_type='FDRRecord',
            entity_id=str(fdr.id),
            summary=f'Correction requested for FDR {fdr.fdr_number}',
        )

        return Response({'detail': 'Correction requested.'}, status=status.HTTP_200_OK)
