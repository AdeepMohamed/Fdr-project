import uuid
import os
from django.db import models
from django.conf import settings


def document_upload_path(instance, filename):
    """Generate a unique storage path for uploaded documents."""
    ext = os.path.splitext(filename)[1].lower()
    unique_name = f"{uuid.uuid4().hex}{ext}"
    return f"documents/{instance.fdr_record.institution.code}/{unique_name}"


class FDRDocument(models.Model):
    """Uploaded document associated with an FDR record."""

    class DocType(models.TextChoices):
        FDR_CERTIFICATE = 'fdr_certificate', 'FDR Certificate'
        BANK_LETTER = 'bank_letter', 'Bank Letter'
        RENEWAL_PROOF = 'renewal_proof', 'Renewal Proof'
        RELEASE_REQUEST = 'release_request', 'Release Request Document'
        SUPPORTING = 'supporting', 'Supporting Document'

    class ProcessingStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'
        MANUAL_REQUIRED = 'manual_required', 'Manual Entry Required'

    fdr_record = models.ForeignKey(
        'fdrs.FDRRecord', on_delete=models.CASCADE, related_name='documents'
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT
    )
    file = models.FileField(upload_to=document_upload_path)
    original_filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=10)  # pdf, png, jpeg
    file_size = models.PositiveIntegerField()  # bytes
    mime_type = models.CharField(max_length=100)
    document_type = models.CharField(
        max_length=30, choices=DocType.choices, default=DocType.FDR_CERTIFICATE
    )
    processing_status = models.CharField(
        max_length=20, choices=ProcessingStatus.choices,
        default=ProcessingStatus.PENDING
    )
    processing_error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'fdr_documents'
        ordering = ['-created_at']

    def __str__(self):
        return f"Doc: {self.original_filename} for FDR {self.fdr_record.fdr_number}"


class ExtractedDocumentData(models.Model):
    """OCR-extracted data from an uploaded document."""

    document = models.OneToOneField(
        FDRDocument, on_delete=models.CASCADE, related_name='extracted_data'
    )
    raw_text = models.TextField(blank=True)
    extracted_fdr_number = models.CharField(max_length=100, blank=True)
    extracted_bank_name = models.CharField(max_length=200, blank=True)
    extracted_amount = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True
    )
    extracted_issue_date = models.DateField(null=True, blank=True)
    extracted_maturity_date = models.DateField(null=True, blank=True)
    extracted_holder_name = models.CharField(max_length=300, blank=True)
    extraction_confidence = models.JSONField(
        default=dict, blank=True,
        help_text='Per-field confidence scores'
    )
    extraction_method = models.CharField(
        max_length=50, blank=True,
        help_text='Method used: pymupdf_text, tesseract_ocr, manual'
    )
    extracted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'extracted_document_data'

    def __str__(self):
        return f"Extracted data for {self.document.original_filename}"
