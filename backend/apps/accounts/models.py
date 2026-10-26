from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model with role-based access control."""

    class Role(models.TextChoices):
        INSTITUTION = 'institution', 'Institution User'
        OFFICIAL = 'official', 'AICTE Official'
        ADMIN = 'admin', 'Administrator'

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.INSTITUTION)
    phone = models.CharField(max_length=15, blank=True)
    designation = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    @property
    def is_institution_user(self):
        return self.role == self.Role.INSTITUTION

    @property
    def is_official(self):
        return self.role == self.Role.OFFICIAL

    @property
    def is_admin_user(self):
        return self.role == self.Role.ADMIN
