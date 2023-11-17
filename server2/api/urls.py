from django.urls import path,include

from .views import __get__all__chats__related__to__logged__in__users__,__search__user__based__on__username__,__get__users__who__logged__in__user__has__chatted__,__get__all__posts__,__create__post__,__delete__post__,__update__post__,__get__post__by__id__,__get__all__posts__of__logged__in__user__,__get__chats__related__to__user__and__receiver__,__get__user__details__,__get__posts__of__all__the__users__who__the__logged__in__user__follows__or__is__following__,__get__group__chats__related__to__the__group__,__get__group__details__


urlpatterns = [
    path('__get__all__chats__related__to__logged__in__users__/',__get__all__chats__related__to__logged__in__users__.as_view()),
    path('__search__user__based__on__username__/',__search__user__based__on__username__.as_view()),
    path('__get__users__who__logged__in__user__has__chatted__/',__get__users__who__logged__in__user__has__chatted__.as_view()),
    #write urls for create,delete,update,list,retrieve
    path('__get__all__posts__',__get__all__posts__.as_view()),
    path('__create__post__/',__create__post__.as_view()),
    path('__delete__post__/<uuid:pk>/',__delete__post__.as_view()),
    path('__update__post__/<uuid:pk>/',__update__post__.as_view()),
    path('__get__post__by__id__/<str:pk>/',__get__post__by__id__.as_view()),
    path('__get__all__posts__of__logged__in__user__/',__get__all__posts__of__logged__in__user__.as_view()),
    path('__get__chats__related__to__user__and__receiver__/',__get__chats__related__to__user__and__receiver__.as_view()),
    path('__get__user__details__/<int:pk>',__get__user__details__.as_view()),
    path('__get__posts__of__all__the__users__who__the__logged__in__user__follows__or__is__following__',__get__posts__of__all__the__users__who__the__logged__in__user__follows__or__is__following__.as_view()),
    path('__get__group__chats__related__to__the__group__/',__get__group__chats__related__to__the__group__.as_view()),
    path('__get__group__details__/<uuid:pk>/',__get__group__details__.as_view())
]
