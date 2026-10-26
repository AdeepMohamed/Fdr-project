from rest_framework import serializers
from .models import Discrepancy, VerificationRecord


class DiscrepancySerializer(serializers.ModelSerializer):
    reviewed_by_name = serializers.CharField(
        source='reviewed_by.get_full_name', read_only=True, default=''
    )

    class Meta:
        model = Discrepancy
        fields = [
            'id', 'fdr_record', 'field_name', 'submitted_value',
            'extracted_value', 'discrepancy_type', 'review_status',
            'reviewer_observations', 'reviewed_by', 'reviewed_by_name',
            'reviewed_at', 'created_at',
        ]
        read_only_fields = ['id', 'fdr_record', 'field_name', 'submitted_value',
                            'extracted_value', 'discrepancy_type', 'created_at']


class VerificationRecordSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(
        source='reviewer.get_full_name', read_only=True
    )

    class Meta:
        model = VerificationRecord
        fields = [
            'id', 'fdr_record', 'reviewer', 'reviewer_name',
            'outcome', 'observations', 'correction_fields', 'created_at',
        ]
        read_only_fields = ['id', 'reviewer', 'created_at']


class VerificationDecisionSerializer(serializers.Serializer):
    """Serializer for official verification decision."""
    outcome = serializers.ChoiceField(choices=VerificationRecord.Outcome.choices)
    observations = serializers.CharField(required=False, allow_blank=True)
    correction_fields = serializers.ListField(
        child=serializers.CharField(), required=False, default=list
    )


class CorrectionRequestSerializer(serializers.Serializer):
    """Serializer for requesting corrections."""
    observations = serializers.CharField()
    correction_fields = serializers.ListField(
        child=serializers.CharField(), min_length=1
    )
