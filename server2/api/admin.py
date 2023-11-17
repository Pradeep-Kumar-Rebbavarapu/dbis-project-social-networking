from django.contrib import admin
from .models import Post, Bookmark, ChatMsg, CommentLike, Comment, FollowRequest, Follower, GroupMessage, Group, Notification
from django.contrib.auth.models import User
 # import UserAdmin
from django.contrib.auth.admin import UserAdmin
# Register your models here.

class CustomUserAdmin(UserAdmin):
    list_display = ('id','username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'last_login')
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

admin.site.register(Post)

admin.site.register(Bookmark)

admin.site.register(ChatMsg)

admin.site.register(CommentLike)

admin.site.register(Comment)

admin.site.register(FollowRequest)

admin.site.register(Follower)


admin.site.register(GroupMessage)

admin.site.register(Group)


admin.site.register(Notification)