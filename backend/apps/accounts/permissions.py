from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """Allows access only to admin users."""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'admin'
        )


class IsOfficialUser(BasePermission):
    """Allows access only to AICTE official users."""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'official'
        )


class IsInstitutionUser(BasePermission):
    """Allows access only to institution users."""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'institution'
        )


class IsOfficialOrAdmin(BasePermission):
    """Allows access to officials and admins."""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ('official', 'admin')
        )


class IsOwnerOrOfficial(BasePermission):
    """
    Object-level permission: institution user can access only their own
    institution's records; officials and admins can access all.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role in ('official', 'admin'):
            return True
        # For institution users, check membership
        if hasattr(obj, 'institution'):
            return obj.institution.members.filter(
                user=request.user
            ).exists()
        if hasattr(obj, 'fdr_record'):
            return obj.fdr_record.institution.members.filter(
                user=request.user
            ).exists()
        return False
