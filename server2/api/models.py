from django.db import models
import uuid
from django.contrib.auth.models import User
from .helpers import *

def upload_post_image(instance, filename):
    return f'posts/{instance.user.id}/{filename}'


class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE,default=None)
    post_title = models.CharField(max_length=100, null=True,default=None,blank=True)
    post_content = models.TextField( null=True,default=None,blank=True)
    post_img = models.ImageField(upload_to=upload_post_image, null=True,default=None,blank=True)
    post_time = models.DateTimeField(default=None, null=True,blank=True)
    post_liked_by = models.ManyToManyField(User,related_name='liked_posts', null=True,default=None,blank=True)
    post_comments = models.ManyToManyField('Comment', related_name='comments',null=True,default=None,blank=True)



class Bookmark(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    time = models.DateTimeField(default=None, null=True)

class ChatMsg(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    message = models.TextField()
    created_at_date = models.CharField(max_length=225,default=getdate(), null=True)
    created_at_time = models.CharField(max_length=225,default=gettime(), null=True)

class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    commented_by = models.ForeignKey(User, on_delete=models.CASCADE)
    comment_body = models.TextField()
    commented_by_name = models.CharField(max_length=100, default=None, null=True)

class CommentLike(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE)
    liked_by = models.ForeignKey(User, on_delete=models.CASCADE)
    time = models.DateTimeField(default=None, null=True)


class FollowRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fol_req_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_requests')
    fol_req_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_requests')
    status = models.CharField(max_length=10, choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')], default='pending')

class Follower(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    followee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followees')



class GroupMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message = models.TextField()
    group = models.ForeignKey('Group', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at_date = models.CharField(max_length=225,default=getdate(), null=True)
    created_at_time = models.CharField(max_length=225,default=gettime(), null=True)

class Group(models.Model):
    grp_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    grp_name = models.CharField(max_length=50)
    created_at_date = models.CharField(max_length=225,default=getdate(), null=True)
    created_at_time = models.CharField(max_length=225,default=gettime(), null=True)
    grp_admin = models.ForeignKey(User, on_delete=models.CASCADE,related_name='admin',null=True,default=None,blank=True)
    grp_members = models.ManyToManyField(User,related_name='members',null=True,default=None,blank=True)

class Image(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    link = models.CharField(max_length=100)

class Invitation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    invite_to = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')], default='pending')



class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    notify_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notify_by = models.ForeignKey(User, on_delete=models.CASCADE,related_name='notified_by')
    type = models.CharField(max_length=10, choices=[('commented', 'Commented'), ('fol_req', 'Follow Request'), ('invitation', 'Invitation')], default='commented')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, null=True)




