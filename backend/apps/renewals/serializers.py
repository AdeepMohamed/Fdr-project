from rest_framework import serializers
from .models import RenewalRecord
from apps.fdrs.serializers import FDRRecordListSerializer


class RenewalRecordSerializer(serializers.ModelSerializer):
    old_fdr_detail = FDRRecordListSerializer(source='old_fdr', read_only=True)
    new_fdr_detail = FDRRecordListSerializer(source='new_fdr', read_only=True)
    submitted_by_name = serializers.CharField(
        source='submitted_by.get_full_name', read_only=True
    )
    reviewed_by_name = serializers.CharField(
        source='reviewed_by.get_full_name', read_only=True, default=''
    )

    class Meta:
        model = RenewalRecord
        fields = [
            'id', 'old_fdr', 'old_fdr_detail', 'new_fdr', 'new_fdr_detail',
            'submitted_by', 'submitted_by_name', 'reviewed_by',
            'reviewed_by_name', 'status', 'reason', 'observations',
            'submitted_at', 'reviewed_at',
        ]
        read_only_fields = [
            'id', 'submitted_by', 'reviewed_by', 'submitted_at', 'reviewed_at',
        ]


class RenewalCreateSerializer(serializers.Serializer):
    """Create a renewal by linking a new FDR to an old one."""
    old_fdr_id = serializers.IntegerField()
    reason = serializers.CharField(required=False, allow_blank=True)
    # New FDR details
    fdr_number = serializers.CharField()
    bank_name = serializers.CharField()
    branch_name = serializers.CharField(required=False, allow_blank=True)
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    issue_date = serializers.DateField()
    maturity_date = serializers.DateField()
    instrument_type = serializers.CharField(default='fdr')

    def validate(self, data):
        if data['maturity_date'] <= data['issue_date']:
            raise serializers.ValidationError({
                'maturity_date': 'Maturity date must be after issue date.'
            })
        return data


class RenewalDecisionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=['approved', 'rejected', 'correction_requested']
    )
    observations = serializers.CharField(required=False, allow_blank=True)
