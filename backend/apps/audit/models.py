from django.db import models
from django.conf import settings


class AuditLog(models.Model):
    """Append-only audit trail for important actions."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, related_name='audit_logs'
    )
    action = models.CharField(max_length=100, db_index=True)
    entity_type = models.CharField(max_length=50, db_index=True)
    entity_id = models.CharField(max_length=100, db_index=True)
    summary = models.TextField()
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']
        # Prevent modification through normal ORM
        indexes = [
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['user', 'action']),
        ]

    def __str__(self):
        user_str = self.user.email if self.user else 'System'
        return f"[{self.created_at}] {user_str}: {self.action} on {self.entity_type}"

    def save(self, *args, **kwargs):
        # Only allow creation, not updates (append-only)
        if self.pk and AuditLog.objects.filter(pk=self.pk).exists():
            return  # Silently prevent updates
        super().save(*args, **kwargs)
