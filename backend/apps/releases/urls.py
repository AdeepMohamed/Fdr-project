from django.urls import path
from . import views

urlpatterns = [
    path('', views.ReleaseRequestListCreateView.as_view(), name='release-list'),
    path('<int:pk>/', views.ReleaseRequestDetailView.as_view(), name='release-detail'),
    path('<int:pk>/decision/', views.ReleaseDecisionView.as_view(), name='release-decision'),
]
