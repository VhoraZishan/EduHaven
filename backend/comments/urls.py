from django.urls import path
from .views import PostCommentCreateView, PostCommentListView, CommentDetailView, CommentUpvoteView, CommentDownvoteView

urlpatterns = [
    path('posts/<int:post_id>/comments/', PostCommentListView.as_view()),
    path('posts/<int:post_id>/comments/add/', PostCommentCreateView.as_view()),
    path('comments/<int:pk>/', CommentDetailView.as_view()),
    path('comments/<int:pk>/upvote/', CommentUpvoteView.as_view()),
    path('comments/<int:pk>/downvote/', CommentDownvoteView.as_view()),
]
