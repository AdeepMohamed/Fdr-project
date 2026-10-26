from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('count/', views.NotificationCountView.as_view(), name='notification-count'),
    path('mark-all-read/', views.MarkAllReadView.as_view(), name='notification-mark-all'),
    path('<int:pk>/read/', views.NotificationReadView.as_view(), name='notification-read'),
]
