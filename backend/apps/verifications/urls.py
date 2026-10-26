from django.urls import path
from . import views

urlpatterns = [
    path('discrepancies/', views.DiscrepancyListView.as_view(), name='discrepancy-list'),
    path('<int:fdr_id>/decision/', views.VerificationDecisionView.as_view(), name='verification-decision'),
    path('decision/<int:fdr_id>/', views.VerificationDecisionView.as_view(), name='verification-decision-alt'),
    path('<int:fdr_id>/request-correction/', views.CorrectionRequestView.as_view(), name='correction-request'),
    path('correction/<int:fdr_id>/', views.CorrectionRequestView.as_view(), name='correction-request-alt'),
]
