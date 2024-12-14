from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import json
from .models import Friendship

@csrf_exempt
def register(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Bu kullanıcı adı zaten alınmış.'}, status=400)

        user = User.objects.create_user(username=username, password=password)
        user.save()
        return JsonResponse({'message': 'Kayıt başarılı!'})

    return JsonResponse({'error': 'Geçersiz istek.'}, status=400)


@csrf_exempt
def login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        user = User.objects.filter(username=username).first()
        if user and user.check_password(password):
            return JsonResponse({'message': 'Giriş başarılı!'})

        return JsonResponse({'error': 'Hatalı kullanıcı adı veya şifre.'}, status=400)

    return JsonResponse({'error': 'Geçersiz istek.'}, status=400)

@csrf_exempt
@login_required
def profile(request):
    user = request.user
    data = {
        'username': user.username,
        'email': user.email,
        'date_joined': user.date_joined,
    }
    return JsonResponse(data)


@login_required
@csrf_exempt
def add_friend(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        friend_username = data.get('friend_username')
        try:
            friend = User.objects.get(username=friend_username)
            Friendship.objects.create(user=request.user, friend=friend)
            return JsonResponse({'message': f"{friend_username} arkadaş olarak eklendi!"})
        except User.DoesNotExist:
            return JsonResponse({'error': 'Kullanıcı bulunamadı.'}, status=404)

@login_required
def list_friends(request):
    friendships = Friendship.objects.filter(user=request.user)
    friends = [{'username': f.friend.username, 'date_added': f.created_at} for f in friendships]
    return JsonResponse({'friends': friends})