from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.core.management import call_command

from apps.notifications.models import Notification

User = get_user_model()


class NotificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='user@test.edu.in',
            password='Password@123',
            role=User.Role.INSTITUTION
        )
        self.notif1 = Notification.objects.create(
            recipient=self.user,
            notification_type=Notification.NotificationType.MATURITY_REMINDER,
            title='Test Reminder 1',
            message='Your FDR will mature in 15 days.',
            is_read=False
        )
        self.notif2 = Notification.objects.create(
            recipient=self.user,
            notification_type=Notification.NotificationType.SYSTEM,
            title='Test System Notification',
            message='System maintenance scheduled.',
            is_read=False
        )

    def test_unread_count(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/notifications/count/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['unread_count'], 2)

    def test_mark_all_read(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/v1/notifications/mark-all-read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Notification.objects.filter(recipient=self.user, is_read=False).count(), 0)

    def test_check_maturities_command_runs(self):
        # Call management command
        call_command('check_maturities')
