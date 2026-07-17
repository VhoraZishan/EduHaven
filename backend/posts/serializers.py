from rest_framework import serializers
from .models import Post, PostImage


class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ['id', 'image']


class PostSerializer(serializers.ModelSerializer):
    upvotes_count = serializers.IntegerField(source='upvoted_by.count', read_only=True)
    downvotes_count = serializers.IntegerField(source='downvoted_by.count', read_only=True)
    has_upvoted = serializers.SerializerMethodField()
    has_downvoted = serializers.SerializerMethodField()
    images = PostImageSerializer(many=True, read_only=True)
    community_name = serializers.SerializerMethodField()
    community_slug = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'title', 'body', 'post_type',
            'community', 'community_name', 'community_slug',
            'image', 'images', 'video',
            'upvotes_count', 'downvotes_count', 'has_upvoted', 'has_downvoted',
            'created_at', 'edited_at'
        ]
        read_only_fields = ['author', 'created_at', 'upvotes_count', 'downvotes_count', 'images']

    def get_has_upvoted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.upvoted_by.filter(id=request.user.id).exists()
        return False

    def get_has_downvoted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.downvoted_by.filter(id=request.user.id).exists()
        return False

    def get_community_name(self, obj):
        return obj.community.name if obj.community else None

    def get_community_slug(self, obj):
        return obj.community.slug if obj.community else None