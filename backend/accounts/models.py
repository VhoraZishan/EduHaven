from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('educator', 'Educator'),
        ('researcher', 'Researcher'),
        ('professional', 'Professional'),
        ('self_learner', 'Self-Learner'),
        ('moderator', 'Moderator'),
        ('admin', 'Admin'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.ImageField(
        upload_to ='avatars/',
        default = 'avatars/default.png',
        blank=True,
        null=True
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')

    def __str__(self):
        return self.user.username

