from django.urls import path
from . import views

urlpatterns = [
    path('upload/<int:fdr_id>/', views.DocumentUploadView.as_view(), name='document-upload'),
    path('fdr/<int:fdr_id>/', views.DocumentListView.as_view(), name='document-list'),
    path('<int:pk>/download/', views.DocumentDownloadView.as_view(), name='document-download'),
]
