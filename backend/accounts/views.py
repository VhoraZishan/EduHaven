from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token

from .auth_serializers import RegisterSerializer, LoginSerializer
from rest_framework.permissions import IsAuthenticated
from accounts.serializers import ProfileSerializer
from posts.models import Post
from comments.models import Comment
from posts.serializers import PostSerializer
from comments.serializers import CommentSerializer
from .serializers import AvatarSerializer

from rest_framework.parsers import MultiPartParser, FormParser

class RegisterView(APIView):
    def post(self,request):
        serializer =RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)

            return Response(
                {
                    'token' : token.key,
                    'username' : user.username
                },
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self,request):
        serializer = LoginSerializer(data= request.data)

        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, _ =Token.objects.get_or_create(user=user)

            return Response(
                {
                    'token': token.key,
                    'username': user.username
                },
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        profile_data = ProfileSerializer(user.profile).data
        posts_data = PostSerializer(
            Post.objects.filter(author=user).order_by('-created_at'),
            many=True
        ).data
        comments_data = CommentSerializer(
            Comment.objects.filter(author=user).order_by('-created_at'),
            many=True
        ).data

        return Response({
            "user": {
                "id": user.id,
                "username": user.username
            },
            "profile": profile_data,
            "posts": posts_data,
            "comments": comments_data
        })

class AvatarUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        profile = request.user.profile
        serializer = AvatarSerializer(profile, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)
