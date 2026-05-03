import requests
import os
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from .models import WeatherRecord
from .serializers import WeatherRecordSerializer

API_KEY = os.environ.get('OPENWEATHER_API_KEY', '')


def homepage(request):
    """Serve the main weather dashboard HTML page."""
    return render(request, 'index.html')


@api_view(['GET'])
def current_weather(request):
    """Fetch current weather for a city and save to DB for historical tracking."""
    city = request.query_params.get('city', 'Delhi')
    if not city or len(city) > 100:
        return Response({'error': 'Invalid city name'}, status=status.HTTP_400_BAD_REQUEST)

    url = (
        f'https://api.openweathermap.org/data/2.5/weather'
        f'?q={city}&appid={API_KEY}&units=metric'
    )
    try:
        resp = requests.get(url, timeout=10)
        data = resp.json()

        if resp.status_code != 200:
            return Response(
                {'error': data.get('message', 'City not found')},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Save snapshot to PostgreSQL for past-week history
        # Wrapped in try/except so API still works even if DB save fails
        try:
            WeatherRecord.objects.create(
                city=data.get('name', city),
                temperature=data['main']['temp'],
                feels_like=data['main'].get('feels_like', data['main']['temp']),
                humidity=data['main'].get('humidity', 0),
                wind_speed=data.get('wind', {}).get('speed', 0),
                wind_deg=data.get('wind', {}).get('deg', 0),
                description=data['weather'][0].get('description', ''),
                icon=data['weather'][0].get('icon', '01d'),
                pressure=data['main'].get('pressure', 0),
                visibility=data.get('visibility', 0),
            )
        except Exception as e:
            # Don't let DB errors prevent returning weather data
            print(f'[WARNING] Failed to save weather record: {e}')

        return Response(data)

    except requests.RequestException as e:
        return Response(
            {'error': f'Weather service unavailable: {str(e)}'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


@api_view(['GET'])
def past_week(request):
    """Return past 7 days of stored weather records for a city."""
    city = request.query_params.get('city', 'Delhi')
    week_ago = timezone.now() - timedelta(days=7)
    records = WeatherRecord.objects.filter(
        city__iexact=city, timestamp__gte=week_ago
    )
    serializer = WeatherRecordSerializer(records, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def forecast(request):
    """Fetch 5-day / 3-hour forecast from OpenWeatherMap."""
    city = request.query_params.get('city', 'Delhi')
    url = (
        f'https://api.openweathermap.org/data/2.5/forecast'
        f'?q={city}&appid={API_KEY}&units=metric&cnt=40'
    )
    try:
        resp = requests.get(url, timeout=10)
        data = resp.json()
        if resp.status_code != 200:
            return Response(
                {'error': data.get('message', 'Forecast unavailable')},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(data)
    except requests.RequestException as e:
        return Response(
            {'error': f'Forecast service unavailable: {str(e)}'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


@api_view(['GET'])
def air_quality(request):
    """Fetch Air Quality Index using OpenWeatherMap Air Pollution API."""
    city = request.query_params.get('city', 'Delhi')

    # First get coordinates for the city
    geo_url = (
        f'https://api.openweathermap.org/data/2.5/weather'
        f'?q={city}&appid={API_KEY}&units=metric'
    )
    try:
        geo_resp = requests.get(geo_url, timeout=10)
        geo_data = geo_resp.json()
        if geo_resp.status_code != 200:
            return Response(
                {'error': 'City not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        lat = geo_data['coord']['lat']
        lon = geo_data['coord']['lon']

        # Now fetch air quality
        aqi_url = (
            f'https://api.openweathermap.org/data/2.5/air_pollution'
            f'?lat={lat}&lon={lon}&appid={API_KEY}'
        )
        aqi_resp = requests.get(aqi_url, timeout=10)
        return Response(aqi_resp.json())

    except requests.RequestException as e:
        return Response(
            {'error': f'Air quality service unavailable: {str(e)}'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
