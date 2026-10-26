import mimetypes
from django.http import FileResponse, Http404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser

from .models import FDRDocument
from .serializers import FDRDocumentSerializer, FDRDocumentUploadSerializer
from .ocr_service import process_document
from apps.fdrs.models import FDRRecord
from apps.audit.models import AuditLog


class DocumentUploadView(APIView):
    """Upload a document for an FDR record and trigger OCR processing."""
    parser_classes = [MultiPartParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, fdr_id):
        try:
            fdr = FDRRecord.objects.get(pk=fdr_id)
        except FDRRecord.DoesNotExist:
            return Response(
                {'detail': 'FDR record not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check permission
        if request.user.role == 'institution':
            if not fdr.institution.members.filter(user=request.user).exists():
                return Response(
                    {'detail': 'You do not have access to this record.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        serializer = FDRDocumentUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']
        ext = file.name.rsplit('.', 1)[-1].lower()
        mime_type, _ = mimetypes.guess_type(file.name)

        doc = FDRDocument.objects.create(
            fdr_record=fdr,
            uploaded_by=request.user,
            file=file,
            original_filename=file.name,
            file_type=ext,
            file_size=file.size,
            mime_type=mime_type or 'application/octet-stream',
            document_type=serializer.validated_data['document_type'],
        )

        # Log the upload
        AuditLog.objects.create(
            user=request.user,
            action='document_uploaded',
            entity_type='FDRDocument',
            entity_id=str(doc.id),
            summary=f'Document "{file.name}" uploaded for FDR {fdr.fdr_number}',
        )

        # Process document (OCR extraction)
        process_document(doc)

        # Refresh from DB after processing
        doc.refresh_from_db()

        return Response(
            FDRDocumentSerializer(doc).data,
            status=status.HTTP_201_CREATED
        )


class DocumentListView(generics.ListAPIView):
    """List documents for an FDR record."""
    serializer_class = FDRDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        fdr_id = self.kwargs.get('fdr_id')
        user = self.request.user
        qs = FDRDocument.objects.filter(fdr_record_id=fdr_id).select_related(
            'uploaded_by', 'extracted_data'
        )
        if user.role == 'institution':
            qs = qs.filter(fdr_record__institution__members__user=user)
        return qs


class DocumentDownloadView(APIView):
    """Securely serve a document file."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            doc = FDRDocument.objects.select_related('fdr_record__institution').get(pk=pk)
        except FDRDocument.DoesNotExist:
            raise Http404

        # Check permission
        user = request.user
        if user.role == 'institution':
            if not doc.fdr_record.institution.members.filter(user=user).exists():
                return Response(
                    {'detail': 'Access denied.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        try:
            response = FileResponse(
                doc.file.open('rb'),
                content_type=doc.mime_type,
            )
            response['Content-Disposition'] = (
                f'inline; filename="{doc.original_filename}"'
            )
            return response
        except FileNotFoundError:
            raise Http404("File not found on server.")
