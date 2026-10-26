from django.urls import path
from . import views

urlpatterns = [
    path('', views.FDRRecordListCreateView.as_view(), name='fdr-list'),
    path('<int:pk>/', views.FDRRecordDetailView.as_view(), name='fdr-detail'),
    path('<int:pk>/submit/', views.FDRSubmitView.as_view(), name='fdr-submit'),
]
