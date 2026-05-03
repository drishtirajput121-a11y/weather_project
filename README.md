# Weather Dashboard

A premium, responsive weather application built with a Django backend and a modular JavaScript frontend. This project provides real-time meteorological data, air quality indices, and interactive maps through a modern, glassmorphism-inspired interface.

## Core Features

*   Real-time Weather: Instant access to current temperature, humidity, wind speed, and atmospheric pressure.
*   Five-Day Forecast: Detailed 3-hour interval breakdown and daily summaries for upcoming weather patterns.
*   Air Quality Index (AQI): Live monitoring of air pollution levels including descriptive health categories.
*   Interactive Map: Visual representation of location data using Leaflet.js integration.
*   Dynamic UI: A single-page experience that updates instantly without page reloads, featuring smooth transitions and loading states.
*   Geolocation: Automatic local weather detection based on browser location permissions.

## Technical Stack

### Backend
*   Django: High-level Python web framework for core logic and routing.
*   Django REST Framework (DRF): Robust API architecture for serving weather data to the frontend.
*   PostgreSQL: Production-grade relational database for historical data management.
*   Requests: Handles communication with the OpenWeatherMap API.

### Frontend
*   Vanilla JavaScript (ES6+): Modular architecture using modern import/export syntax.
*   Chart.js: Interactive data visualization for temperature trends and hourly breakdowns.
*   Leaflet.js: Lightweight mapping library for geographical visualizations.
*   CSS3: Custom design system utilizing CSS variables, Flexbox/Grid, and glassmorphism effects.

### DevOps
*   Render: Cloud hosting for web services and managed PostgreSQL databases.
*   Whitenoise: Efficient static file serving for Django applications.
*   Gunicorn: Production-grade WSGI HTTP server.

## Project Architecture

The frontend logic is divided into specialized modules to ensure maintainability and performance:

*   app.js: The main entry point responsible for initialization and event coordination.
*   api.js: Handles all network requests and asynchronous data orchestration.
*   render.js: Manages DOM manipulation, chart initialization, and map rendering.
*   utils.js: Contains shared configuration, weather calculations, and helper functions.

## Local Setup

1. Clone the repository:
   git clone https://github.com/yourusername/weather-dashboard.git

2. Create and activate a virtual environment:
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate

3. Install dependencies:
   pip install -r requirements.txt

4. Set up your environment variables:
   export OPENWEATHER_API_KEY='your_api_key'
   export DJANGO_SECRET_KEY='your_secret_key'

5. Run migrations and start the server:
   python manage.py migrate
   python manage.py runserver

## Deployment

This project is configured for seamless deployment on Render using the included render.yaml Blueprint.

1. Connect your GitHub repository to Render.
2. Apply the Blueprint configuration.
3. Configure the OPENWEATHER_API_KEY in the environment settings.

## Credits

Developed by Drishti Rajput.
Data provided by OpenWeatherMap API.
