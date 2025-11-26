const API_KEY = "0799e9cd716a70e392dd03c9616c6830";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const errorMessage = document.getElementById('error-message');
const weatherContent = document.getElementById('weather-content');

// UI Elements
const cityNameEl = document.getElementById('city-name');
const tempEl = document.getElementById('temperature');
const iconEl = document.getElementById('weather-icon');
const conditionEl = document.getElementById('condition');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const pressureEl = document.getElementById('pressure');
const adviceTextEl = document.getElementById('advice-text');

// Map
let map;
let marker;

// Initialize Map
function initMap() {
    // Default view (approx center of world or a neutral location)
    map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

initMap();

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeather(city);
        }
    }
});

async function getWeather(city) {
    try {
        errorMessage.classList.add('hidden');

        const response = await fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        if (data.cod !== 200) {
            throw new Error(data.message);
        }

        updateUI(data);
        weatherContent.classList.remove('hidden');

    } catch (error) {
        showError(error.message);
        weatherContent.classList.add('hidden');
    }
}

function updateUI(data) {
    // Basic Info
    cityNameEl.textContent = data.name;
    tempEl.textContent = `${data.main.temp.toFixed(1)} °C`;
    conditionEl.textContent = data.weather[0].description;

    // Icon
    const iconCode = data.weather[0].icon;
    iconEl.src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

    // Details
    humidityEl.textContent = `${data.main.humidity}%`;
    windSpeedEl.textContent = `${data.wind.speed} m/s`;
    pressureEl.textContent = `${data.main.pressure} hPa`;

    // Advice Logic (matching Python script)
    const description = data.weather[0].description.toLowerCase();
    const temp = data.main.temp;
    let advice = "Have a Nice Day!";

    if (description.includes("rain") || description.includes("shower") || description.includes("thunderstorm")) {
        advice = "Grab an umbrella ☂️";
    } else if (description.includes("clear") || (temp > 28)) {
        advice = "Apply sunscreen 🧴";
    }
    adviceTextEl.textContent = advice;

    // Update Map
    const lat = data.coord.lat;
    const lon = data.coord.lon;
    updateMap(lat, lon, data.name);
}

function updateMap(lat, lon, cityName) {
    map.setView([lat, lon], 10);

    if (marker) {
        map.removeLayer(marker);
    }

    marker = L.marker([lat, lon]).addTo(map)
        .bindPopup(cityName)
        .openPopup();
}

function showError(message) {
    errorMessage.textContent = `Error: ${message}`;
    errorMessage.classList.remove('hidden');
}
