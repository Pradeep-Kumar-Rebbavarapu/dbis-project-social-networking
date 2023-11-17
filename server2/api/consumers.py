# myapp/consumers.py

import json
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
import json
from django.contrib.auth.models import User
from .models import ChatMsg,FollowRequest,Follower,Group,GroupMessage,Post
from datetime import datetime
from .helpers import *
messages = {}
connectedUsers = {} #list of all connected users , their id along with their socket_id


print(connectedUsers)
class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        print(self.channel_name)
        self.test = []
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        connectedUsers[int(self.room_name)] = self.channel_name
        print(connectedUsers)
        self.room_group_name = f"chat_{self.room_name}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def receive_json(self, text_data):
        
        data = text_data["data"]
        if text_data["type"] == 'send_message_to_user':
            await self.send_message_to_user(data['message'], data['sender'], data['receiver'],data['group'])
        elif text_data["type"] == "save_id":
            print('data',data)
            connectedUsers[data['id']] = self.channel_name
            print('connectedUsers',connectedUsers)
        elif text_data['type'] == "follow_request":
            request = await self.save_follow_request(data)
            await database_sync_to_async(request.save)()
            await self.send_json_to_user(self.channel_name,{"type":"follow_request_sent","sender":data['follower'],"receiver":data['followee']})
        elif text_data['type'] == "accept_follow_request":
            data = await self.save_request_status(data['follower'],data['followee'])
            await database_sync_to_async(data.save)()
            await self.send_json_to_user(self.channel_name,{"type":"follow_request_accepted"})
        elif text_data['type'] == "reject_follow_request":
            data = await self.delete_request(data['follower'],data['followee'])
            await self.send_json_to_user(self.channel_name,{"type":"follow_request_rejected"})
        elif text_data['type'] == "unfollow_request":
            await self.delete_follower(data['follower'],data['followee'])
            await self.send_json_to_user(self.channel_name,{"type":"unfollow_request_sent"})
        elif text_data['type'] == "create_group":
            await self.create_group(data['group_name'],data['users'],data['admin'])
        elif text_data['type'] == "remove":
            #delete user from the group
            await self.remove_user_from_group(data['group_id'],data['receiver'])
        elif text_data['type'] == "add_user_to_group":
            await self.add_user_to_group(data['group_id'],data['users'])
        elif text_data['type'] == "leave_group":
            await self.leave_user(data['group_id'],data['sender'])
        elif text_data['type'] == 'like':
            await self.like_post(data['post_id'],data['user_id'])
        elif text_data['type'] == "unlike":
            await self.unlike_post(data['post_id'],data['user_id'])

    
    @database_sync_to_async
    def get_post(self,post_id):
        return Post.objects.get(id=post_id)
    

    @database_sync_to_async
    def add_like(self,post,user):
        post.post_liked_by.add(user)
        return post
    
    @database_sync_to_async
    def remove_like(self,post,user):
        post.post_liked_by.remove(user)
        return post
        
    
    async def unlike_post(self,post_id,user_id):
        post = await self.get_post(post_id)
        user = await self.get_user(user_id)
        new_post = await self.remove_like(post,user)
        await database_sync_to_async(new_post.save)()
        if user_id in list(connectedUsers.keys()):
            await self.send_json_to_user(connectedUsers[user_id],{"type":"post_unliked","post_id":post_id})

    async def like_post(self,post_id,user_id):
        post = await self.get_post(post_id)
        user = await self.get_user(user_id)
        new_post = await self.add_like(post,user)
        await database_sync_to_async(new_post.save)()
        await self.send_json_to_user(self.channel_name,{"type":"post_liked"})
        if user_id in list(connectedUsers.keys()):
            await self.send_json_to_user(connectedUsers[user_id],{"type":"post_liked","post_id":post_id})

    @database_sync_to_async
    def delete_user_from_group(self,group,user):
        return group.grp_members.remove(user)

    async def leave_user(self,group_id,user_id):
        user = await self.get_user(user_id)
        group = await self.get_group(group_id)
        deleted_group = await self.delete_user_from_group(group,user)
        if user.id in list(connectedUsers.keys()):
            await self.send_json_to_user(connectedUsers[user.id],{"type":"user_left_group","group_id":group_id}
            )
        
        

    @database_sync_to_async
    def save_user_to_group(self,group,user):
        return group.grp_members.add(user)
    

    async def add_user_to_group(self,group_id,users):
        group = await self.get_group(group_id)
        for user in users:
            user = await self.get_user(user)
            await self.save_user_to_group(group,user)
        await self.send_json_to_user(self.channel_name,{"type":"user_added_to_group"})
        for user in users:
            if user in list(connectedUsers.keys()):
                await self.send_json_to_user(connectedUsers[user],{"type":"user_added_to_group","group_id":group_id})
        
    @database_sync_to_async
    def delete_user_from_group(self,group,user):
        return group.grp_members.remove(user)

    async def remove_user_from_group(self,group_id,user_id):
        user = await self.get_user(user_id)
        group = await self.get_group(group_id)
        deleted_group = await self.delete_user_from_group(group,user)
        await self.send_json_to_user(self.channel_name,{"type":"user_removed_from_group"})
        if user in list(connectedUsers.keys()):
            await self.send_json_to_user(connectedUsers[user.id],{"type":"user_removed_from_group","group_id":group_id})
        
    async def create_group(self,group_name,users,admin):
        admin = await self.get_user(admin)
        group = await self.save_group(group_name,admin,users)
        await database_sync_to_async(group.save)()
        #save users to manyTomany Field
        print(users)
        for user in users:
            #send message to each users active
            active_user = await self.get_user(user)
            if active_user.id in list(connectedUsers.keys()):
                await self.send_json_to_user(connectedUsers[active_user.id],{"type":"group_created","group_name":group_name,"group_id":str(group.grp_id),"admin":str(admin.username)})
       
        
        

    
    @database_sync_to_async
    def save_group(self,group_name,admin,users):
        #i have a ,many to many field of multiple users linked to a single group and users is an list
        group = Group.objects.create(grp_name=group_name,grp_admin=admin)
        for user in users:
            user = User.objects.get(id=user)
            group.grp_members.add(user)
        group.grp_members.add(admin)
        return group


    @database_sync_to_async
    def delete_follower(self,follower,followee):
        follower = User.objects.get(id=follower)
        followee = User.objects.get(id=followee)
        follower = Follower.objects.get(follower=follower,followee=followee)
        follower.delete()

    @database_sync_to_async
    def delete_request(self,follower,followee):
        follower = User.objects.get(id=follower)
        followee = User.objects.get(id=followee)
        request = FollowRequest.objects.get(fol_req_by=follower,fol_req_to=followee)
        request.delete()
    
    @database_sync_to_async
    def save_request_status(self,follower,followee):
        follower = User.objects.get(id=follower)
        followee = User.objects.get(id=followee)
        save_object = Follower.objects.create(follower=follower,followee=followee)
        request = FollowRequest.objects.get(fol_req_by=follower,fol_req_to=followee)
        request.delete()
        return save_object
    
    @database_sync_to_async
    def save_follow_request(self,data):
        sender = User.objects.get(id=data['follower'])
        receiver = User.objects.get(id=data['followee'])
        request = FollowRequest.objects.create(fol_req_by=sender,fol_req_to=receiver)
        #save the request
        return request
    
    @database_sync_to_async
    def get_user(self, id):
        return User.objects.get(id=id)
    

    @database_sync_to_async
    def save_message(self, message, sender, receiver,date,time):
        return ChatMsg.objects.create(message=message, sender=sender, receiver=receiver,created_at_date=date,created_at_time=time)
    
    async def send_message_to_user(self, message, sender, receiver,group):
        if(group == True):
            await self.send_group_message(message,sender,receiver)
        else:
            await self.send_individual_message(message, sender, receiver)
        
    @database_sync_to_async
    def get_group(self,id):
        return Group.objects.get(grp_id=id)
    
    @database_sync_to_async
    def save_group_message(self,message, sender, receiver, date, time):
        return GroupMessage.objects.create(message=message, sender=sender, group=receiver, created_at_date=date, created_at_time=time)

    

    @database_sync_to_async
    def save_group_instance(self, message):
        return message.save()
    
    @sync_to_async
    def get_group_users(self,group):
        return list(group.grp_members.all())
    
    async def send_group_message(self, message, sender, receiver):
        date = getdate()
        time = gettime()
        sender = await self.get_user(sender)
        receiver = await self.get_group(receiver)
        message = await self.save_group_message(message, sender, receiver, date, time)
        await self.save_group_instance(message)
        users = await self.get_group_users(receiver)
        print(users)
        for user in users:
            print(user.id,list(connectedUsers.keys()))
            if user.id in list(connectedUsers.keys()):
                print('userid',user.id)
                await self.send_json_to_user(connectedUsers[user.id], {"type": "receive_message",
                    "message": message.message, "sender": str(sender.username), "receiver": str(receiver.grp_id),"created_at_date":date,"created_at_time":time,"id":str(message.id)} 
                )
    
    async def send_individual_message(self, message, sender, receiver):
        date = getdate()
        time = gettime()
        print(connectedUsers)
        print("sender",sender)
        print("receiver",receiver)
        sender = await self.get_user(sender)
        receiver = await self.get_user(receiver)
        query = await self.save_message(message, sender, receiver,date,time)
        if receiver.id in list(connectedUsers.keys()):
            await self.send_json_to_user(connectedUsers[receiver.id], {"type": "receive_message",
                "message": message, "sender":str(sender.username), "receiver": str(receiver.username),"created_at_date":date,"created_at_time":time,"id":str(query.id)} 
            )
        #send message to yourself
        await self.send_json_to_user(self.channel_name,{"type":"sent_message",
            "message":message,"sender":str(sender.username),"receiver":str(receiver.username),"created_at_date":date,"created_at_time":time,"id":str(query.id)}
        )

    async def send_json_to_room(self, room_id, data):
        await self.channel_layer.group_send(
            room_id,
            {
                'type': 'send_json',
                'data': data
            }
        )

    async def send_json_to_user(self, socket_id, data):
        await self.channel_layer.send(
            socket_id,
            {
                'type': 'send_json',
                'data': data
            }
        )

    async def send_json(self, event):
        data = event['data']
        await self.send(text_data=json.dumps(data))

    
