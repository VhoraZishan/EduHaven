from django.urls import path
from .views import PostListCreateView, PostDetailView, PostUpvoteView, PostDownvoteView

urlpatterns = [
    path('', PostListCreateView.as_view()),
    path('<int:pk>/', PostDetailView.as_view()),
    path('<int:pk>/upvote/', PostUpvoteView.as_view()),
    path('<int:pk>/downvote/', PostDownvoteView.as_view()),
]
