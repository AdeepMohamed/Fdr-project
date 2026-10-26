from django.urls import path
from . import views

urlpatterns = [
    path('', views.RenewalListView.as_view(), name='renewal-list'),
    path('create/', views.RenewalCreateView.as_view(), name='renewal-create'),
    path('<int:pk>/decision/', views.RenewalDecisionView.as_view(), name='renewal-decision'),
]
