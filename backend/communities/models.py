from django.db import models
from django.contrib.auth.models import User


class Community(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.ImageField(upload_to='community_icons/', null=True, blank=True)
    banner = models.ImageField(upload_to='community_banners/', null=True, blank=True)

    creator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_communities')
    members = models.ManyToManyField(User, related_name='joined_communities', blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'communities'

    def __str__(self):
        return self.name

    @property
    def member_count(self):
        return self.members.count()
