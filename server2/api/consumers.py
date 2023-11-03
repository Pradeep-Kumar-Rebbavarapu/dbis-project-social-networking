# myapp/consumers.py

import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
import json
from django.contrib.auth.models import User
from .models import ChatMsg,FollowRequest,Follower
from datetime import datetime
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
            await self.send_message_to_user(data['message'], data['sender'], data['receiver'])
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
    def save_message(self, message, sender, receiver,time):
        return ChatMsg.objects.create(message=message, sender=sender, receiver=receiver,created_at=time)
    
    async def send_message_to_user(self, message, sender, receiver):
        time = datetime.now()
        print(connectedUsers)
        print("sender",sender)
        print("receiver",receiver)
        sender = await self.get_user(sender)
        receiver = await self.get_user(receiver)
        query = await self.save_message(message, sender, receiver,time)
        if receiver.id in list(connectedUsers.keys()):
            await self.send_json_to_user(connectedUsers[receiver.id], {"type": "receive_message",
                "message": message, "sender": sender.id, "receiver": receiver.id,"created_at":str(time),"id":str(query.id)} 
            )
        #send message to yourself
        await self.send_json_to_user(self.channel_name,{"type":"sent_message",
            "message":message,"sender":sender.id,"receiver":receiver.id,"created_at":str(time),"id":str(query.id)}
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
