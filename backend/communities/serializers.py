from rest_framework import serializers
from .models import Community


class CommunitySerializer(serializers.ModelSerializer):
    member_count = serializers.IntegerField(read_only=True)
    is_member = serializers.SerializerMethodField()
    is_creator = serializers.SerializerMethodField()
    post_count = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = [
            'id', 'name', 'slug', 'description', 'icon', 'banner',
            'creator', 'member_count', 'is_member', 'is_creator',
            'post_count', 'created_at',
        ]
        read_only_fields = ['creator', 'created_at', 'slug']

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(pk=request.user.pk).exists()
        return False

    def get_is_creator(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.creator_id == request.user.pk
        return False

    def get_post_count(self, obj):
        return obj.posts.count()
