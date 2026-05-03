from django.db import models


class WeatherRecord(models.Model):
    """Stores a snapshot of weather data for historical tracking."""
    city        = models.CharField(max_length=100, db_index=True)
    temperature = models.FloatField()
    feels_like  = models.FloatField()
    humidity    = models.IntegerField()
    wind_speed  = models.FloatField()
    wind_deg    = models.IntegerField(default=0)
    description = models.CharField(max_length=200)
    icon        = models.CharField(max_length=20)
    pressure    = models.IntegerField()
    visibility  = models.IntegerField()
    timestamp   = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.city} — {self.temperature}°C @ {self.timestamp:%Y-%m-%d %H:%M}"