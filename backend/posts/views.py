from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone

from .models import Post, PostImage
from .serializers import PostSerializer


class PostListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request):
        posts = Post.objects.all().order_by('-created_at')
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer =PostSerializer(data=request.data)

        if serializer.is_valid():
            post = serializer.save(author=request.user)
            images = request.FILES.getlist('images')
            for img in images:
                PostImage.objects.create(post=post, image=img)
            return Response(PostSerializer(post, context={'request': request}).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class PostDetailView(APIView):

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_object(self, pk):
        try:
            return Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return None

    def get(self, request, pk):
        post = self.get_object(pk)
        if not post:
            return Response({"detail": "Post not found"}, status=404)

        serializer = PostSerializer(post, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        post = self.get_object(pk)
        if not post:
            return Response({"detail": "Post not found"}, status=404)

        if post.author != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        serializer = PostSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            post.edited_at = timezone.now()
            post.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        post = self.get_object(pk)
        if not post:
            return Response({"detail": "Post not found"}, status=404)

        if post.author != request.user:
            return Response({"detail": "Not allowed"}, status=403)

        post.delete()
        return Response(status=204)

class PostUpvoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response({"detail": "Post not found"}, status=404)

        if request.user in post.upvoted_by.all():
            post.upvoted_by.remove(request.user)
        else:
            post.upvoted_by.add(request.user)
            post.downvoted_by.remove(request.user)
        return Response({"status": "voted"})

class PostDownvoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response({"detail": "Post not found"}, status=404)

        if request.user in post.downvoted_by.all():
            post.downvoted_by.remove(request.user)
        else:
            post.downvoted_by.add(request.user)
            post.upvoted_by.remove(request.user)
        return Response({"status": "voted"})