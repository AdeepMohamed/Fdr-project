from datetime import timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model

from apps.institutions.models import Institution, InstitutionMembership
from apps.fdrs.models import FDRRecord
from apps.verifications.models import Discrepancy, VerificationRecord
from apps.renewals.models import RenewalRecord
from apps.releases.models import ReleaseRequest
from apps.notifications.models import Notification
from apps.audit.models import AuditLog

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds realistic demonstration data for FDR SmartTrack'

    def handle(self, *args, **options):
        self.stdout.write("Starting demo data seeding...")
        today = timezone.now().date()

        # 1. Create Users
        admin_user, _ = User.objects.get_or_create(
            email='admin@aicte.gov.in',
            defaults={
                'username': 'admin',
                'first_name': 'Dr. Rajesh',
                'last_name': 'Sharma',
                'role': User.Role.ADMIN,
                'designation': 'Chief Director of Approval Bureau',
                'phone': '+91 9811122233',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin_user.set_password('Admin@123')
        admin_user.save()

        official_user, _ = User.objects.get_or_create(
            email='official@aicte.gov.in',
            defaults={
                'username': 'official',
                'first_name': 'Priya',
                'last_name': 'Venkatesh',
                'role': User.Role.OFFICIAL,
                'designation': 'Senior Regional Officer (SRO)',
                'phone': '+91 9822233344',
                'is_staff': True,
            }
        )
        official_user.set_password('Official@123')
        official_user.save()

        inst_user1, _ = User.objects.get_or_create(
            email='director@delhitech.edu.in',
            defaults={
                'username': 'director_delhi',
                'first_name': 'Prof. Arvind',
                'last_name': 'Gupta',
                'role': User.Role.INSTITUTION,
                'designation': 'Director & Authorized Signatory',
                'phone': '+91 9833344455',
            }
        )
        inst_user1.set_password('College@123')
        inst_user1.save()

        inst_user2, _ = User.objects.get_or_create(
            email='principal@mitpune.edu.in',
            defaults={
                'username': 'principal_mit',
                'first_name': 'Dr. Sunita',
                'last_name': 'Deshmukh',
                'role': User.Role.INSTITUTION,
                'designation': 'Principal',
                'phone': '+91 9844455566',
            }
        )
        inst_user2.set_password('College@123')
        inst_user2.save()

        self.stdout.write("Created demo users.")

        # 2. Create Institutions
        inst1, _ = Institution.objects.get_or_create(
            code='AICTE-1-10294821',
            defaults={
                'name': 'Delhi Institute of Technology & Management',
                'institution_type': 'Engineering',
                'state': 'Delhi',
                'city': 'New Delhi',
                'address': 'Plot 4, Institutional Area, Sector 23, Rohini, New Delhi - 110085',
                'email': 'contact@delhitech.edu.in',
                'phone': '+91 11 27891234',
                'website': 'https://delhitech.edu.in',
                'establishment_year': 2004,
                'status': 'active',
            }
        )

        inst2, _ = Institution.objects.get_or_create(
            code='AICTE-1-39482012',
            defaults={
                'name': 'Maharashtra Institute of Technology & Research',
                'institution_type': 'Engineering & Tech',
                'state': 'Maharashtra',
                'city': 'Pune',
                'address': 'Survey No. 124, Paud Road, Kothrud, Pune, Maharashtra - 411038',
                'email': 'info@mitpune.edu.in',
                'phone': '+91 20 25431234',
                'website': 'https://mitpune.edu.in',
                'establishment_year': 1998,
                'status': 'active',
            }
        )

        inst3, _ = Institution.objects.get_or_create(
            code='AICTE-1-58291039',
            defaults={
                'name': 'Karnataka Apex College of Pharmacy & Tech',
                'institution_type': 'Pharmacy & Allied',
                'state': 'Karnataka',
                'city': 'Bengaluru',
                'address': '8th Mile, Tumkur Road, Peenya, Bengaluru, Karnataka - 560057',
                'email': 'admin@karnatakaapex.edu.in',
                'phone': '+91 80 28391234',
                'website': 'https://karnatakaapex.edu.in',
                'establishment_year': 2010,
                'status': 'active',
            }
        )

        # Memberships
        InstitutionMembership.objects.get_or_create(
            user=inst_user1, institution=inst1,
            defaults={'role': 'admin'}
        )
        InstitutionMembership.objects.get_or_create(
            user=inst_user2, institution=inst2,
            defaults={'role': 'admin'}
        )

        self.stdout.write("Created demo institutions and memberships.")

        # 3. Create FDR Records across states
        # Record 1: Verified, Active, healthy maturity (250 days out)
        fdr1, _ = FDRRecord.objects.get_or_create(
            fdr_number='FDR-2023-SBI-8910',
            bank_name='State Bank of India',
            defaults={
                'institution': inst1,
                'created_by': inst_user1,
                'branch_name': 'Rohini Sector 22 Branch, Delhi',
                'branch_ifsc': 'SBIN0011562',
                'amount': Decimal('5000000.00'),
                'issue_date': today - timedelta(days=400),
                'maturity_date': today + timedelta(days=250),
                'interest_rate': Decimal('7.10'),
                'instrument_type': 'fdr',
                'reference_number': 'AICTE/DL/2023/SEC-DEP/01',
                'verification_status': 'verified',
                'admin_status': 'active',
                'verified_at': timezone.now() - timedelta(days=390),
                'remarks': 'Security deposit for new B.Tech Artificial Intelligence course approval.',
            }
        )

        # Record 2: Active, Maturing soon (12 days)
        fdr2, _ = FDRRecord.objects.get_or_create(
            fdr_number='FDR-2022-HDFC-3321',
            bank_name='HDFC Bank',
            defaults={
                'institution': inst1,
                'created_by': inst_user1,
                'branch_name': 'Connaught Place Branch, New Delhi',
                'branch_ifsc': 'HDFC0000003',
                'amount': Decimal('3500000.00'),
                'issue_date': today - timedelta(days=718),
                'maturity_date': today + timedelta(days=12),
                'interest_rate': Decimal('6.85'),
                'instrument_type': 'fdr',
                'reference_number': 'AICTE/DL/2022/SEC-DEP/04',
                'verification_status': 'verified',
                'admin_status': 'active',
                'verified_at': timezone.now() - timedelta(days=700),
                'remarks': 'Deposit for intake expansion approval 2022.',
            }
        )

        # Record 3: Matured & Overdue (-6 days)
        fdr3, _ = FDRRecord.objects.get_or_create(
            fdr_number='FDR-2021-PNB-5542',
            bank_name='Punjab National Bank',
            defaults={
                'institution': inst2,
                'created_by': inst_user2,
                'branch_name': 'Kothrud Branch, Pune',
                'branch_ifsc': 'PUNB0145200',
                'amount': Decimal('2500000.00'),
                'issue_date': today - timedelta(days=1095),
                'maturity_date': today - timedelta(days=6),
                'interest_rate': Decimal('6.50'),
                'instrument_type': 'fdr',
                'reference_number': 'AICTE/MH/2021/RENEWAL/02',
                'verification_status': 'verified',
                'admin_status': 'matured',
                'verified_at': timezone.now() - timedelta(days=1080),
                'remarks': 'Matured security deposit awaiting renewal certificate from bank.',
            }
        )

        # Record 4: Pending Verification (recently submitted)
        fdr4, _ = FDRRecord.objects.get_or_create(
            fdr_number='FDR-2024-CAN-1190',
            bank_name='Canara Bank',
            defaults={
                'institution': inst2,
                'created_by': inst_user2,
                'branch_name': 'Shivaji Nagar Branch, Pune',
                'branch_ifsc': 'CNRB0002045',
                'amount': Decimal('1500000.00'),
                'issue_date': today - timedelta(days=10),
                'maturity_date': today + timedelta(days=355),
                'interest_rate': Decimal('7.25'),
                'instrument_type': 'fdr',
                'reference_number': 'AICTE/MH/2024/INTAKE/09',
                'verification_status': 'pending_verification',
                'admin_status': 'active',
                'submitted_at': timezone.now() - timedelta(days=8),
                'remarks': 'Fresh deposit for Diploma in Robotics course.',
            }
        )

        # Record 5: Discrepancy Found & Correction Requested
        fdr5, _ = FDRRecord.objects.get_or_create(
            fdr_number='FDR-2024-BOB-7721',
            bank_name='Bank of Baroda',
            defaults={
                'institution': inst1,
                'created_by': inst_user1,
                'branch_name': 'Pitampura Branch, Delhi',
                'branch_ifsc': 'BARB0PITAMP',
                'amount': Decimal('2000000.00'),
                'issue_date': today - timedelta(days=20),
                'maturity_date': today + timedelta(days=345),
                'interest_rate': Decimal('7.00'),
                'instrument_type': 'fdr',
                'reference_number': 'AICTE/DL/2024/ADD-DIV/03',
                'verification_status': 'correction_requested',
                'admin_status': 'active',
                'submitted_at': timezone.now() - timedelta(days=18),
                'remarks': 'Submitted FDR has amount discrepancy compared with scan.',
            }
        )

        # Record 6: Old FDR that was renewed
        fdr_old, _ = FDRRecord.objects.get_or_create(
            fdr_number='FDR-2020-AXIS-9912',
            bank_name='Axis Bank',
            defaults={
                'institution': inst1,
                'created_by': inst_user1,
                'branch_name': 'Pitampura Branch, Delhi',
                'branch_ifsc': 'UTIB0000123',
                'amount': Decimal('4500000.00'),
                'issue_date': today - timedelta(days=1400),
                'maturity_date': today - timedelta(days=400),
                'interest_rate': Decimal('6.20'),
                'instrument_type': 'fdr',
                'reference_number': 'AICTE/DL/2020/INST/01',
                'verification_status': 'verified',
                'admin_status': 'renewed',
            }
        )

        # Record 7: Release requested
        fdr7, _ = FDRRecord.objects.get_or_create(
            fdr_number='FDR-2021-ICICI-4410',
            bank_name='ICICI Bank',
            defaults={
                'institution': inst2,
                'created_by': inst_user2,
                'branch_name': 'FC Road Branch, Pune',
                'branch_ifsc': 'ICIC0000045',
                'amount': Decimal('1000000.00'),
                'issue_date': today - timedelta(days=1200),
                'maturity_date': today - timedelta(days=100),
                'interest_rate': Decimal('6.00'),
                'instrument_type': 'fdr',
                'reference_number': 'AICTE/MH/2021/COURSE-CLS/07',
                'verification_status': 'verified',
                'admin_status': 'matured',
                'remarks': 'Security deposit for discontinued MCA evening program. Requesting release.',
            }
        )

        self.stdout.write("Created demo FDR records.")

        # 4. Create Discrepancies for fdr5
        Discrepancy.objects.get_or_create(
            fdr_record=fdr5,
            field_name='amount',
            defaults={
                'submitted_value': '2000000.00',
                'extracted_value': '1950000.00',
                'discrepancy_type': 'mismatch',
                'review_status': 'pending',
                'reviewer_observations': 'OCR scan indicates ₹19,50,000 whereas portal form stated ₹20,00,000. Clarification required.',
                'reviewed_by': official_user,
            }
        )
        Discrepancy.objects.get_or_create(
            fdr_record=fdr5,
            field_name='bank_name',
            defaults={
                'submitted_value': 'Bank of Baroda',
                'extracted_value': 'Bank of Baroda',
                'discrepancy_type': 'exact_match',
                'review_status': 'reviewed',
                'reviewed_by': official_user,
            }
        )

        # 5. Create Verification Record for fdr5
        VerificationRecord.objects.get_or_create(
            fdr_record=fdr5,
            reviewer=official_user,
            outcome='correction_requested',
            defaults={
                'observations': 'Mismatch found in amount between physical certificate scan (₹19,50,000) and entered value (₹20,00,000). Please provide revised certificate or correct entry.',
                'correction_fields': ['amount'],
            }
        )

        # 6. Create Renewal Record linking fdr_old to fdr1
        RenewalRecord.objects.get_or_create(
            old_fdr=fdr_old,
            new_fdr=fdr1,
            defaults={
                'submitted_by': inst_user1,
                'status': RenewalRecord.Status.APPROVED,
                'reviewed_by': official_user,
                'reviewed_at': timezone.now() - timedelta(days=390),
                'observations': 'Approved renewal with upgraded deposit of ₹50 Lakhs.',
            }
        )

        # 7. Create Release Request for fdr7
        ReleaseRequest.objects.get_or_create(
            fdr_record=fdr7,
            defaults={
                'requested_by': inst_user2,
                'reason': 'Course closure approved by AICTE. All students graduated and NOC issued.',
                'status': ReleaseRequest.Status.SUBMITTED,
            }
        )

        # 8. Create Notifications
        Notification.objects.get_or_create(
            reminder_key=f"fdr_{fdr2.id}_reminder_15d",
            defaults={
                'recipient': inst_user1,
                'notification_type': Notification.NotificationType.MATURITY_REMINDER,
                'title': f"Maturity Warning: FDR {fdr2.fdr_number} matures in 12 days",
                'message': f"FDR #{fdr2.fdr_number} of ₹{fdr2.amount} issued by HDFC Bank will mature on {fdr2.maturity_date}. Please initiate renewal.",
                'related_fdr': fdr2,
            }
        )

        Notification.objects.get_or_create(
            reminder_key=f"fdr_{fdr3.id}_reminder_-7d",
            defaults={
                'recipient': inst_user2,
                'notification_type': Notification.NotificationType.OVERDUE_FOLLOWUP,
                'title': f"OVERDUE NOTICE: FDR {fdr3.fdr_number} is 6 days past maturity",
                'message': f"URGENT: FDR #{fdr3.fdr_number} of ₹{fdr3.amount} matured on {fdr3.maturity_date} and is overdue for renewal submission.",
                'related_fdr': fdr3,
            }
        )

        Notification.objects.get_or_create(
            recipient=inst_user1,
            notification_type=Notification.NotificationType.CORRECTION_REQUEST,
            title=f"Correction Required - FDR {fdr5.fdr_number}",
            defaults={
                'message': f"Amount discrepancy detected on FDR {fdr5.fdr_number}. Please review the official comments and update.",
                'related_fdr': fdr5,
            }
        )

        # 9. Create Audit Logs
        AuditLog.objects.create(
            user=admin_user,
            action='system_seeded',
            entity_type='System',
            entity_id='1',
            summary='System initialized with benchmark demonstration data',
            details={'seeded_institutions': 3, 'seeded_fdrs': 7}
        )
        AuditLog.objects.create(
            user=official_user,
            action='fdr_verified',
            entity_type='FDRRecord',
            entity_id=str(fdr1.id),
            summary=f"FDR {fdr1.fdr_number} verified and approved by Regional Officer",
        )
        AuditLog.objects.create(
            user=official_user,
            action='correction_requested',
            entity_type='FDRRecord',
            entity_id=str(fdr5.id),
            summary=f"Discrepancy flagged: correction requested for {fdr5.fdr_number}",
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Demo data successfully seeded!\n"
                "Demo Logins:\n"
                "1. Admin: admin@aicte.gov.in / Admin@123\n"
                "2. AICTE Official: official@aicte.gov.in / Official@123\n"
                "3. College 1: director@delhitech.edu.in / College@123\n"
                "4. College 2: principal@mitpune.edu.in / College@123\n"
            )
        )
