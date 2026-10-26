from django.db import models
from django.conf import settings


class ReleaseRequest(models.Model):
    """Request to release/refund an FDR security deposit."""

    class Status(models.TextChoices):
        SUBMITTED = 'submitted', 'Submitted'
        UNDER_REVIEW = 'under_review', 'Under Review'
        ADDITIONAL_DOCS = 'additional_docs', 'Additional Documents Required'
        RECOMMENDED = 'recommended', 'Recommended'
        APPROVED = 'approved', 'Approved by Competent Authority'
        REJECTED = 'rejected', 'Rejected'
        COMPLETED = 'completed', 'Completed'

    fdr_record = models.ForeignKey(
        'fdrs.FDRRecord', on_delete=models.PROTECT,
        related_name='release_requests'
    )
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
        related_name='release_requests_submitted'
    )
    reason = models.TextField()
    status = models.CharField(
        max_length=30, choices=Status.choices, default=Status.SUBMITTED
    )
    observations = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='release_requests_reviewed'
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='release_requests_approved'
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'release_requests'
        ordering = ['-submitted_at']

    def __str__(self):
        return f"Release: {self.fdr_record.fdr_number} ({self.status})"

    # Valid state transitions
    VALID_TRANSITIONS = {
        'submitted': ['under_review', 'rejected'],
        'under_review': ['additional_docs', 'recommended', 'rejected'],
        'additional_docs': ['under_review', 'rejected'],
        'recommended': ['approved', 'rejected'],
        'approved': ['completed'],
    }

    def can_transition_to(self, new_status):
        allowed = self.VALID_TRANSITIONS.get(self.status, [])
        return new_status in allowed
