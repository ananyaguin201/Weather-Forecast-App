// Element references
let cityInput = document.getElementById('city_input'),
    searchBtn = document.getElementById('searchBtn'),
    locationBtn = document.getElementById('locationBtn'),
    api_key = 'bc4e4fd139c98d80252d836e05f4707a';

let currentWeatherCard = document.querySelectorAll('.weather-left .card')[0],
    fiveDaysForecastCard = document.querySelector('.day-forecast'),
    aqiCard = document.querySelectorAll('.highlight .card')[0],
    sunriseCard = document.querySelectorAll('.highlight .card')[1],
    humidityVal = document.getElementById('humidityVal'),
    pressureVal = document.getElementById('pressureVal'),
    visibilityVal = document.getElementById('visibilityVal'),
    windspeedVal = document.getElementById('windspeedVal'),
    feelsVal = document.getElementById('feelsVal'),
    hourlyForecastCard = document.querySelector('.hourly-forecast'),
    recentCitiesDropdown = document.getElementById('recentCitiesDropdown'),
    aqiList = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

// Fetch Weather Details
function getWeatherDetails(name, lat, lon, country, state) {
    let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`,
        WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`,
        AIR_POLLUTION_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`,
        days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'August', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Fetch Air Quality
    fetch(AIR_POLLUTION_API_URL)
        .then(res => res.json())
        .then(data => {
            let { co, no, no2, o3, so2, pm2_5, pm10, nh3 } = data.list[0].components;
            aqiCard.innerHTML = `
                <div class="card-head">
                    <p>Air Quality Index</p>
                    <p class="air-index aqi-${data.list[0].main.aqi}">${aqiList[data.list[0].main.aqi - 1]}</p>
                </div>
                <div class="air-indice">
                    <i class="fa-sharp fa-solid fa-wind"></i>
                    <div class="item">
                        <p>PM2.5</p>
                        <h2>${pm2_5}</h2>
                    </div>
                    <div class="item">
                        <p>PM10</p>
                        <h2>${pm10}</h2>
                    </div>
                    <!-- More items for air components -->
                </div>
            `;
        })
        .catch(() => {
            alert('Failed to fetch Air Quality Index');
        });

    // Fetch Current Weather
    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            let date = new Date();
            currentWeatherCard.innerHTML = `
                <div class="current-weather">
                    <div class="details">
                        <p>Now</p>
                        <h2>${(data.main.temp - 273.15).toFixed(2)}&deg;C</h2>
                        <p>${data.weather[0].description}</p>
                    </div>
                    <div class="weather-icon">
                        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">
                    </div>
                </div>
                <hr>
                <div class="card-footer">
                    <p><i class="fa-regular fa-calendar-days"></i> ${days[date.getDay()]}, ${date.getDate()}, ${months[date.getMonth()]} ${date.getFullYear()}</p>
                    <p><i class="fa-sharp fa-regular fa-location-crosshairs"></i> ${name}, ${country}</p>
                </div>
            `;
            let { sunrise, sunset } = data.sys,
                { timezone, visibility } = data,
                { humidity, pressure, feels_like } = data.main,
                { speed } = data.wind,
                sRiseTime = moment.utc(sunrise, 'X').add(timezone, 'seconds').format('hh:mm A'),
                sSetTime = moment.utc(sunset, 'X').add(timezone, 'seconds').format('hh:mm A');
            sunriseCard.innerHTML = `
                <div class="card-head">
                    <p>Sunrise & Sunset</p>
                </div>
                <div class="sunrise-sunset">
                    <div class="item">
                        <div class="icon">
                            <i class="fa-sharp fa-light fa-sunrise"></i>
                        </div>
                        <div>
                            <p>Sunrise</p>
                            <h2>${sRiseTime}</h2>
                        </div>
                    </div>
                    <div class="item">
                        <div class="icon">
                            <i class="fa-sharp fa-light fa-sunset"></i>
                        </div>
                        <div>
                            <p>Sunset</p>
                            <h2>${sSetTime}</h2>
                        </div>
                    </div>
                </div>
            `;
            humidityVal.innerHTML = `${humidity}%`;
            pressureVal.innerHTML = `${pressure}hPa`;
            visibilityVal.innerHTML = `${visibility / 1000}km`;
            windspeedVal.innerHTML = `${speed}m/s`;
            feelsVal.innerHTML = `${(feels_like - 273.15).toFixed(2)}&deg;C`;
        })
        .catch(() => {
            alert("Failed to fetch current weather");
        });

    // Fetch 5 Days Forecast
    fetch(FORECAST_API_URL)
        .then(res => res.json())
        .then(data => {
            let hourlyForecast = data.list;
            hourlyForecastCard.innerHTML = '';
            for (let i = 0; i <= 7; i++) {
                let hrForecastDate = new Date(hourlyForecast[i].dt_txt);
                let hr = hrForecastDate.getHours();
                let a = 'PM';
                if (hr < 12) a = 'AM';
                if (hr == 0) hr = 12;
                if (hr > 12) hr = hr - 12;
                hourlyForecastCard.innerHTML += `
                    <div class="card">
                        <p>${hr} ${a}</p>
                        <img src="https://openweathermap.org/img/wn/${hourlyForecast[i].weather[0].icon}.png" alt="">
                        <p>${(hourlyForecast[i].main.temp - 273.15).toFixed(2)}&deg;C</p>
                    </div>
                `;
            }

            let uniqueForecastDays = [];
            let fiveDaysForecast = data.list.filter(forecast => {
                let forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });

            fiveDaysForecastCard.innerHTML = '';
            for (let i = 1; i < fiveDaysForecast.length; i++) {
                let date = new Date(fiveDaysForecast[i].dt_txt);
                fiveDaysForecastCard.innerHTML += `
                    <div class="forecast-item">
                        <div class="icon-wrapper">
                        <img src="https://openweathermap.org/img/wn/${fiveDaysForecast[i].weather[0].icon}.png "alt="">
                        <span>${(fiveDaysForecast[i].main.temp - 273.15).toFixed(2)}&deg;C</span>
                        </div>
                        <p>${date.getDate()} ${months[date.getMonth()]}</p>
                        <p>${days[date.getDay()]}</p>
                    </div>`;
            }
        })
        .catch(() => {
            alert("Failed to fetch current weather forecast");
        });
}

// Fetch City Coordinates
function getCityCoordinates() {
    let cityName = cityInput.value.trim();
    
    // Check if the city name is empty
    if (!cityName) {
        alert('Please enter a city name before searching.'); // Show error message
        return; // Stop further execution
    }

    let GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;
    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (data.length === 0) {
                alert(`No coordinates found for city: ${cityName}`);
                return;
            }
            let { name, lat, lon, country, state } = data[0];
            getWeatherDetails(name, lat, lon, country, state);
            updateRecentSearches(name); // Update recent searches
            closeDropdown(); // Close dropdown after search
        })
        .catch(() => {
            alert(`INVALID LOCATION!! Failed to fetch coordinates of ${cityName}`);
        });
}

// Update Recent Searches, Populate Dropdown, Handle Dropdown Selection, etc.
function updateRecentSearches(cityName) {
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (!recentCities.includes(cityName)) {
        recentCities.unshift(cityName);
        if (recentCities.length > 5) recentCities.pop(); // Keep only last 5 searches
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
    }
    populateDropdown();
}

function populateDropdown() {
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    recentCitiesDropdown.innerHTML = '';
    recentCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        recentCitiesDropdown.appendChild(option);
    });
}

function handleDropdownSelection(event) {
    const selectedCity = event.target.value;
    cityInput.value = selectedCity;
    getCityCoordinates();
    closeDropdown();
}

function toggleDropdown() {
    const wrapper = document.querySelector('.input-dropdown-wrapper');
    wrapper.classList.toggle('open');
}

function closeDropdown() {
    const wrapper = document.querySelector('.input-dropdown-wrapper');
    wrapper.classList.remove('open');
}

function getUserCoordinates() {
    navigator.geolocation.getCurrentPosition(
        position => {
            let { latitude, longitude } = position.coords;
            let REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${api_key}`;
            fetch(REVERSE_GEOCODING_URL)
                .then(res => res.json())
                .then(data => {
                    if (data.length === 0) {
                        alert('No location found');
                        return;
                    }
                    let { name, country, state } = data[0];
                    getWeatherDetails(name, latitude, longitude, country, state);
                })
                .catch(() => {
                    alert('Failed to fetch user coordinates');
                });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert('Geolocation permission denied. Please reset location permission to grant access again');
            }
        }
    );
}

// Event Listeners
searchBtn.addEventListener('click', getCityCoordinates);
locationBtn.addEventListener('click', getUserCoordinates);
cityInput.addEventListener('click', toggleDropdown);
cityInput.addEventListener('keyup', e => e.key === 'Enter' && getCityCoordinates());
recentCitiesDropdown.addEventListener('change', handleDropdownSelection);
window.addEventListener('load', () => {
    getUserCoordinates();
    populateDropdown();
});

document.addEventListener('click', function(event) {
    const wrapper = document.querySelector('.input-dropdown-wrapper');
    if (!wrapper.contains(event.target)) {
        closeDropdown(); // Close dropdown if clicked outside
    }
});
