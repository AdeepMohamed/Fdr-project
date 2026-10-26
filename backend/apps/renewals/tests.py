from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.institutions.models import Institution, InstitutionMembership
from apps.fdrs.models import FDRRecord
from apps.renewals.models import RenewalRecord

User = get_user_model()


class RenewalWorkflowTests(TestCase):
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
            code='AICTE-TEST-REN',
            status='active'
        )
        InstitutionMembership.objects.create(
            user=self.inst_user, institution=self.inst, role='admin'
        )

        self.old_fdr = FDRRecord.objects.create(
            institution=self.inst,
            created_by=self.inst_user,
            fdr_number='FDR-OLD-001',
            bank_name='State Bank of India',
            amount=Decimal('1000000.00'),
            issue_date=self.today - timezone.timedelta(days=400),
            maturity_date=self.today - timezone.timedelta(days=35),
            verification_status='verified',
            admin_status='matured'
        )

    def test_renewal_creation_and_approval(self):
        # Institution initiates renewal
        self.client.force_authenticate(user=self.inst_user)
        res = self.client.post('/api/v1/renewals/create/', {
            'old_fdr_id': self.old_fdr.id,
            'reason': 'Routine term rollover',
            'fdr_number': 'FDR-NEW-RENEWED-001',
            'bank_name': 'State Bank of India',
            'amount': '1000000.00',
            'issue_date': str(self.today),
            'maturity_date': str(self.today + timezone.timedelta(days=365)),
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        renewal_id = res.data['id']

        # Official approves renewal
        self.client.force_authenticate(user=self.official)
        decision_res = self.client.post(f'/api/v1/renewals/{renewal_id}/decision/', {
            'status': 'approved',
            'observations': 'Rollover endorsed'
        })
        self.assertEqual(decision_res.status_code, status.HTTP_200_OK)
        renewal = RenewalRecord.objects.get(id=renewal_id)
        self.assertEqual(renewal.status, 'approved')
