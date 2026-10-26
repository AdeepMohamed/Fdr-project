"""
OCR Processing Pipeline for FDR Documents.

Extraction methods:
1. PyMuPDF text extraction (for text-based PDFs)
2. Tesseract OCR (for scanned documents, if available)
3. Manual entry fallback (when extraction fails)

This module does NOT fabricate values. Missing or uncertain fields
are marked as requiring manual review.
"""
import re
import logging
from datetime import datetime
from decimal import Decimal, InvalidOperation

from django.conf import settings

logger = logging.getLogger(__name__)

# Bank name normalization aliases
BANK_ALIASES = {
    'sbi': 'State Bank of India',
    'state bank': 'State Bank of India',
    'pnb': 'Punjab National Bank',
    'punjab national': 'Punjab National Bank',
    'bob': 'Bank of Baroda',
    'bank of baroda': 'Bank of Baroda',
    'boi': 'Bank of India',
    'bank of india': 'Bank of India',
    'canara': 'Canara Bank',
    'ubi': 'Union Bank of India',
    'union bank': 'Union Bank of India',
    'hdfc': 'HDFC Bank',
    'icici': 'ICICI Bank',
    'axis': 'Axis Bank',
    'kotak': 'Kotak Mahindra Bank',
    'idbi': 'IDBI Bank',
    'central bank': 'Central Bank of India',
    'indian bank': 'Indian Bank',
    'indian overseas': 'Indian Overseas Bank',
    'iob': 'Indian Overseas Bank',
    'uco': 'UCO Bank',
    'syndicate': 'Syndicate Bank',
}

# Date patterns commonly found in Indian bank documents
DATE_PATTERNS = [
    r'(\d{2})[/\-.](\d{2})[/\-.](\d{4})',  # DD/MM/YYYY
    r'(\d{2})[/\-.](\d{2})[/\-.](\d{2})',   # DD/MM/YY
    r'(\d{4})[/\-.](\d{2})[/\-.](\d{2})',   # YYYY/MM/DD
    r'(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})',  # D Mon YYYY
]

MONTH_MAP = {
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
    'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12,
}


def extract_text_from_pdf(file_path):
    """Extract text from PDF using PyMuPDF."""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text() + "\n"
        doc.close()
        return text.strip(), 'pymupdf_text'
    except Exception as e:
        logger.error(f"PyMuPDF extraction failed: {e}")
        return "", 'pymupdf_failed'


def extract_text_with_tesseract(file_path):
    """Extract text using Tesseract OCR (if available)."""
    try:
        import subprocess
        tesseract_cmd = getattr(settings, 'TESSERACT_CMD', 'tesseract')

        # For PDFs, we'd need to convert to images first
        # For images, directly use tesseract
        result = subprocess.run(
            [tesseract_cmd, file_path, 'stdout'],
            capture_output=True, text=True, timeout=60
        )
        if result.returncode == 0:
            return result.stdout.strip(), 'tesseract_ocr'
        else:
            logger.warning(f"Tesseract failed: {result.stderr}")
            return "", 'tesseract_failed'
    except FileNotFoundError:
        logger.info("Tesseract not installed. Manual entry required.")
        return "", 'tesseract_not_available'
    except Exception as e:
        logger.error(f"Tesseract error: {e}")
        return "", 'tesseract_error'


