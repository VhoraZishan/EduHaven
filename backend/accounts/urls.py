from django.urls import path
from .views import RegisterView, LoginView, MeView, AvatarUpdateView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/',LoginView.as_view()),
    path('me/', MeView.as_view()),
    path('me/avatar/', AvatarUpdateView.as_view()),
]