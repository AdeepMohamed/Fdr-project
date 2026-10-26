import logging
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail

from apps.fdrs.models import FDRRecord
from apps.notifications.models import Notification
from apps.audit.models import AuditLog

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Checks FDR maturity dates and sends automated alerts at 30, 15, 7, 0, -7, -14 days'

    def handle(self, *args, **options):
        today = timezone.now().date()
        reminder_thresholds = getattr(settings, 'MATURITY_REMINDER_DAYS', [30, 15, 7, 0, -7, -14])
        
        # Check active FDR records
        fdrs = FDRRecord.objects.filter(
            admin_status__in=['active', 'matured']
        ).select_related('institution', 'created_by')

        notifications_created = 0
        status_updates = 0

        self.stdout.write(f"Evaluating {fdrs.count()} FDR records for maturity reminders on {today}...")

        for fdr in fdrs:
            if not fdr.maturity_date:
                continue

            days_remaining = (fdr.maturity_date - today).days

            # Auto-update status if matured
            if days_remaining <= 0 and fdr.admin_status == 'active':
                fdr.admin_status = 'matured'
                fdr.save(update_fields=['admin_status', 'updated_at'])
                status_updates += 1
                AuditLog.objects.create(
                    user=None,
                    action='status_changed',
                    entity_type='FDRRecord',
                    entity_id=str(fdr.id),
                    summary=f"FDR {fdr.fdr_number} automatically transitioned to 'matured'",
                    details={'previous_status': 'active', 'new_status': 'matured', 'reason': 'Maturity date reached'}
                )

            # Check reminder windows
            for threshold in reminder_thresholds:
                # If within 1 day of threshold window
                if days_remaining <= threshold:
                    reminder_key = f"fdr_{fdr.id}_reminder_{threshold}d"

                    # Check if already notified for this threshold
                    if Notification.objects.filter(reminder_key=reminder_key).exists():
                        continue

                    # Determine notification content
                    if threshold > 0:
                        notif_type = Notification.NotificationType.MATURITY_REMINDER
                        title = f"Maturity Warning: FDR {fdr.fdr_number} matures in {days_remaining} days"
                        message = (
                            f"FDR #{fdr.fdr_number} of INR {fdr.amount} issued by {fdr.bank_name} for "
                            f"{fdr.institution.name} will mature on {fdr.maturity_date}. "
                            f"Please initiate renewal or submit required closure documentation."
                        )
                    elif threshold == 0:
                        notif_type = Notification.NotificationType.MATURITY_REMINDER
                        title = f"Action Required: FDR {fdr.fdr_number} Matures Today"
                        message = (
                            f"FDR #{fdr.fdr_number} of INR {fdr.amount} for {fdr.institution.name} "
                            f"matures today ({fdr.maturity_date}). Please submit the renewal receipt."
                        )
                    else:
                        notif_type = Notification.NotificationType.OVERDUE_FOLLOWUP
                        title = f"OVERDUE NOTICE: FDR {fdr.fdr_number} is {abs(days_remaining)} days past maturity"
                        message = (
                            f"URGENT: FDR #{fdr.fdr_number} of INR {fdr.amount} matured on {fdr.maturity_date} "
                            f"and has not been renewed or released. Immediate regulatory compliance is required."
                        )

                    # Determine recipient
                    recipient = fdr.created_by
                    if not recipient:
                        first_member = fdr.institution.members.first()
                        if first_member:
                            recipient = first_member.user

                    if recipient:
                        notif = Notification.objects.create(
                            recipient=recipient,
                            notification_type=notif_type,
                            title=title,
                            message=message,
                            related_fdr=fdr,
                            reminder_key=reminder_key,
                        )

                        # Try sending email
                        try:
                            send_mail(
                                subject=f"[FDR SmartTrack] {title}",
                                message=message,
                                from_email=settings.DEFAULT_FROM_EMAIL,
                                recipient_list=[recipient.email],
                                fail_silently=False,
                            )
                            notif.email_sent = True
                            notif.save(update_fields=['email_sent'])
                        except Exception as e:
                            notif.email_error = str(e)
                            notif.save(update_fields=['email_error'])
                            logger.warning(f"Failed to send email for notif {notif.id}: {e}")

                        notifications_created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully checked maturities: {status_updates} marked matured, {notifications_created} notifications sent."
            )
        )
