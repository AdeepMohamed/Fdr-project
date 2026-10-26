from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.LoginView.as_view(), name='login'),
    path('token/', views.LoginView.as_view(), name='token_obtain_pair'),
    path('refresh/', views.RefreshTokenView.as_view(), name='token_refresh'),
    path('token/refresh/', views.RefreshTokenView.as_view(), name='token_refresh_alt'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('me/', views.MeView.as_view(), name='me'),
    path('users/', views.UserListCreateView.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
]
