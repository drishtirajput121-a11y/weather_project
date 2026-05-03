from django.contrib import admin
from django.urls import path, include
from weather.views import homepage

urlpatterns = [
    path('', homepage,name='homepage'),
    path('admin/', admin.site.urls),
    path('api/',   include('weather.urls')),
]
