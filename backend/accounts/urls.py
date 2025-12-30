from django.urls import path
from .views import RegisterView, LoginView, MeView, AvatarUpdateView, PublicUserView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/',LoginView.as_view()),
    path('me/', MeView.as_view()),
    path('me/avatar/', AvatarUpdateView.as_view()),
    path("users/<int:user_id>/", PublicUserView.as_view()),
]