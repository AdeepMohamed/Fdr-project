from django.utils import timezone
from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from .models import FDRRecord
from .serializers import (
    FDRRecordListSerializer,
    FDRRecordDetailSerializer,
    FDRRecordCreateSerializer,
)
from apps.accounts.permissions import IsOwnerOrOfficial, IsOfficialOrAdmin


class FDRRecordFilter(django_filters.FilterSet):
    """Filters for FDR records."""
    min_amount = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    max_amount = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')
    maturity_from = django_filters.DateFilter(field_name='maturity_date', lookup_expr='gte')
    maturity_to = django_filters.DateFilter(field_name='maturity_date', lookup_expr='lte')
    issue_from = django_filters.DateFilter(field_name='issue_date', lookup_expr='gte')
    issue_to = django_filters.DateFilter(field_name='issue_date', lookup_expr='lte')

    class Meta:
        model = FDRRecord
        fields = [
            'institution', 'bank_name', 'verification_status',
            'admin_status', 'instrument_type',
        ]


class FDRRecordListCreateView(generics.ListCreateAPIView):
    """List FDR records or create a new one."""
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = FDRRecordFilter
    search_fields = ['fdr_number', 'bank_name', 'institution__name', 'reference_number']
    ordering_fields = ['created_at', 'maturity_date', 'amount', 'fdr_number']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FDRRecordCreateSerializer
        return FDRRecordListSerializer

    def get_queryset(self):
        user = self.request.user
        qs = FDRRecord.objects.select_related('institution', 'created_by')
        if user.role == 'institution':
            qs = qs.filter(institution__members__user=user)
        return qs


class FDRRecordDetailView(generics.RetrieveUpdateAPIView):
    """View or update an FDR record."""
    serializer_class = FDRRecordDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrOfficial]

    def get_queryset(self):
        return FDRRecord.objects.select_related(
            'institution', 'created_by', 'previous_fdr'
        ).prefetch_related(
            'documents', 'discrepancies', 'verification_records'
        )

    def perform_update(self, serializer):
        fdr = self.get_object()
        # Prevent editing after verification unless correction requested
        if fdr.verification_status == 'verified':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                'Cannot edit a verified record. Request a correction workflow.'
            )
        serializer.save()


class FDRSubmitView(APIView):
    """Submit an FDR for official review."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            fdr = FDRRecord.objects.get(pk=pk)
        except FDRRecord.DoesNotExist:
            return Response(
                {'detail': 'FDR record not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check permission
        if request.user.role == 'institution':
            if not fdr.institution.members.filter(user=request.user).exists():
                return Response(
                    {'detail': 'You do not have access to this record.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Validate transition
        allowed_from = ['draft', 'correction_requested']
        if fdr.verification_status not in allowed_from:
            return Response(
                {'detail': f'Cannot submit from status: {fdr.verification_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        fdr.verification_status = 'pending_verification'
        fdr.submitted_at = timezone.now()
        fdr.save()

        # Create audit log
        from apps.audit.models import AuditLog
        AuditLog.objects.create(
            user=request.user,
            action='fdr_submitted',
            entity_type='FDRRecord',
            entity_id=str(fdr.id),
            summary=f'FDR {fdr.fdr_number} submitted for verification',
        )

        return Response(
            FDRRecordDetailSerializer(fdr).data,
            status=status.HTTP_200_OK
        )
