from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def api_root_view(request):
    return JsonResponse({
        'service': 'FDR SmartTrack Regulatory API',
        'status': 'online',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/v1/auth/',
            'institutions': '/api/v1/institutions/',
            'fdrs': '/api/v1/fdrs/',
            'documents': '/api/v1/documents/',
            'verifications': '/api/v1/verifications/',
            'notifications': '/api/v1/notifications/',
            'renewals': '/api/v1/renewals/',
            'releases': '/api/v1/releases/',
            'audit_logs': '/api/v1/audit-logs/',
            'reports': '/api/v1/reports/',
            'admin': '/admin/',
        }
    })


urlpatterns = [
    path('', api_root_view, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/institutions/', include('apps.institutions.urls')),
    path('api/v1/fdrs/', include('apps.fdrs.urls')),
    path('api/v1/documents/', include('apps.documents.urls')),
    path('api/v1/verifications/', include('apps.verifications.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/renewals/', include('apps.renewals.urls')),
    path('api/v1/releases/', include('apps.releases.urls')),
    path('api/v1/audit-logs/', include('apps.audit.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
