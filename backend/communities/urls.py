from django.urls import path
from .views import CommunityListCreateView, CommunityDetailView, CommunityJoinView

urlpatterns = [
    path('', CommunityListCreateView.as_view(), name='community-list'),
    path('<slug:slug>/', CommunityDetailView.as_view(), name='community-detail'),
    path('<slug:slug>/join/', CommunityJoinView.as_view(), name='community-join'),
]
