from django.db import models
from django.contrib.auth.models import User
from posts.models import Post

class Comment(models.Model):
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )
    parent = models.ForeignKey(
        'self', 
        null=True, 
        blank=True, 
        on_delete=models.CASCADE, 
        related_name='replies'
    )
    body = models.TextField()
    is_answer = models.BooleanField(default=False)
    
    # Voting
    upvoted_by = models.ManyToManyField(User, related_name='upvoted_comments', blank=True)
    downvoted_by = models.ManyToManyField(User, related_name='downvoted_comments', blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.body[:30]