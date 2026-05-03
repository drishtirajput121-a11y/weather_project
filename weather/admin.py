from django.contrib import admin
from .models import WeatherRecord


@admin.register(WeatherRecord)
class WeatherRecordAdmin(admin.ModelAdmin):
    list_display  = ('city', 'temperature', 'humidity', 'description', 'timestamp')
    list_filter   = ('city', 'timestamp')
    search_fields = ('city',)
    ordering      = ('-timestamp',)
    readonly_fields = ('timestamp',)
