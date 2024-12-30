from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.contrib.auth.backends import ModelBackend
import json
from social_django.utils import load_strategy, load_backend
from social_core.backends.oauth import BaseOAuth2
from social_core.exceptions import MissingBackend
from django.middleware.csrf import get_token

@ensure_csrf_cookie
@require_http_methods(["POST"])
def login_view(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        print(f"Login attempt for username: {username}")  # Debug için
        
        if username is None or password is None:
            return JsonResponse({
                'message': 'Lütfen kullanıcı adı ve şifre girin',
                'details': {'username': username is None, 'password': password is None}
            }, status=400)
        
        user = authenticate(username=username, password=password)
        
        if user is not None:
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            return JsonResponse({
                'message': 'Giriş başarılı',
                'username': user.username
            })
        else:
            # Kullanıcı var mı kontrol et
            user_exists = User.objects.filter(username=username).exists()
            if user_exists:
                return JsonResponse({'message': 'Şifre yanlış'}, status=400)
            else:
                return JsonResponse({'message': 'Kullanıcı bulunamadı'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'message': 'Geçersiz JSON formatı'}, status=400)
    except Exception as e:
        print(f"Login error: {str(e)}")  # Debug için
        return JsonResponse({'message': f'Bir hata oluştu: {str(e)}'}, status=400)

@ensure_csrf_cookie
@require_http_methods(["POST"])
def register_view(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        print(f"Register attempt for username: {username}")  # Debug için
        
        if username is None or password is None:
            return JsonResponse({
                'message': 'Lütfen kullanıcı adı ve şifre girin',
                'details': {'username': username is None, 'password': password is None}
            }, status=400)
        
        if User.objects.filter(username=username).exists():
            return JsonResponse({'message': 'Bu kullanıcı adı zaten kullanılıyor'}, status=400)
        
        user = User.objects.create_user(username=username, password=password)
        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        
        return JsonResponse({
            'message': 'Kayıt başarılı',
            'username': user.username
        })
    except Exception as e:
        print(f"Register error: {str(e)}")  # Debug için
        return JsonResponse({'message': f'Bir hata oluştu: {str(e)}'}, status=400)

@require_http_methods(["POST"])
def logout_view(request):
    try:
        logout(request)
        return JsonResponse({'message': 'Çıkış yapıldı'})
    except Exception as e:
        return JsonResponse({'message': f'Çıkış yapılırken hata oluştu: {str(e)}'}, status=400)

def google_login(request):
    strategy = load_strategy(request)
    try:
        backend = load_backend(strategy=strategy, name='google-oauth2', redirect_uri=None)
        return backend.start()
    except MissingBackend:
        return JsonResponse({'message': 'OAuth yapılandırması eksik'}, status=400)

def github_login(request):
    strategy = load_strategy(request)
    try:
        backend = load_backend(strategy=strategy, name='github', redirect_uri=None)
        return backend.start()
    except MissingBackend:
        return JsonResponse({'message': 'OAuth yapılandırması eksik'}, status=400)

def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})