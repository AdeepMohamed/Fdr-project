from datetime import timedelta
from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.institutions.models import Institution, InstitutionMembership
from apps.fdrs.models import FDRRecord

User = get_user_model()


class FDRRecordTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.today = timezone.now().date()

        # Official user
        self.official = User.objects.create_user(
            username='official',
            email='official@aicte.gov.in',
            password='Password@123',
            role=User.Role.OFFICIAL
        )

        # Institution 1 & User
        self.inst1_user = User.objects.create_user(
            username='inst1_rep',
            email='rep@inst1.edu.in',
            password='Password@123',
            role=User.Role.INSTITUTION
        )
        self.inst1 = Institution.objects.create(
            name='College of Engineering Delhi',
            code='AICTE-DL-001',
            status='active'
        )
        InstitutionMembership.objects.create(
            user=self.inst1_user, institution=self.inst1, role='admin'
        )

        # Institution 2 & User
        self.inst2_user = User.objects.create_user(
            username='inst2_rep',
            email='rep@inst2.edu.in',
            password='Password@123',
            role=User.Role.INSTITUTION
        )
        self.inst2 = Institution.objects.create(
            name='Pune Institute of Technology',
            code='AICTE-MH-002',
            status='active'
        )
        InstitutionMembership.objects.create(
            user=self.inst2_user, institution=self.inst2, role='admin'
        )

        # Create FDR for Inst 1
        self.fdr1 = FDRRecord.objects.create(
            institution=self.inst1,
            created_by=self.inst1_user,
            fdr_number='FDR-TEST-001',
            bank_name='State Bank of India',
            amount=Decimal('5000000.00'),
            issue_date=self.today - timedelta(days=100),
            maturity_date=self.today + timedelta(days=265),
            verification_status='draft',
            admin_status='active'
        )

        # Create FDR for Inst 2
        self.fdr2 = FDRRecord.objects.create(
            institution=self.inst2,
            created_by=self.inst2_user,
            fdr_number='FDR-TEST-002',
            bank_name='HDFC Bank',
            amount=Decimal('2500000.00'),
            issue_date=self.today - timedelta(days=50),
            maturity_date=self.today + timedelta(days=315),
            verification_status='verified',
            admin_status='active'
        )

    def test_institution_isolation_queryset(self):
        """Institution user 1 should only see their own FDRs, not Institution 2's."""
        self.client.force_authenticate(user=self.inst1_user)
        response = self.client.get('/api/v1/fdrs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        fdr_numbers = [r['fdr_number'] for r in results]
        self.assertIn('FDR-TEST-001', fdr_numbers)
        self.assertNotIn('FDR-TEST-002', fdr_numbers)

    def test_official_can_see_all_fdrs(self):
        """Official user should see FDRs across all institutions."""
        self.client.force_authenticate(user=self.official)
        response = self.client.get('/api/v1/fdrs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        fdr_numbers = [r['fdr_number'] for r in results]
        self.assertIn('FDR-TEST-001', fdr_numbers)
        self.assertIn('FDR-TEST-002', fdr_numbers)

    def test_submit_fdr_workflow(self):
        """Institution user can submit draft FDR for verification."""
        self.client.force_authenticate(user=self.inst1_user)
        response = self.client.post(f'/api/v1/fdrs/{self.fdr1.id}/submit/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.fdr1.refresh_from_db()
        self.assertEqual(self.fdr1.verification_status, 'pending_verification')
        self.assertIsNotNone(self.fdr1.submitted_at)
