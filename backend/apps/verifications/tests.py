from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.institutions.models import Institution, InstitutionMembership
from apps.fdrs.models import FDRRecord
from apps.verifications.models import Discrepancy
from apps.verifications.services import compare_field

User = get_user_model()


class VerificationDiscrepancyTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.today = timezone.now().date()

        self.official = User.objects.create_user(
            username='official',
            email='official@aicte.gov.in',
            password='Password@123',
            role=User.Role.OFFICIAL
        )

        self.inst_user = User.objects.create_user(
            username='inst_user',
            email='rep@inst.edu.in',
            password='Password@123',
            role=User.Role.INSTITUTION
        )

        self.inst = Institution.objects.create(
            name='Test Institute',
            code='AICTE-TEST-01',
            status='active'
        )
        InstitutionMembership.objects.create(
            user=self.inst_user, institution=self.inst, role='admin'
        )

        self.fdr = FDRRecord.objects.create(
            institution=self.inst,
            created_by=self.inst_user,
            fdr_number='FDR-VERIFY-001',
            bank_name='State Bank of India',
            amount=Decimal('2000000.00'),
            issue_date=self.today,
            maturity_date=self.today + timezone.timedelta(days=365),
            verification_status='pending_verification',
            admin_status='active'
        )

    def test_amount_mismatch_detection(self):
        """Discrepancy engine flags amount mismatch."""
        disc = compare_field(self.fdr, 'amount', Decimal('2000000.00'), Decimal('1950000.00'))
        self.assertIsNotNone(disc)
        self.assertEqual(disc.discrepancy_type, 'mismatch')

    def test_amount_exact_match(self):
        """Discrepancy engine confirms exact match for identical amounts."""
        disc = compare_field(self.fdr, 'amount', Decimal('2000000.00'), Decimal('2000000.00'))
        self.assertIsNotNone(disc)
        self.assertEqual(disc.discrepancy_type, 'exact_match')

    def test_official_verification_decision_approved(self):
        """Official can approve and mark FDR as verified."""
        self.client.force_authenticate(user=self.official)
        response = self.client.post(f'/api/v1/verifications/decision/{self.fdr.id}/', {
            'outcome': 'verified',
            'observations': 'Verified against bank stamp'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.fdr.refresh_from_db()
        self.assertEqual(self.fdr.verification_status, 'verified')
        self.assertIsNotNone(self.fdr.verified_at)

    def test_institution_user_cannot_verify(self):
        """Institution user is forbidden from approving verification."""
        self.client.force_authenticate(user=self.inst_user)
        response = self.client.post(f'/api/v1/verifications/decision/{self.fdr.id}/', {
            'outcome': 'verified',
            'observations': 'Attempt by institution'
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
