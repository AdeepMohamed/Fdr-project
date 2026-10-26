from django.db import models
from django.conf import settings


class Notification(models.Model):
    """In-app notification for users."""

    class NotificationType(models.TextChoices):
        MATURITY_REMINDER = 'maturity_reminder', 'Maturity Reminder'
        VERIFICATION_UPDATE = 'verification_update', 'Verification Update'
        CORRECTION_REQUEST = 'correction_request', 'Correction Request'
        RENEWAL_REMINDER = 'renewal_reminder', 'Renewal Reminder'
        OVERDUE_FOLLOWUP = 'overdue_followup', 'Overdue Follow-up'
        RELEASE_UPDATE = 'release_update', 'Release Request Update'
        SYSTEM = 'system', 'System Notification'

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=30, choices=NotificationType.choices
    )
    title = models.CharField(max_length=300)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    related_fdr = models.ForeignKey(
        'fdrs.FDRRecord', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='notifications'
    )
    email_sent = models.BooleanField(default=False)
    email_error = models.TextField(blank=True)
    # Prevent duplicate reminders
    reminder_key = models.CharField(
        max_length=200, blank=True, db_index=True,
        help_text='Unique key to prevent duplicate notifications'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['reminder_key']),
        ]

    def __str__(self):
        return f"[{self.notification_type}] {self.title}"
