from django.urls import path
from . import views

urlpatterns = [
    path('', views.InstitutionListCreateView.as_view(), name='institution-list'),
    path('<int:pk>/', views.InstitutionDetailView.as_view(), name='institution-detail'),
]
