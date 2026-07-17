from django.shortcuts import render
from django.db.models import Q, Count

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
        posts = Post.objects.all()

        # --- Search ---
        search = request.query_params.get('search', '').strip()
        if search:
            posts = posts.filter(Q(title__icontains=search) | Q(body__icontains=search))

        # --- Filters ---
        post_type = request.query_params.get('post_type', '').strip()
        if post_type:
            posts = posts.filter(post_type=post_type)

        community_slug = request.query_params.get('community', '').strip()
        if community_slug:
            posts = posts.filter(community__slug=community_slug)

        author_id = request.query_params.get('author', '').strip()
        if author_id:
            posts = posts.filter(author_id=author_id)

        # --- Ordering ---
        ordering = request.query_params.get('ordering', 'new')
        if ordering == 'top':
            # Top = all posts ranked by total upvotes (all time)
            posts = posts.annotate(vote_score=Count('upvoted_by')).order_by('-vote_score', '-created_at')
        elif ordering == 'hot':
            # Hot = find the most recent post in this set, then show all posts
            # within 24 hours of that post's timestamp, ranked by upvotes.
            # This means "hot" works even if the newest post is months old.
            from datetime import timedelta
            latest = posts.order_by('-created_at').first()
            if latest:
                window_start = latest.created_at - timedelta(hours=24)
                posts = posts.filter(created_at__gte=window_start).annotate(
                    vote_score=Count('upvoted_by')
                ).order_by('-vote_score', '-created_at')
            else:
                posts = posts.none()
        else:  # new (default)
            posts = posts.order_by('-created_at')

        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = PostSerializer(data=request.data)

        if serializer.is_valid():
            post = serializer.save(author=request.user)
            images = request.FILES.getlist('images')
            for img in images:
                PostImage.objects.create(post=post, image=img)
            return Response(PostSerializer(post, context={'request': request}).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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