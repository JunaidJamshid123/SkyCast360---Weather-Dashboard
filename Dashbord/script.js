document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '615dac6f2861732d2a1ca335b1517e2b'; // Replace with your OpenWeatherMap API key
    const elements = {
        searchBar: document.querySelector('.search-bar'),
        locationName: document.querySelector('.location-name'),
        temperature: document.querySelector('.temperature'),
        weatherCondition: document.querySelector('.weather-condition'),
        currentLocation: document.querySelector('.current-location'),
        humidity: document.querySelector('.weather-condition:nth-child(3)'),
        windSpeed: document.querySelector('.weather-condition:nth-child(4)'),
        weatherIcon: document.querySelector('.weather-icon img'),
        time: document.querySelector('.time'),
        weatherCard: document.querySelector('.weather-card'),
        forecastSection: document.querySelector('.forecast-cards')
    };

    const fetchWeatherData = async (city) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('City not found');
            const data = await response.json();
            updateDashboard(data);
            fetchWeatherForecast(data.coord.lat, data.coord.lon);
        } catch (error) {
            alert(error.message);
        }
    };

    const fetchWeatherForecast = async (lat, lon) => {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch forecast data');
            const data = await response.json();
            updateForecast(data);
        } catch (error) {
            console.log('Error fetching forecast data:', error);
        }
    };

    const updateDashboard = (data) => {
        elements.locationName.textContent = `${data.name}, ${data.sys.country}`;
        elements.temperature.textContent = `${Math.round(data.main.temp)}°C`;
        elements.weatherCondition.innerHTML = `<img src="../Images/cloudy.png" alt="Weather Icon"> ${capitalize(data.weather[0].description)}`;
        elements.humidity.innerHTML = `<img src="../Images/drop.png" alt="Humidity Icon"> Humidity: ${data.main.humidity}%`;
        elements.windSpeed.innerHTML = `<img src="../Images/windy.png" alt="Wind Icon"> Wind Speed: ${data.wind.speed} km/h`;
        elements.weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
        elements.weatherIcon.alt = data.weather[0].description;
        elements.currentLocation.textContent = 'Current Location';
        elements.time.textContent = getCurrentTime();
        changeCardBackground(data.weather[0].main.toLowerCase());
    };

    const changeCardBackground = (condition) => {
        const backgrounds = {
            clear: "url('../Images/sunnyDay.jpg')",
            clouds: "url('../Images/Partiallycloudy.jpg')",
            rain: "url('../Images/RainyDay.jpg')",
            default: "url('../Images/Partiallycloudy.jpg')"
        };
        elements.weatherCard.style.backgroundImage = backgrounds[condition] || backgrounds.default;
    };

   const updateForecast = (data) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = new Date().getDay();
    const dailyForecasts = {};
    
    // Iterate through the list of forecasts
    data.list.forEach(item => {
        const date = new Date(item.dt_txt);
        const dayIndex = date.getDay();

        // Only consider forecasts at noon (12:00 PM) for each day
        if (!dailyForecasts[dayIndex] && date.getHours() === 12) {
            dailyForecasts[dayIndex] = item;
        }
    });

    elements.forecastSection.innerHTML = '';
    let daysCount = 0;

    // Start fetching forecasts from the next day
    for (let i = 1; daysCount < 5; i++) {
        const dayIndex = (currentDay + i) % 7; // Wrap around the week
        const forecast = dailyForecasts[dayIndex];

        if (forecast) {
            const card = createForecastCard(forecast, daysOfWeek[dayIndex]);
            elements.forecastSection.appendChild(card);
            daysCount++;
        }
    }
};


   const createForecastCard = (forecast, dayName) => {
    const weatherCondition = forecast.weather[0].main.toLowerCase();

    // Map weather conditions to corresponding background images
    const iconMap = {
        rain: '../Images/rain.png',
        clear: '../Images/sun.png',
        default: '../Images/cloudy.png'
    };
    
    // Choose the appropriate background image
    const backgroundImage = iconMap[weatherCondition] || iconMap.default;

    // Create a forecast card element
    const card = document.createElement('div');
    card.classList.add('forecast-card');

    // Set the card content
    card.innerHTML = `
        <div class="day">${dayName}</div>
        <div class="weather-icon">
            <img src="${backgroundImage}" alt="${forecast.weather[0].main} Icon">
        </div>
        <div class="condition">${forecast.weather[0].main}</div>
        <div class="temperature">
            ${Math.round(forecast.main.temp)}°C / ${(forecast.main.temp * 9 / 5 + 32).toFixed(1)}°F
        </div>
    `;
    return card;
};


    const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleString('en-US', {
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    elements.searchBar.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const city = elements.searchBar.value.trim();
            if (city) fetchWeatherData(city);
        }
    });
});
