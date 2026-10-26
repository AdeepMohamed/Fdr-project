from django.db import models
from django.conf import settings


class Discrepancy(models.Model):
    """Detected discrepancy between submitted and extracted data."""

    class DiscrepancyType(models.TextChoices):
        EXACT_MATCH = 'exact_match', 'Exact Match'
        MISMATCH = 'mismatch', 'Mismatch'
        MISSING_EXTRACTED = 'missing_extracted', 'Missing Extracted Value'
        AMBIGUOUS_OCR = 'ambiguous_ocr', 'Ambiguous OCR Value'
        REQUIRES_VERIFICATION = 'requires_verification', 'Requires External Verification'

    class ReviewStatus(models.TextChoices):
        PENDING = 'pending', 'Pending Review'
        REVIEWED = 'reviewed', 'Reviewed'
        RESOLVED = 'resolved', 'Resolved'
        ACCEPTED = 'accepted', 'Accepted as Correct'

    fdr_record = models.ForeignKey(
        'fdrs.FDRRecord', on_delete=models.CASCADE, related_name='discrepancies'
    )
    field_name = models.CharField(max_length=50)
    submitted_value = models.CharField(max_length=500, blank=True)
    extracted_value = models.CharField(max_length=500, blank=True)
    discrepancy_type = models.CharField(
        max_length=30, choices=DiscrepancyType.choices
    )
    review_status = models.CharField(
        max_length=20, choices=ReviewStatus.choices, default=ReviewStatus.PENDING
    )
    reviewer_observations = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='reviewed_discrepancies'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'discrepancies'
        ordering = ['-created_at']
        verbose_name_plural = 'Discrepancies'

    def __str__(self):
        return f"{self.field_name}: {self.discrepancy_type} for FDR {self.fdr_record.fdr_number}"


class VerificationRecord(models.Model):
    """Official verification/review entry for an FDR record."""

    class Outcome(models.TextChoices):
        VERIFIED = 'verified', 'Verified'
        CORRECTION_REQUESTED = 'correction_requested', 'Correction Requested'
        REJECTED = 'rejected', 'Rejected'
        ADDITIONAL_DOCS = 'additional_docs', 'Additional Documents Required'

    fdr_record = models.ForeignKey(
        'fdrs.FDRRecord', on_delete=models.CASCADE,
        related_name='verification_records'
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
        related_name='verification_reviews'
    )
    outcome = models.CharField(max_length=30, choices=Outcome.choices)
    observations = models.TextField(blank=True)
    correction_fields = models.JSONField(
        default=list, blank=True,
        help_text='List of fields requiring correction'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'verification_records'
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.reviewer.email}: {self.outcome}"
