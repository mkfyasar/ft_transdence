from django.urls import path
from .views import register, login, profile, add_friend, list_friends


urlpatterns = [
    path('register/', register, name='register'),  # http://localhost:8000/api/register/
    path('login/', login, name='login'),          # http://localhost:8000/api/login/
    path('profile/', profile, name='profile'),
    path('add_friend/', add_friend, name='add_friend'),
    path('list_friends/', list_friends, name='list_friends'),
]
