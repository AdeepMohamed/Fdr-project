from rest_framework import serializers
from .models import ReleaseRequest


class ReleaseRequestSerializer(serializers.ModelSerializer):
    fdr_number = serializers.CharField(source='fdr_record.fdr_number', read_only=True)
    institution_name = serializers.CharField(
        source='fdr_record.institution.name', read_only=True
    )
    requested_by_name = serializers.CharField(
        source='requested_by.get_full_name', read_only=True
    )
    reviewed_by_name = serializers.CharField(
        source='reviewed_by.get_full_name', read_only=True, default=''
    )

    class Meta:
        model = ReleaseRequest
        fields = [
            'id', 'fdr_record', 'fdr_number', 'institution_name',
            'requested_by', 'requested_by_name', 'reason', 'status',
            'observations', 'reviewed_by', 'reviewed_by_name',
            'approved_by', 'submitted_at', 'reviewed_at', 'completed_at',
        ]
        read_only_fields = [
            'id', 'requested_by', 'reviewed_by', 'approved_by',
            'submitted_at', 'reviewed_at', 'completed_at',
        ]


class ReleaseRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReleaseRequest
        fields = ['id', 'fdr_record', 'reason']
        read_only_fields = ['id']

    def validate_fdr_record(self, value):
        user = self.context['request'].user
        if user.role == 'institution':
            if not value.institution.members.filter(user=user).exists():
                raise serializers.ValidationError('Access denied.')
        # Check if already has an active release request
        active = ReleaseRequest.objects.filter(
            fdr_record=value,
            status__in=['submitted', 'under_review', 'additional_docs', 'recommended']
        ).exists()
        if active:
            raise serializers.ValidationError(
                'An active release request already exists for this FDR.'
            )
        return value


class ReleaseDecisionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[
        'under_review', 'additional_docs', 'recommended',
        'approved', 'rejected', 'completed',
    ])
    observations = serializers.CharField(required=False, allow_blank=True)
