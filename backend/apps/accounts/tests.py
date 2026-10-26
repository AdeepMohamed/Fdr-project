from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class AccountsAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testofficial',
            email='official@aicte.gov.in',
            password='TestPassword@123',
            role=User.Role.OFFICIAL,
            first_name='Priya',
            last_name='Venkatesh'
        )

    def test_jwt_token_obtain(self):
        response = self.client.post('/api/v1/auth/token/', {
            'email': 'official@aicte.gov.in',
            'password': 'TestPassword@123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'official@aicte.gov.in')

    def test_auth_me_endpoint(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], 'official')
        self.assertEqual(response.data['email'], 'official@aicte.gov.in')
