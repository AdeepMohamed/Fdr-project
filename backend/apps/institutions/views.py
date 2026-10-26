from rest_framework import generics, permissions
from rest_framework.response import Response

from .models import Institution, InstitutionMembership
from .serializers import InstitutionSerializer, InstitutionMembershipSerializer
from apps.accounts.permissions import IsOfficialOrAdmin


class InstitutionListCreateView(generics.ListCreateAPIView):
    """List institutions (filtered by user role) or create new ones (admin only)."""
    serializer_class = InstitutionSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsOfficialOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ('official', 'admin'):
            return Institution.objects.all()
        # Institution users see only their institutions
        return Institution.objects.filter(
            members__user=user
        ).distinct()


class InstitutionDetailView(generics.RetrieveUpdateAPIView):
    """View or update an institution."""
    serializer_class = InstitutionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ('official', 'admin'):
            return Institution.objects.all()
        return Institution.objects.filter(members__user=user)
