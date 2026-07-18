from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import authenticate

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=False, default='student')

    class Meta:
        model = User
        fields = ['username','email','password','role']

    def validate_role(self, value):
        allowed_roles = ['student', 'educator', 'researcher', 'professional', 'self_learner']
        if value not in allowed_roles:
            raise serializers.ValidationError("You cannot self-declare this role.")
        return value

    def create(self,validated_data):
        role = validated_data.pop('role', 'student')
        user = User(
            username=validated_data['username'],
            email = validated_data.get('email','')
        )
        user.set_password(validated_data['password'])
        user.save()

        profile = user.profile
        profile.role = role
        profile.save()

        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self,data):
        user = authenticate(
            username = data['username'],
            password = data['password']
        )

        if not user:
            raise serializers.ValidationError("Invalid Credentials")

        data['user'] = user
        return data