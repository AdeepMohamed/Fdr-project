from rest_framework import serializers
from .models import Institution, InstitutionMembership


class InstitutionBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = ['id', 'name', 'code', 'city', 'state']


class InstitutionSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Institution
        fields = [
            'id', 'name', 'code', 'address', 'city', 'state', 'pincode',
            'phone', 'email', 'website', 'establishment_year',
            'institution_type', 'status', 'created_at', 'updated_at',
            'member_count',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_member_count(self, obj):
        return obj.members.count()


class InstitutionMembershipSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    institution_name = serializers.CharField(source='institution.name', read_only=True)

    class Meta:
        model = InstitutionMembership
        fields = [
            'id', 'institution', 'user', 'role', 'joined_at',
            'user_email', 'user_name', 'institution_name',
        ]
