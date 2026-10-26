import csv
from datetime import timedelta
from io import StringIO

from django.db.models import Count, Sum, Q, F
from django.db.models.functions import TruncMonth
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.fdrs.models import FDRRecord
from apps.institutions.models import Institution
from apps.notifications.models import Notification
from apps.renewals.models import RenewalRecord
from apps.releases.models import ReleaseRequest
from apps.verifications.models import Discrepancy


class DashboardSummaryView(APIView):
    """Dashboard summary metrics. Content varies by user role."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        base_qs = FDRRecord.objects.all()
        if user.role == 'institution':
            base_qs = base_qs.filter(institution__members__user=user)

        total_fdrs = base_qs.count()
        active_fdrs = base_qs.filter(admin_status='active').count()
        pending_verification = base_qs.filter(
            verification_status='pending_verification'
        ).count()
        under_review = base_qs.filter(
            verification_status='under_review'
        ).count()
        verified = base_qs.filter(verification_status='verified').count()

        # Maturity metrics
        upcoming_maturity = base_qs.filter(
            maturity_date__gte=today,
            maturity_date__lte=today + timedelta(days=30),
            admin_status='active',
        ).count()
        overdue = base_qs.filter(
            maturity_date__lt=today,
            admin_status='active',
        ).count()
        matured = base_qs.filter(admin_status='matured').count()

        # Financial
        total_amount = base_qs.filter(
            admin_status='active'
        ).aggregate(total=Sum('amount'))['total'] or 0

        data = {
            'total_fdrs': total_fdrs,
            'active_fdrs': active_fdrs,
            'pending_verification': pending_verification,
            'under_review': under_review,
            'verified': verified,
            'upcoming_maturity': upcoming_maturity,
            'overdue': overdue,
            'matured': matured,
            'total_amount': str(total_amount),
        }

        if user.role in ('official', 'admin'):
            data['total_institutions'] = Institution.objects.filter(
                status='active'
            ).count()
            data['pending_renewals'] = RenewalRecord.objects.filter(
                status='submitted'
            ).count()
            data['pending_releases'] = ReleaseRequest.objects.filter(
                status__in=['submitted', 'under_review']
            ).count()
            data['correction_requested'] = base_qs.filter(
                verification_status='correction_requested'
            ).count()
            data['discrepancies'] = Discrepancy.objects.filter(
                discrepancy_type='mismatch',
                review_status='pending'
            ).count()

        if user.role == 'institution':
            data['unread_notifications'] = Notification.objects.filter(
                recipient=user, is_read=False
            ).count()

        return Response(data)


class MaturityReportView(APIView):
    """Upcoming maturity report by month."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        six_months = today + timedelta(days=180)

        base_qs = FDRRecord.objects.filter(
            admin_status='active',
            maturity_date__gte=today,
            maturity_date__lte=six_months,
        )
        if request.user.role == 'institution':
            base_qs = base_qs.filter(
                institution__members__user=request.user
            )

        by_month = base_qs.annotate(
            month=TruncMonth('maturity_date')
        ).values('month').annotate(
            count=Count('id'),
            total_amount=Sum('amount'),
        ).order_by('month')

        return Response(list(by_month))


class StatusDistributionView(APIView):
    """FDR status distribution for charts."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        base_qs = FDRRecord.objects.all()
        if request.user.role == 'institution':
            base_qs = base_qs.filter(
                institution__members__user=request.user
            )

        verification_dist = list(
            base_qs.values('verification_status').annotate(
                count=Count('id')
            ).order_by('verification_status')
        )
        admin_dist = list(
            base_qs.values('admin_status').annotate(
                count=Count('id')
            ).order_by('admin_status')
        )

        return Response({
            'verification_status': verification_dist,
            'admin_status': admin_dist,
        })


class MonthlyTrendsView(APIView):
    """Monthly submission trends."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        base_qs = FDRRecord.objects.all()
        if request.user.role == 'institution':
            base_qs = base_qs.filter(
                institution__members__user=request.user
            )

        trends = list(
            base_qs.annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(
                count=Count('id'),
                total_amount=Sum('amount'),
            ).order_by('-month')[:12]
        )

        return Response(trends)


class ExportCSVView(APIView):
    """Export FDR records as CSV."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        base_qs = FDRRecord.objects.select_related('institution').all()
        if request.user.role == 'institution':
            base_qs = base_qs.filter(
                institution__members__user=request.user
            )

        # Apply filters
        status_filter = request.query_params.get('verification_status')
        if status_filter:
            base_qs = base_qs.filter(verification_status=status_filter)

        institution_filter = request.query_params.get('institution')
        if institution_filter:
            base_qs = base_qs.filter(institution_id=institution_filter)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="fdr_records.csv"'

        writer = csv.writer(response)

        # Headers based on role
        headers = [
            'Record ID', 'FDR Number', 'Institution', 'Bank Name',
            'Amount (INR)', 'Issue Date', 'Maturity Date',
            'Verification Status', 'Administrative Status',
        ]
        writer.writerow(headers)

        for fdr in base_qs[:5000]:  # Limit export size
            writer.writerow([
                str(fdr.record_id),
                fdr.fdr_number,
                fdr.institution.name,
                fdr.bank_name,
                str(fdr.amount),
                fdr.issue_date.isoformat() if fdr.issue_date else '',
                fdr.maturity_date.isoformat() if fdr.maturity_date else '',
                fdr.get_verification_status_display(),
                fdr.get_admin_status_display(),
            ])

        return response
