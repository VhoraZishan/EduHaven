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

class CommentToggleAnswerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            comment = Comment.objects.select_related('post').get(pk=pk)
        except Comment.DoesNotExist:
            return Response({"detail": "Comment not found"}, status=404)

        post = comment.post

        # 1. Check if the post type is 'question'
        if post.post_type != 'question':
            return Response({"detail": "Only question posts can have marked answers."}, status=400)

        # 2. Check if the requesting user is the creator of the post
        if post.author != request.user:
            return Response({"detail": "Only the author of the post can mark answers."}, status=403)

        # 3. Toggle answer state
        if comment.is_answer:
            comment.is_answer = False
            comment.save()
            return Response({"is_answer": False, "status": "unmarked"})
        else:
            # Check if there are already 2 answers
            answers_count = Comment.objects.filter(post=post, is_answer=True).count()
            if answers_count >= 2:
                return Response({"detail": "You can only mark up to 2 comments as answers."}, status=400)
            
            comment.is_answer = True
            comment.save()
            return Response({"is_answer": True, "status": "marked"})