def extract_fdr_number(text):
    """Try to extract FDR/FD number from text."""
    patterns = [
        r'(?:FDR?|FD|Fixed\s+Deposit)\s*(?:No\.?|Number|Ref\.?)\s*[:\-]?\s*([A-Z0-9/\-]+)',
        r'(?:Receipt|Certificate)\s*(?:No\.?|Number)\s*[:\-]?\s*([A-Z0-9/\-]+)',
        r'(?:Deposit)\s*(?:No\.?|Number)\s*[:\-]?\s*([A-Z0-9/\-]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return ""


def extract_bank_name(text):
    """Try to extract bank name from text."""
    # First check for explicit bank name mentions
    bank_pattern = r'([\w\s]+(?:Bank|BANK)(?:\s+(?:of|Of|OF)\s+[\w\s]+)?)'
    match = re.search(bank_pattern, text)
    if match:
        name = match.group(1).strip()
        # Normalize through alias mapping
        name_lower = name.lower()
        for alias, full_name in BANK_ALIASES.items():
            if alias in name_lower:
                return full_name
        return name.title()

    # Check for bank aliases in text
    text_lower = text.lower()
    for alias, full_name in BANK_ALIASES.items():
        if alias in text_lower:
            return full_name

    return ""


def extract_amount(text):
    """Extract monetary amount from text. Handles Indian number formatting."""
    patterns = [
        r'(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{2})?)',
        r'(?:Amount|Principal|Deposit)\s*[:\-]?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{2})?)',
        r'(?:Rupees?)\s+([\w\s]+)\s+(?:Only|only)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            amount_str = match.group(1).replace(',', '').strip()
            try:
                return Decimal(amount_str)
            except (InvalidOperation, ValueError):
                continue
    return None


def parse_date(date_str):
    """Parse a date string in various Indian formats."""
    date_str = date_str.strip()

    # Try DD/MM/YYYY variants
    for fmt in ['%d/%m/%Y', '%d-%m-%Y', '%d.%m.%Y']:
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue

    # Try DD/MM/YY
    for fmt in ['%d/%m/%y', '%d-%m-%y']:
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue

    # Try YYYY-MM-DD
    try:
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        pass

    return None


def extract_dates(text):
    """Extract issue and maturity dates from text."""
    dates = []

    # Look for labeled dates
    issue_patterns = [
        r'(?:Date\s+of\s+(?:Issue|Deposit|Opening))\s*[:\-]?\s*(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})',
        r'(?:Issue\s+Date|Issued\s+on)\s*[:\-]?\s*(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})',
    ]
    maturity_patterns = [
        r'(?:(?:Date\s+of\s+)?Maturity|Due\s+Date|Expiry)\s*[:\-]?\s*(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})',
        r'(?:Maturity\s+Date|Matures?\s+on)\s*[:\-]?\s*(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})',
    ]

    issue_date = None
    maturity_date = None

    for pattern in issue_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            issue_date = parse_date(match.group(1))
            if issue_date:
                break

    for pattern in maturity_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            maturity_date = parse_date(match.group(1))
            if maturity_date:
                break

    # If no labeled dates found, try to extract any dates
    if not issue_date or not maturity_date:
        for pattern in DATE_PATTERNS[:2]:  # DD/MM/YYYY and DD/MM/YY
            for match in re.finditer(pattern, text):
                d = parse_date(match.group(0))
                if d:
                    dates.append(d)

        dates.sort()
        if dates and not issue_date:
            issue_date = dates[0]
        if len(dates) > 1 and not maturity_date:
            maturity_date = dates[-1]

    return issue_date, maturity_date


def process_document(document):
    """
    Main OCR pipeline entry point.
    Processes a document and stores extracted data.
    """
    from .models import ExtractedDocumentData

    file_path = document.file.path
    file_type = document.file_type.lower()

    document.processing_status = 'processing'
    document.save(update_fields=['processing_status'])

    raw_text = ""
    method = "none"
    confidence = {}

    try:
        # Step 1: Try PyMuPDF text extraction for PDFs
        if file_type == 'pdf':
            raw_text, method = extract_text_from_pdf(file_path)

        # Step 2: If no text extracted, try Tesseract
        if not raw_text.strip():
            if file_type in ('png', 'jpeg', 'jpg') or (file_type == 'pdf' and not raw_text.strip()):
                ocr_text, ocr_method = extract_text_with_tesseract(file_path)
                if ocr_text:
                    raw_text = ocr_text
                    method = ocr_method

        # Step 3: Extract structured fields
        if raw_text.strip():
            fdr_number = extract_fdr_number(raw_text)
            bank_name = extract_bank_name(raw_text)
            amount = extract_amount(raw_text)
            issue_date, maturity_date = extract_dates(raw_text)

            # Build confidence scores
            confidence = {
                'fdr_number': 'high' if fdr_number else 'not_found',
                'bank_name': 'high' if bank_name else 'not_found',
                'amount': 'high' if amount else 'not_found',
                'issue_date': 'medium' if issue_date else 'not_found',
                'maturity_date': 'medium' if maturity_date else 'not_found',
            }

            extracted, _ = ExtractedDocumentData.objects.update_or_create(
                document=document,
                defaults={
                    'raw_text': raw_text[:10000],  # Limit stored text
                    'extracted_fdr_number': fdr_number,
                    'extracted_bank_name': bank_name,
                    'extracted_amount': amount,
                    'extracted_issue_date': issue_date,
                    'extracted_maturity_date': maturity_date,
                    'extraction_confidence': confidence,
                    'extraction_method': method,
                }
            )

            document.processing_status = 'completed'
            document.save(update_fields=['processing_status'])

            # Run discrepancy detection
            from apps.verifications.services import detect_discrepancies
            detect_discrepancies(document.fdr_record, extracted)

            return extracted

        else:
            # No text could be extracted
            ExtractedDocumentData.objects.update_or_create(
                document=document,
                defaults={
                    'raw_text': '',
                    'extraction_confidence': {'overall': 'extraction_failed'},
                    'extraction_method': method,
                }
            )
            document.processing_status = 'manual_required'
            document.processing_error = (
                'Could not extract text from the document. '
                'Manual data entry is required.'
            )
            document.save(update_fields=['processing_status', 'processing_error'])
            return None

    except Exception as e:
        logger.error(f"Document processing failed: {e}")
        document.processing_status = 'failed'
        document.processing_error = str(e)
        document.save(update_fields=['processing_status', 'processing_error'])
        return None
