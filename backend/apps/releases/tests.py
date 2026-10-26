from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.institutions.models import Institution, InstitutionMembership
from apps.fdrs.models import FDRRecord
from apps.releases.models import ReleaseRequest

User = get_user_model()


class ReleaseWorkflowTests(TestCase):
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
            code='AICTE-TEST-REL',
            status='active'
        )
        InstitutionMembership.objects.create(
            user=self.inst_user, institution=self.inst, role='admin'
        )

        self.fdr = FDRRecord.objects.create(
            institution=self.inst,
            created_by=self.inst_user,
            fdr_number='FDR-REL-001',
            bank_name='State Bank of India',
            amount=Decimal('1500000.00'),
            issue_date=self.today - timezone.timedelta(days=600),
            maturity_date=self.today - timezone.timedelta(days=50),
            verification_status='verified',
            admin_status='matured'
        )

    def test_release_workflow(self):
        # Institution requests release
        self.client.force_authenticate(user=self.inst_user)
        res = self.client.post('/api/v1/releases/', {
            'fdr_record': self.fdr.id,
            'reason': 'Course closure approved with complete NOC'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        release_id = res.data['id']

        # Official transitions to under_review
        self.client.force_authenticate(user=self.official)
        decision_res = self.client.post(f'/api/v1/releases/{release_id}/decision/', {
            'status': 'under_review',
            'observations': 'Verifying NOC documents'
        })
        self.assertEqual(decision_res.status_code, status.HTTP_200_OK)
        req = ReleaseRequest.objects.get(id=release_id)
        self.assertEqual(req.status, 'under_review')
