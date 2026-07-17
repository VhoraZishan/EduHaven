from django.db import models
from django.contrib.auth.models import User
from django.apps import apps

class Post(models.Model):
    POST_TYPES = (
        ('standard', 'Standard'),
        ('question', 'Question'),
        ('article', 'Article'),
    )

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posts'
    )
    title =  models.CharField(max_length=200)
    body = models.TextField(blank=True)
    post_type = models.CharField(max_length=20, choices=POST_TYPES, default='standard')
    community = models.ForeignKey(
        'communities.Community',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posts'
    )

    # Media support
    image = models.ImageField(upload_to='post_images/', null=True, blank=True)
    video = models.FileField(upload_to='post_videos/', null=True, blank=True)
    
    # Voting
    upvoted_by = models.ManyToManyField(User, related_name='upvoted_posts', blank=True)
    downvoted_by = models.ManyToManyField(User, related_name='downvoted_posts', blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title

class PostImage(models.Model):
    post = models.ForeignKey(Post, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='post_images/')
