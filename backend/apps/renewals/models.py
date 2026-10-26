from django.db import models
from django.conf import settings


class RenewalRecord(models.Model):
    """Renewal/replacement of an FDR with a new instrument."""

    class Status(models.TextChoices):
        SUBMITTED = 'submitted', 'Submitted'
        UNDER_REVIEW = 'under_review', 'Under Review'
        CORRECTION_REQUESTED = 'correction_requested', 'Correction Requested'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    old_fdr = models.ForeignKey(
        'fdrs.FDRRecord', on_delete=models.PROTECT,
        related_name='renewal_records'
    )
    new_fdr = models.ForeignKey(
        'fdrs.FDRRecord', on_delete=models.PROTECT,
        related_name='renewal_source', null=True, blank=True
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
        related_name='submitted_renewals'
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='reviewed_renewals'
    )
    status = models.CharField(
        max_length=30, choices=Status.choices, default=Status.SUBMITTED
    )
    reason = models.TextField(blank=True)
    observations = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'renewal_records'
        ordering = ['-submitted_at']

    def __str__(self):
        return f"Renewal: {self.old_fdr.fdr_number} -> {self.new_fdr.fdr_number if self.new_fdr else 'Pending'}"
