/* ============================================================
   APP — Main Entry Point
   ============================================================ */

import { fetchAllData, getIsFetching } from './api.js';
import { initSearch, initTabs, currentCity } from './render.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialise UI components
    initSearch(fetchAllData);
    initTabs();

    // Try geolocation first, fall back to default city
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            () => {
                // If location succeeds, fetch for default city anyway 
                // (OpenWeatherMap free tier works better with city names)
                if (!getIsFetching()) fetchAllData(currentCity);
            },
            () => {
                // If location fails, use default city
                if (!getIsFetching()) fetchAllData(currentCity);
            },
            { timeout: 3000 }
        );
        
        // Safety fallback in case geolocation hangs
        setTimeout(() => {
            if (!getIsFetching()) fetchAllData(currentCity);
        }, 3500);
    } else {
        fetchAllData(currentCity);
    }
});
