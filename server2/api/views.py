from django.shortcuts import render
from rest_framework.generics import *

from django.http import JsonResponse
from .serializers import *
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.filters import SearchFilter,OrderingFilter,BaseFilterBackend
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import *
from rest_framework.views import APIView
import json


class __get__all__chats__related__to__logged__in__users__(ListAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = ChatMsgSerializer
    def get_queryset(self):
        user = self.request.user
        return ChatMsg.objects.filter(sender=user) | ChatMsg.objects.filter(receiver=user)

class __get__chats__related__to__user__and__receiver__(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    #ordering in terms of date

    def post(self,request):
        receiver = request.data['receiver']
        sender = request.user
        chats = ChatMsg.objects.filter(sender=sender,receiver=receiver) | ChatMsg.objects.filter(sender=receiver,receiver=sender)
        #order it in terms of date
        chats = chats.order_by('created_at_date','created_at_time')
        serializer = ChatMsgSerializer(chats,many=True)
        #send the user name instead of the id
        response = []
        for i in serializer.data:
            response.append({
                "message":i['message'],
                "sender":UserSerializer(User.objects.get(id=i['sender'])).data,
                "receiver":UserSerializer(User.objects.get(id=i['receiver'])).data,
                "created_at_date":i['created_at_date'],
                "created_at_time":i['created_at_time']
            })
        return JsonResponse(response,safe=False)
    
class __search__user__based__on__username__(ListAPIView):
    #search those users only who the logged in user is not following or is not followed by
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    filter_backends = [SearchFilter,OrderingFilter]
    search_fields = ['username']
    ordering_fields = ['username']
    ordering = ['username']
    def get_queryset(self):
        #if the logged in user is being followed by someone but the logged in user is not following him , he should also be returned
        user = self.request.user
        people = Follower.objects.filter(follower=user) | Follower.objects.filter(followee=user)
        #people is the list of people who are following the logged , if the logged in user is not following those people then return them else not
        #if return only those people who are not following the logged in user, if the logged in user is following them then don't return them
        return User.objects.exclude(id__in=people.values('followee')).exclude(id=user.id)
    
        
    

class __get__users__who__logged__in__user__has__chatted__(ListAPIView):
    serializer_class = ChatMsgSerializer
    def get_queryset(self):
        user = self.request.user
        #get not only chats but also groups the user is a part of , grp_members is a many to many field
        people = Follower.objects.filter(follower=user) | Follower.objects.filter(followee=user) 
        return people
    def list(self,request):
        queryset = self.get_queryset()
        serializer = FollowerSerializer(queryset,many=True)

        #send the user id along with the name of people who is connected with the logged in user
        response = []
        #followee might be the logged in user and follower might be another user or vice versa
        # so we need to check both the cases and make the array unique only , if a two users are following each other then send only one of them
        for i in serializer.data:
            if i['follower'] == request.user.id:
                response.append({
                    "user":UserSerializer(User.objects.get(id=i['followee'])).data,
                })
            else:
                response.append({
                    "user":UserSerializer(User.objects.get(id=i['follower'])).data,
                }) 
        groups = Group.objects.filter(grp_members=request.user)
        serializer2 = GroupSerializer(groups,many=True)

        #make the array unique
        response = list({v['user']['id']:v for v in response}.values())
        data = {
            "users":response,
            "groups":serializer2.data
        }
        return JsonResponse(data,safe=False)
    
class __get__all__posts__(ListAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = PostSerializer
    queryset = Post.objects.all()
    filter_backends = [SearchFilter,OrderingFilter]
    search_fields = ['post_content']
    ordering_fields = ['post_time']
    ordering = ['-post_time']

class __create__post__(CreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = PostSerializer
    queryset = Post.objects.all()

class __delete__post__(DestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = PostSerializer
    queryset = Post.objects.all()

class __update__post__(UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = PostSerializer
    queryset = Post.objects.all()

class __get__post__by__id__(RetrieveAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = PostSerializer
    queryset = Post.objects.all()


class __get__all__posts__of__logged__in__user__(ListAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = PostSerializer
    def get_queryset(self):
        user = self.request.user
        return Post.objects.filter(user=user)

class __get__user__details__(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self,request,pk):
        user = User.objects.get(id=pk)
        followers = Follower.objects.filter(followee=user)
        followees = Follower.objects.filter(follower=user)
        posts = Post.objects.filter(user=user)
        followrequests = FollowRequest.objects.filter(fol_req_to=user)
        serializer = FollowerSerializer(followers,many=True,context={'request': request})
        serializer2 = FollowerSerializer(followees,many=True,context={'request': request})
        serializer3 = PostSerializer(posts,many=True,context={'request': request})
        serializer4 = FollowRequestSerializer(followrequests,many=True,context={'request': request})
        followees = [User.objects.get(id = i['followee']) for i in serializer2.data]
        followees = UserSerializer(followees,many=True,context={'request': request})
        followers = [User.objects.get(id = i['follower']) for i in serializer.data]
        followers = UserSerializer(followers,many=True,context={'request': request})
        followrequests = [User.objects.get(id = i['fol_req_by']) for i in serializer4.data]
        followrequests = UserSerializer(followrequests,many=True,context={'request': request})
        # if(user.id == request.user.id):
        #     data = {
        #     "followers":followers.data,
        #     "followees":followees.data,
        #     "posts":serializer3.data,
        #     "followrequests":followrequests.data
        #     }
        # else:
        #     data = {
        #     "followers":followers.data,
        #     "followees":followees.data,
        #     }
        #if the current user is following the user whose details are being fetched then send the followrequests also
        print(request.user)
        print(user)
        if Follower.objects.filter(follower=request.user,followee=user).exists():
            data = {
            "followers":followers.data,
            "followees":followees.data,
            "posts":serializer3.data,
            }
        else:
            data = {
            "followers":followers.data,
            "followees":followees.data,
            }
        #if its the user whose details are being fetched then send the followrequests also
        if(user.id == request.user.id):
             data = {
            "followers":followers.data,
            "followees":followees.data,
            "posts":serializer3.data,
            "followrequests":followrequests.data
            }
        return JsonResponse(data,safe=False)
        
class __get__posts__of__all__the__users__who__the__logged__in__user__follows__or__is__following__(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self,request):
        user = request.user
        people = Follower.objects.filter(follower=user) | Follower.objects.filter(followee=user)
        posts = Post.objects.filter(user__in=people.values('followee')) | Post.objects.filter(user__in=people.values('follower'))
        serializer = PostSerializer(posts,many=True,context={'request': request})
        response = []
        for i in range(len(serializer.data)):
            response.append({
                "post":serializer.data[i],
                "user":UserSerializer(User.objects.get(id=serializer.data[i]['user'])).data
            })
        return JsonResponse(response,safe=False)
        

    


class __get__group__chats__related__to__the__group__(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self,request):
        group = request.data['group_id']
        group = Group.objects.get(grp_id=group)
        chats = GroupMessage.objects.filter(group=group)
        serializer = GroupMessageSerializer(chats,many=True)
        #also send the sender name
        response = []
        for i in serializer.data:
            response.append({
                "message":i['message'],
                "sender":UserSerializer(User.objects.get(id=i['sender'])).data,
                "created_at_date":i['created_at_date'],
                "created_at_time":i['created_at_time']
            })
        return JsonResponse(response,safe=False)
    

class __get__group__details__(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self,request,pk):
        group = Group.objects.get(grp_id=pk)
        grp_members = group.grp_members.all()
        grp_members = UserSerializer(grp_members,many=True)
        #also send the group details
        grp_details = GroupSerializer(group)
        data = {
            "grp_details":grp_details.data,
            "grp_members":grp_members.data
        }
        return JsonResponse(data,safe=False)