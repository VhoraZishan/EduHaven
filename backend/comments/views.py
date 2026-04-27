from django.utils import timezone
from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Comment
from .serializers import CommentSerializer
from posts.models import Post

class PostCommentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({"detail": "Post not found"}, status=404)

        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user, post=post)
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)

class PostCommentListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, post_id):
        comments = Comment.objects.filter(post_id=post_id).order_by('created_at')
        serializer = CommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)

class CommentDetailView(APIView):

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_object(self, pk):
        try:
            return Comment.objects.get(pk=pk)
        except Comment.DoesNotExist:
            return None

    def get(self, request, pk):
        comment = self.get_object(pk)
        if not comment:
            return Response({"detail": "Comment not found"}, status=404)

        serializer = CommentSerializer(comment, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        comment = self.get_object(pk)
        if not comment:
            return Response({"detail": "Comment not found"}, status=404)

        if comment.author != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        serializer = CommentSerializer(comment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(edited_at=timezone.now())
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        comment = self.get_object(pk)
        if not comment:
            return Response({"detail": "Comment not found"}, status=404)

        if comment.author != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        comment.delete()
        return Response(status=204)

class CommentUpvoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            comment = Comment.objects.get(pk=pk)
        except Comment.DoesNotExist:
            return Response({"detail": "Comment not found"}, status=404)

        if request.user in comment.upvoted_by.all():
            comment.upvoted_by.remove(request.user)
        else:
            comment.upvoted_by.add(request.user)
            comment.downvoted_by.remove(request.user)
        return Response({"status": "voted"})

class CommentDownvoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            comment = Comment.objects.get(pk=pk)
        except Comment.DoesNotExist:
            return Response({"detail": "Comment not found"}, status=404)

        if request.user in comment.downvoted_by.all():
            comment.downvoted_by.remove(request.user)
        else:
            comment.downvoted_by.add(request.user)
            comment.upvoted_by.remove(request.user)
        return Response({"status": "voted"})