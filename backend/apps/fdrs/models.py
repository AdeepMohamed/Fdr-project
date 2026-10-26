import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal


class FDRRecord(models.Model):
    """Core model representing a Fixed Deposit Receipt record."""

    class VerificationStatus(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PENDING = 'pending_verification', 'Pending Verification'
        UNDER_REVIEW = 'under_review', 'Under Review'
        CORRECTION_REQUESTED = 'correction_requested', 'Correction Requested'
        VERIFIED = 'verified', 'Verified'
        REJECTED = 'rejected', 'Rejected'

    class AdminStatus(models.TextChoices):
        ACTIVE = 'active', 'Active'
        MATURED = 'matured', 'Matured'
        RENEWED = 'renewed', 'Renewed'
        RELEASED = 'released', 'Released'
        EXPIRED = 'expired', 'Expired'

    class InstrumentType(models.TextChoices):
        FDR = 'fdr', 'Fixed Deposit Receipt'
        BG = 'bg', 'Bank Guarantee'
        TDR = 'tdr', 'Term Deposit Receipt'

    # Internal tracking
    record_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    institution = models.ForeignKey(
        'institutions.Institution', on_delete=models.PROTECT,
        related_name='fdr_records'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
        related_name='created_fdrs'
    )

    # Institution-submitted data
    fdr_number = models.CharField(max_length=100)
    bank_name = models.CharField(max_length=200)
    branch_name = models.CharField(max_length=200, blank=True)
    branch_address = models.TextField(blank=True)
    branch_ifsc = models.CharField(max_length=20, blank=True)
    amount = models.DecimalField(
        max_digits=15, decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = models.CharField(max_length=5, default='INR')
    issue_date = models.DateField()
    maturity_date = models.DateField()
    interest_rate = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    instrument_type = models.CharField(
        max_length=10, choices=InstrumentType.choices, default=InstrumentType.FDR
    )
    reference_number = models.CharField(
        max_length=100, blank=True,
        help_text='AICTE application or approval reference number'
    )
    remarks = models.TextField(blank=True)

    # Status tracking
    verification_status = models.CharField(
        max_length=30, choices=VerificationStatus.choices,
        default=VerificationStatus.DRAFT
    )
    admin_status = models.CharField(
        max_length=20, choices=AdminStatus.choices, default=AdminStatus.ACTIVE
    )

    # Renewal chain
    previous_fdr = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.SET_NULL,
        related_name='renewed_by'
    )
    renewal_count = models.PositiveIntegerField(default=0)

    # Timestamps
    submitted_at = models.DateTimeField(null=True, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'fdr_records'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['fdr_number']),
            models.Index(fields=['bank_name']),
            models.Index(fields=['maturity_date']),
            models.Index(fields=['verification_status']),
            models.Index(fields=['admin_status']),
            models.Index(fields=['institution', 'verification_status']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['fdr_number', 'bank_name'],
                name='unique_fdr_per_bank',
                condition=models.Q(admin_status__in=['active', 'matured']),
            )
        ]

    def __str__(self):
        return f"FDR {self.fdr_number} - {self.bank_name} - ₹{self.amount}"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.maturity_date and self.issue_date:
            if self.maturity_date <= self.issue_date:
                raise ValidationError({
                    'maturity_date': 'Maturity date must be after issue date.'
                })

    @property
    def days_to_maturity(self):
        from django.utils import timezone
        if self.maturity_date:
            delta = self.maturity_date - timezone.now().date()
            return delta.days
        return None

    @property
    def is_matured(self):
        days = self.days_to_maturity
        return days is not None and days <= 0

    @property
    def formatted_amount(self):
        """Format amount in Indian numbering system."""
        amount_str = str(int(self.amount))
        if len(amount_str) <= 3:
            return f"₹{amount_str}"
        last_three = amount_str[-3:]
        remaining = amount_str[:-3]
        # Add commas every 2 digits for remaining
        parts = []
        while remaining:
            parts.insert(0, remaining[-2:])
            remaining = remaining[:-2]
        return f"₹{','.join(parts)},{last_three}"
