// Replace with your actual API key
const API_KEY = '615dac6f2861732d2a1ca335b1517e2b';

// Select the necessary elements
const cityInput = document.getElementById('cityInput');
const searchIcon = document.querySelector('.search-icon');
const locationName = document.getElementById('location-name');
const temperatureElement = document.getElementById('temperature');
const chatbotIcon = document.querySelector('.chatbot-icon');
const chatbotContainer = document.querySelector('.chatbot-container');
const chatbotSend = document.querySelector('.chatbot-send');
const chatbotInput = document.querySelector('.chatbot-input');
const chatbotBody = document.querySelector('.chatbot-body');

// Function to fetch weather data for a specific city
async function fetchWeatherData(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        displayWeatherData(data);
        fetchForecastData(data.coord.lat, data.coord.lon); // Fetch the forecast data based on coordinates
    } catch (error) {
        alert(error.message); // Alert if there is an error (e.g., city not found)
    }
}

// Function to display the current weather data
function displayWeatherData(data) {
    const city = data.name;
    const country = data.sys.country;
    const temperature = Math.round(data.main.temp);

    locationName.textContent = `${city}, ${country}`;
    temperatureElement.textContent = `${temperature}°C`;
}

// Function to fetch 5-day weather forecast data
async function fetchForecastData(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        if (!response.ok) {
            throw new Error('Forecast data not found');
        }
        const data = await response.json();
        displayForecastData(data);
        displayForecastTable(data); // Call the new function here
    } catch (error) {
        alert(error.message);
    }
}

// Function to display the forecast data in charts
function displayForecastData(data) {
    const temperatures = [];
    const weatherConditions = {};

    // Process forecast data
    data.list.forEach((item, index) => {
        if (index < 5) { // Only take the first 5 entries (next 5 days)
            temperatures.push(Math.round(item.main.temp));
            const condition = item.weather[0].main;
            weatherConditions[condition] = (weatherConditions[condition] || 0) + 1;
        }
    });

    // Create the charts
    createTemperatureBarChart(temperatures);
    createDoughnutChart(weatherConditions);
    createLineChart(temperatures);
}

// Chart.js functions
function createTemperatureBarChart(temperatures) {
    const ctx = document.getElementById('chart1').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'],
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                animation: {
                    delay: (context) => {
                        if (context.datasetIndex === 0) {
                            return context.dataIndex * 100; // Delay each bar's appearance
                        }
                        return 0;
                    },
                }
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createDoughnutChart(weatherConditions) {
    const ctx = document.getElementById('chart2').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(weatherConditions),
            datasets: [{
                data: Object.values(weatherConditions),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        }
    });
}

function createLineChart(temperatures) {
    const ctx = document.getElementById('chart3').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'],
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1
            }]
        }
    });
}

// Function to display forecast data in a table with unique dates
function displayForecastTable(data) {
    const forecastTable = document.querySelector('#forecastTable tbody');
    forecastTable.innerHTML = ''; // Clear previous data

    // Use a Set to track dates and ensure only one entry per day is shown
    const uniqueDates = new Set();

    // Filter forecast data for one entry per day
    const forecastData = data.list.filter((item) => {
        const date = new Date(item.dt_txt).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        if (!uniqueDates.has(date)) {
            uniqueDates.add(date);
            return true; // Keep this item (first occurrence for the day)
        }
        return false; // Skip other entries for the same day
    }).map((item) => {
        const date = new Date(item.dt_txt);
        const formattedDate = date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        return {
            date: formattedDate, // Use formatted date
            temperature: Math.round(item.main.temp),
            humidity: item.main.humidity,
            weatherCondition: item.weather[0].main,
            windSpeed: item.wind.speed
        };
    }).slice(0, 5); // Limit to 5 unique days

    // Append rows to the table
    forecastData.forEach((day) => {
        const row = `
            <tr>
                <td>${day.date}</td>
                <td>${day.temperature}°C</td>
                <td>${day.humidity}%</td>
                <td>${day.weatherCondition}</td>
                <td>${day.windSpeed} m/s</td>
            </tr>
        `;
        forecastTable.insertAdjacentHTML('beforeend', row);
    });

    // Store forecast data globally for sorting/filtering
    window.forecastData = forecastData;
}

// Sorting and filtering functions
document.getElementById('sortAsc').addEventListener('click', () => {
    const sortedData = window.forecastData.slice().sort((a, b) => a.temperature - b.temperature);
    updateTable(sortedData);
});

document.getElementById('sortDesc').addEventListener('click', () => {
    const sortedData = window.forecastData.slice().sort((a, b) => b.temperature - a.temperature);
    updateTable(sortedData);
});

document.getElementById('filterRain').addEventListener('click', () => {
    const filteredData = window.forecastData.filter(day => day.weatherCondition.includes('Rain'));
    updateTable(filteredData);
});

document.getElementById('highestTemp').addEventListener('click', () => {
    const highestTempDay = window.forecastData.reduce((max, day) => day.temperature > max.temperature ? day : max, window.forecastData[0]);
    updateTable([highestTempDay]);
});

// Function to update the table with new data
function updateTable(data) {
    const forecastTable = document.querySelector('#forecastTable tbody');
    forecastTable.innerHTML = ''; // Clear the table
    data.forEach((day) => {
        const row = `
            <tr>
                <td>${day.date}</td> <!-- Changed from day.day to day.date -->
                <td>${day.temperature}°C</td>
                <td>${day.humidity}%</td>
                <td>${day.weatherCondition}</td>
                <td>${day.windSpeed} m/s</td>
            </tr>
        `;
        forecastTable.insertAdjacentHTML('beforeend', row);
    });
}


// Event listeners for search functionality
searchIcon.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherData(city);
    }
});

// Handle 'Enter' key press in search bar
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherData(city);
        }
    }
});

// Event listener to toggle chatbot visibility
chatbotIcon.addEventListener('click', () => {
    chatbotContainer.classList.toggle('visible'); // Toggle 'visible' class
});

// Add functionality for the chatbot to send messages
chatbotSend.addEventListener('click', handleChatSend);

// Function to handle sending messages in the chatbot
async function handleChatSend() {
    const message = chatbotInput.value.trim();
    if (message) {
        // Create and display the user's message
        const userMessage = document.createElement('div');
        userMessage.className = 'message user-message';
        userMessage.textContent = message;
        chatbotBody.appendChild(userMessage);
        chatbotInput.value = ''; // Clear the input

        // Call the Gemini API to get a response
        const botResponse = await getGeminiResponse(message);
        
        // Create and display the bot's message
        const botMessage = document.createElement('div');
        botMessage.className = 'message bot-message';
        botMessage.textContent = botResponse; // Display bot's response
        chatbotBody.appendChild(botMessage);
    }
}

// Function to get response from Gemini API
async function getGeminiResponse(userMessage) {
    const apiKey = 'AIzaSyCxy0zFi3AkityTwYLSk500cO0FcNDKqV8';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: userMessage
                    }
                ]
            }
        ]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('Error fetching response from Gemini API');
        }

        const data = await response.json();
        // Extract the text from the response structure
        const botText = data.candidates[0].content.parts[0].text; // Adjust based on actual response format
        
        return botText; // Return the extracted text
    } catch (error) {
        console.error('Error:', error);
        return 'Sorry, I could not fetch a response from the API.';
    }
}
