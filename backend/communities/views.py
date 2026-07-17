from django.utils.text import slugify
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Community
from .serializers import CommunitySerializer


class CommunityListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request):
        search = request.query_params.get('search', '').strip()
        communities = Community.objects.all()
        if search:
            communities = communities.filter(name__icontains=search)
        serializer = CommunitySerializer(communities, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        name = request.data.get('name', '')
        slug = slugify(name)
        if not slug:
            return Response({'name': ['Invalid name.']}, status=400)

        data = request.data.copy()
        data['slug'] = slug

        serializer = CommunitySerializer(data=data, context={'request': request})
        if serializer.is_valid():
            community = serializer.save(creator=request.user)
            community.members.add(request.user)
            return Response(CommunitySerializer(community, context={'request': request}).data, status=201)
        return Response(serializer.errors, status=400)


class CommunityDetailView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_object(self, slug):
        try:
            return Community.objects.get(slug=slug)
        except Community.DoesNotExist:
            return None

    def get(self, request, slug):
        community = self.get_object(slug)
        if not community:
            return Response({'detail': 'Not found'}, status=404)
        serializer = CommunitySerializer(community, context={'request': request})
        return Response(serializer.data)

    def patch(self, request, slug):
        """Update community settings (icon/banner only — name/slug are immutable)."""
        community = self.get_object(slug)
        if not community:
            return Response({'detail': 'Not found'}, status=404)
        if community.creator != request.user:
            return Response({'detail': 'Only the creator can edit this community.'}, status=403)

        # Explicitly block name changes
        data = request.data.copy()
        data.pop('name', None)
        data.pop('slug', None)

        serializer = CommunitySerializer(community, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(CommunitySerializer(community, context={'request': request}).data)
        return Response(serializer.errors, status=400)

    def delete(self, request, slug):
        """Delete the community. Only the creator can do this."""
        community = self.get_object(slug)
        if not community:
            return Response({'detail': 'Not found'}, status=404)
        if community.creator != request.user:
            return Response({'detail': 'Only the creator can delete this community.'}, status=403)
        community.delete()
        return Response(status=204)


class CommunityJoinView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        try:
            community = Community.objects.get(slug=slug)
        except Community.DoesNotExist:
            return Response({'detail': 'Not found'}, status=404)

        # If the creator tries to leave → delete the community
        if request.user == community.creator:
            community.delete()
            return Response({'status': 'deleted'})

        if request.user in community.members.all():
            community.members.remove(request.user)
            return Response({'status': 'left'})
        else:
            community.members.add(request.user)
            return Response({'status': 'joined'})
