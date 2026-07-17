from rest_framework import serializers
from .models import Comment

class CommentSerializer(serializers.ModelSerializer):
    upvotes_count = serializers.IntegerField(source='upvoted_by.count', read_only=True)
    downvotes_count = serializers.IntegerField(source='downvoted_by.count', read_only=True)
    has_upvoted = serializers.SerializerMethodField()
    has_downvoted = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'post', 'author', 'parent', 'body', 'is_answer',
            'upvotes_count', 'downvotes_count', 'has_upvoted', 'has_downvoted', 'created_at', 'edited_at'
        ]
        read_only_fields = ['post', 'author', 'created_at', 'edited_at', 'upvotes_count', 'downvotes_count', 'is_answer']

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
