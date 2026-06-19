from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'problems', views.TaskViewSet)
router.register(r'submissions', views.SubmissionViewSet)
router.register(r'categories', views.CategoryViewSet)

urlpatterns = [
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/me/', views.UserViewSet.as_view({'get': 'me'}), name='current-user'),
    path('leaderboard/', views.LeaderboardView.as_view(), name='leaderboard'),
    path('progress/', views.user_progress, name='user-progress'),
    path('problems/<int:problem_id>/comments/', views.problem_comments, name='problem-comments'),
    path('problems/<int:problem_id>/hints/', views.problem_hints, name='problem-hints'),
    path('', include(router.urls)),
]
