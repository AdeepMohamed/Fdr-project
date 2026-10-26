"""
Discrepancy Detection Service.

Compares institution-submitted data with OCR-extracted data and
applicable validation rules. Generates discrepancy records.

This service does NOT label FDRs as fraudulent — only flags
discrepancies requiring review.
"""
import logging
from decimal import Decimal
from django.utils import timezone
from .models import Discrepancy

logger = logging.getLogger(__name__)


def normalize_string(value):
    """Normalize a string for comparison."""
    if not value:
        return ''
    return ' '.join(str(value).lower().strip().split())


def normalize_amount(value):
    """Normalize currency amounts for comparison."""
    if value is None:
        return None
    try:
        return Decimal(str(value)).quantize(Decimal('0.01'))
    except Exception:
        return None


def normalize_date(value):
    """Normalize date for comparison."""
    if not value:
        return None
    if hasattr(value, 'date'):
        return value.date()
    return value


def compare_field(fdr_record, field_name, submitted_value, extracted_value):
    """Compare a single field and return a Discrepancy if needed."""
    sub_norm = normalize_string(submitted_value) if not isinstance(submitted_value, (Decimal, int, float)) else submitted_value
    ext_norm = normalize_string(extracted_value) if not isinstance(extracted_value, (Decimal, int, float)) else extracted_value

    if not extracted_value and not str(extracted_value).strip() if extracted_value is not None else True:
        return Discrepancy(
            fdr_record=fdr_record,
            field_name=field_name,
            submitted_value=str(submitted_value) if submitted_value else '',
            extracted_value='',
            discrepancy_type='missing_extracted',
        )

    # Numeric comparison for amounts
    if field_name == 'amount':
        sub_amt = normalize_amount(submitted_value)
        ext_amt = normalize_amount(extracted_value)
        if sub_amt and ext_amt:
            if sub_amt == ext_amt:
                return Discrepancy(
                    fdr_record=fdr_record,
                    field_name=field_name,
                    submitted_value=str(submitted_value),
                    extracted_value=str(extracted_value),
                    discrepancy_type='exact_match',
                )
            else:
                return Discrepancy(
                    fdr_record=fdr_record,
                    field_name=field_name,
                    submitted_value=str(submitted_value),
                    extracted_value=str(extracted_value),
                    discrepancy_type='mismatch',
                )

    # Date comparison
    if field_name in ('issue_date', 'maturity_date'):
        sub_date = normalize_date(submitted_value)
        ext_date = normalize_date(extracted_value)
        if sub_date and ext_date:
            if sub_date == ext_date:
                return Discrepancy(
                    fdr_record=fdr_record,
                    field_name=field_name,
                    submitted_value=str(submitted_value),
                    extracted_value=str(extracted_value),
                    discrepancy_type='exact_match',
                )
            else:
                return Discrepancy(
                    fdr_record=fdr_record,
                    field_name=field_name,
                    submitted_value=str(submitted_value),
                    extracted_value=str(extracted_value),
                    discrepancy_type='mismatch',
                )

    # String comparison
    if sub_norm and ext_norm:
        if sub_norm == ext_norm or sub_norm in ext_norm or ext_norm in sub_norm:
            return Discrepancy(
                fdr_record=fdr_record,
                field_name=field_name,
                submitted_value=str(submitted_value),
                extracted_value=str(extracted_value),
                discrepancy_type='exact_match',
            )
        else:
            return Discrepancy(
                fdr_record=fdr_record,
                field_name=field_name,
                submitted_value=str(submitted_value),
                extracted_value=str(extracted_value),
                discrepancy_type='mismatch',
            )

    return None


def detect_discrepancies(fdr_record, extracted_data):
    """
    Compare FDR record submitted data with extracted data.
    Creates Discrepancy records for each field comparison.
    """
    # Clear previous discrepancies for this record (from this extraction)
    Discrepancy.objects.filter(
        fdr_record=fdr_record,
        review_status='pending'
    ).delete()

    discrepancies = []

    field_mappings = [
        ('fdr_number', fdr_record.fdr_number, extracted_data.extracted_fdr_number),
        ('bank_name', fdr_record.bank_name, extracted_data.extracted_bank_name),
        ('amount', fdr_record.amount, extracted_data.extracted_amount),
        ('issue_date', fdr_record.issue_date, extracted_data.extracted_issue_date),
        ('maturity_date', fdr_record.maturity_date, extracted_data.extracted_maturity_date),
    ]

    for field_name, submitted, extracted in field_mappings:
        disc = compare_field(fdr_record, field_name, submitted, extracted)
        if disc:
            discrepancies.append(disc)

    if discrepancies:
        Discrepancy.objects.bulk_create(discrepancies)
        logger.info(
            f"Detected {len(discrepancies)} discrepancy checks for FDR {fdr_record.fdr_number}"
        )

    return discrepancies
