from django.db import models
from django.conf import settings


class Institution(models.Model):
    """Technical institution registered with AICTE."""

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'
        SUSPENDED = 'suspended', 'Suspended'

    name = models.CharField(max_length=300)
    code = models.CharField(max_length=50, unique=True, help_text='AICTE Institution Code')
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    establishment_year = models.PositiveIntegerField(null=True, blank=True)
    institution_type = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'institutions'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class InstitutionMembership(models.Model):
    """Links users to institutions they can manage."""

    class MemberRole(models.TextChoices):
        ADMIN = 'admin', 'Institution Admin'
        MEMBER = 'member', 'Member'

    institution = models.ForeignKey(
        Institution, on_delete=models.CASCADE, related_name='members'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='institution_memberships'
    )
    role = models.CharField(
        max_length=20, choices=MemberRole.choices, default=MemberRole.MEMBER
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'institution_memberships'
        unique_together = ['institution', 'user']

    def __str__(self):
        return f"{self.user.email} -> {self.institution.code}"
