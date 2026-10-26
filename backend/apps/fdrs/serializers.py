from rest_framework import serializers
from .models import FDRRecord
from apps.institutions.serializers import InstitutionBriefSerializer


class FDRRecordListSerializer(serializers.ModelSerializer):
    """Compact serializer for list views."""
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    institution_code = serializers.CharField(source='institution.code', read_only=True)
    days_to_maturity = serializers.IntegerField(read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = FDRRecord
        fields = [
            'id', 'record_id', 'fdr_number', 'institution', 'institution_name',
            'institution_code', 'bank_name', 'amount', 'currency',
            'issue_date', 'maturity_date', 'days_to_maturity',
            'verification_status', 'admin_status', 'instrument_type',
            'created_by_name', 'created_at',
        ]


class FDRRecordDetailSerializer(serializers.ModelSerializer):
    """Full serializer for detail views."""
    institution_detail = InstitutionBriefSerializer(source='institution', read_only=True)
    days_to_maturity = serializers.IntegerField(read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    documents = serializers.SerializerMethodField()
    discrepancies = serializers.SerializerMethodField()
    verifications = serializers.SerializerMethodField()

    class Meta:
        model = FDRRecord
        fields = [
            'id', 'record_id', 'fdr_number', 'institution', 'institution_detail',
            'bank_name', 'branch_name', 'branch_address', 'branch_ifsc',
            'amount', 'currency', 'issue_date', 'maturity_date',
            'days_to_maturity', 'interest_rate', 'instrument_type',
            'reference_number', 'remarks', 'verification_status',
            'admin_status', 'previous_fdr', 'renewal_count',
            'submitted_at', 'verified_at', 'created_by', 'created_by_name',
            'created_at', 'updated_at', 'documents', 'discrepancies',
            'verifications',
        ]
        read_only_fields = [
            'id', 'record_id', 'created_by', 'verification_status',
            'admin_status', 'submitted_at', 'verified_at',
            'created_at', 'updated_at', 'renewal_count',
        ]

    def get_documents(self, obj):
        from apps.documents.serializers import FDRDocumentSerializer
        return FDRDocumentSerializer(obj.documents.all(), many=True).data

    def get_discrepancies(self, obj):
        from apps.verifications.serializers import DiscrepancySerializer
        return DiscrepancySerializer(obj.discrepancies.all(), many=True).data

    def get_verifications(self, obj):
        from apps.verifications.serializers import VerificationRecordSerializer
        return VerificationRecordSerializer(
            obj.verification_records.all(), many=True
        ).data


class FDRRecordCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating FDR records."""

    class Meta:
        model = FDRRecord
        fields = [
            'institution', 'fdr_number', 'bank_name', 'branch_name',
            'branch_address', 'branch_ifsc', 'amount', 'currency',
            'issue_date', 'maturity_date', 'interest_rate',
            'instrument_type', 'reference_number', 'remarks',
        ]

    def validate(self, data):
        if data.get('maturity_date') and data.get('issue_date'):
            if data['maturity_date'] <= data['issue_date']:
                raise serializers.ValidationError({
                    'maturity_date': 'Maturity date must be after issue date.'
                })
        # Check institution access
        user = self.context['request'].user
        institution = data.get('institution')
        if user.role == 'institution':
            if not institution.members.filter(user=user).exists():
                raise serializers.ValidationError({
                    'institution': 'You do not have access to this institution.'
                })
        return data

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
