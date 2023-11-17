from rest_framework import serializers
from .models import *


class ChatMsgSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMsg
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username','first_name','last_name','email',"last_login"]


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'

class FollowerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follower
        fields = '__all__'


class PostLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'

class FollowRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowRequest
        fields = '__all__'

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = '__all__'


class GroupMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMessage
        fields = '__all__'