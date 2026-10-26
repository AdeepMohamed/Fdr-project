import mimetypes
from rest_framework import serializers
from django.conf import settings
from .models import FDRDocument, ExtractedDocumentData


ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
ALLOWED_MIME_TYPES = {
    'application/pdf', 'image/png', 'image/jpeg', 'image/jpg',
}


class ExtractedDocumentDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExtractedDocumentData
        fields = [
            'id', 'extracted_fdr_number', 'extracted_bank_name',
            'extracted_amount', 'extracted_issue_date', 'extracted_maturity_date',
            'extracted_holder_name', 'extraction_confidence',
            'extraction_method', 'extracted_at',
        ]


class FDRDocumentSerializer(serializers.ModelSerializer):
    extracted_data = ExtractedDocumentDataSerializer(read_only=True)
    uploaded_by_name = serializers.CharField(
        source='uploaded_by.get_full_name', read_only=True
    )

    class Meta:
        model = FDRDocument
        fields = [
            'id', 'fdr_record', 'document_type', 'original_filename',
            'file_type', 'file_size', 'mime_type', 'processing_status',
            'processing_error', 'uploaded_by_name', 'created_at',
            'extracted_data',
        ]


class FDRDocumentUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    document_type = serializers.ChoiceField(
        choices=FDRDocument.DocType.choices,
        default='fdr_certificate'
    )

    def validate_file(self, value):
        # Check file size
        max_size = getattr(settings, 'MAX_UPLOAD_SIZE', 10 * 1024 * 1024)
        if value.size > max_size:
            raise serializers.ValidationError(
                f'File size exceeds maximum allowed ({max_size // (1024*1024)}MB).'
            )

        # Check extension
        ext = value.name.rsplit('.', 1)[-1].lower() if '.' in value.name else ''
        if ext not in ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(
                f'File type .{ext} is not supported. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'
            )

        # Check MIME type
        mime_type, _ = mimetypes.guess_type(value.name)
        if mime_type not in ALLOWED_MIME_TYPES:
            raise serializers.ValidationError(
                f'MIME type {mime_type} is not supported.'
            )

        # Check file content magic bytes
        header = value.read(8)
        value.seek(0)

        is_valid = False
        if ext == 'pdf' and header[:4] == b'%PDF':
            is_valid = True
        elif ext == 'png' and header[:8] == b'\x89PNG\r\n\x1a\n':
            is_valid = True
        elif ext in ('jpg', 'jpeg') and header[:2] == b'\xff\xd8':
            is_valid = True

        if not is_valid:
            raise serializers.ValidationError(
                'File content does not match the file extension.'
            )

        return value
