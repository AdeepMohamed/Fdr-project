from django.urls import path
from . import views

urlpatterns = [
    path('summary/', views.DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('maturity/', views.MaturityReportView.as_view(), name='maturity-report'),
    path('status-distribution/', views.StatusDistributionView.as_view(), name='status-distribution'),
    path('trends/', views.MonthlyTrendsView.as_view(), name='monthly-trends'),
    path('export/', views.ExportCSVView.as_view(), name='export-csv'),
]
