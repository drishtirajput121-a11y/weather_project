from django.urls import path
from . import views

urlpatterns = [
    path('current/',     views.current_weather, name='current-weather'),
    path('forecast/',    views.forecast,        name='forecast'),
    path('past-week/',   views.past_week,       name='past-week'),
    path('air-quality/', views.air_quality,     name='air-quality'),
]