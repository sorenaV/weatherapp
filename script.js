'use strict';
import icon from './img/sprite.svg';

const searchInput = document.querySelector('.search-input'),
  searchForm = document.querySelector('.search'),
  weatherContainer = document.querySelector('.weather'),
  errorCart = document.querySelector('.error');

const API_KEYS = `5475e72e3c0f4beea80182203232108`;
const KEYS = `b4696588483e0b4a8aea686583b5d5d8`;

//Creates a promise that rejects after a specified timeout.
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

//Fetches JSON data from the specified URL.
const getJSON = async function (url) {
  try {
    // Fetch the JSON data from the URL
    const response = await Promise.race([fetch(url), timeout(10)]);
    const data = await response.json();

    if (!response.ok) {
      // If the response is not OK, throw an error with the error message and status code
      const errorMessage = data.error ? data.error.message : data.message;
      throw new Error(`${errorMessage} (${response.status})`);
    }

    return data;
  } catch (err) {
    // Re-throw the error
    throw err;
  }
};

//Get the formatted date string.
const getFormattedDate = function (dateString) {
  const now = new Date();
  // prettier-ignore
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday',];
  const dayString = days[now.getDay()];

  if (dateString) {
    const date = new Date(dateString);
    const forecastDay = days[date.getDay()];

    return forecastDay;
  } else {
    let hour = now.getHours();
    let minute = now.getMinutes();

    // hour = hour % 12;
    hour = hour.toString().padStart(2, '0');
    minute = minute.toString().padStart(2, '0');

    return ` ,${dayString}, ${hour}:${minute}`;
  }
};

//Render Error Message
const errorMessage = function (errorMess) {
  const markup = `
      <div class="context">
        <svg class="error-icon">
          <use xlink:href="${icon}#error-warning" />
        </svg>
        <h3 class="cart-title">OOPS!</h3>
        <p class="cart-text">${errorMess} 👆</p>
      </div>
  `;

  weatherContainer.classList.add('hide');
  errorCart.classList.remove('hide');
  errorCart.innerHTML = ``;
  errorCart.insertAdjacentHTML('afterbegin', markup);
};

// Retrieves the current location and weather information.
const getLocationAndWeather = async () => {
  try {
    // Check if geolocation is available in the browser
    if (navigator.geolocation) {
      // Get the current position
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      // Extract latitude and longitude from the position object
      const { latitude, longitude } = pos.coords;

      // Get the weather information using the latitude and longitude
      const weather = await getWeather(latitude, longitude);
    } else {
      throw new Error(
        'Cannot get location. Geolocation is not available in this browser.'
      );
    }
  } catch (err) {
    // Handle errors and display appropriate error messages
    errorMessage(`${err.message}, Search by city name`);
    if (err.code === 2) {
      errorMessage('Cannot get location. Search by city name.');
    }
  }
};

getLocationAndWeather();

const getWeather = async function (latitude, longitude) {
  try {
    // Fetch weather data from the weather API
    const data = await getJSON(
      `https://api.weatherapi.com/v1/forecast.json?q=${latitude} ${longitude}&days=6&key=${API_KEYS}`
    );

    // Log the fetched data
    console.log(data);

    // Set the fetched data in state
    const HTML = renderMarkup(data);
    weatherContainer.innerHTML = '';
    weatherContainer.insertAdjacentHTML('afterbegin', HTML);
  } catch (err) {
    // Handle any errors that occur during the fetching process
    errorMessage(err);
  }
};

const renderMarkup = function (data) {
  const current = data.current;
  const location = data.location;
  const forecastDays = data.forecast.forecastday.slice(1);
  weatherContainer.classList.remove('hide');

  return `
      <div class="main">
        <svg class="weather-icon">
          <use xlink:href="${getIconPath(
            current.condition.code,
            current.is_day
          )}" />
        </svg>

        <div class="main-condition">
          <p class="city-name">${location.region}</p>
          <h1 class="temp-deg">${Math.trunc(current.temp_c) + ' °C'}</h1>
          <h1 class="weather-main">${current.condition.text}</h1>
          <h3 class="weather-time">${location.name + getFormattedDate()}</h3>
        </div>
      </div>

      <div class="temperature">
        <div class="temperature-range">
          <svg class="fa-arrow-up temperature-icon">
            <use xlink:href="${icon}#arrow-up" />
          </svg>
          <div>
            <span class="temperature-label">Upper:</span>
            <p class="temperature-value max">${
              Math.trunc(forecastDays[0].day.maxtemp_c) + '°C'
            }</p>
          </div>
        </div>
        <div class="temperature-range">
            <svg class="fa-arrow-down temperature-icon">
              <use xlink:href="${icon}#arrow-down" />
            </svg>
          <div>
            <span class="temperature-label">Lower:</span>
            <p class="temperature-value min">${
              Math.trunc(forecastDays[0].day.mintemp_c) + '°C'
            }</p>
          </div>
        </div>
      </div>

      <div class="details">
        <div class="detail-item">
          <svg class="detail-icon">
            <use xlink:href="${icon}#windy" />
          </svg>
          
          <div class="text">
            <h5 class="detail-name">Wind</h5>
            <p class="detail-value wind">${
              Math.trunc(current.wind_kph) + ' km/h'
            }</p>
          </div>
        </div>

        <div class="detail-item">
          <svg class="detail-icon">
            <use xlink:href="${icon}#celsius" />
          </svg>
          <div class="text">
            <h5 class="detail-name">Feels Like</h5>
            <p class="detail-value feels-like">${
              Math.trunc(current.feelslike_c) + ' °C'
            }</p>
          </div>
        </div>

        <div class="detail-item">
          <svg class="detail-icon">
            <use xlink:href="${icon}#ruler" />
          </svg>
          <div class="text">
            <h5 class="detail-name">Humidity</h5>
            <p class="detail-value humidity">${current.humidity + ' %'}</p>
          </div>
        </div>

        <div class="detail-item">
          <svg class="detail-icon">
            <use xlink:href="${icon}#water-percent" />
          </svg>
          <div class="text">
            <h5 class="detail-name">Pressure</h5>
            <p class="detail-value pressure">${current.pressure_mb}</p>
          </div>
        </div>
      </div>

      <div class="forecast">
        <h2 class="forecast-title">Next 5 Days:</h2>
        <div class="forecast-elements">

        ${forecastDays
          .map((value, index) => {
            return `<div class="forecast-item">
            <svg class="forecast-icon">
            <use xlink:href="${getIconPath(value.day.condition.code)}" />
          </svg>
            <div class="forecast-text">
              <h1 class="forecast-day">${getFormattedDate(value.date)}</h1>
              <p class="forecast-description">${value.day.condition.text}</p>
            </div>
          </div>`;
          })
          .join('')}

        </div>
      </div>
        `;
};

//Returns the path of an icon based on the provided code and the time of day
const getIconPath = function (code, isDay = true) {
  const IMAGE_PATH = `${icon}#`;
  switch (code) {
    //rainy
    case 1063:
    case 1189:
    case 1186:
    case 1072:
    case 1150:
    case 1153:
    case 1168:
    case 1171:
    case 1180:
    case 1183:
    case 1198:
    case 1192:
    case 1195:
    case 1201:
    case 1240:
    case 1243:
    case 1246:
      return IMAGE_PATH + 'cloud-rain';
    //tunder storm
    case 1273:
    case 1276:
    case 1279:
    case 1282:
    case 1117:
    case 1087:
      return IMAGE_PATH + 'cloud-lightning';
    //snow
    case 1204:
    case 1210:
    case 1213:
    case 1216:
    case 1219:
    case 1066:
    case 1069:
    case 1114:
    case 1207:
    case 1222:
    case 1225:
    case 1237:
    case 1249:
    case 1252:
    case 1255:
    case 1258:
    case 1261:
    case 1264:
      return IMAGE_PATH + 'cloud-snow';
    //mist
    case 1030:
    case 1135:
    case 1147:
      return IMAGE_PATH + 'cloud-fog';
    //partly cloud
    case 1003:
    case 1006:
      //Check for night
      return isDay ? IMAGE_PATH + 'cloud-sun' : IMAGE_PATH + 'cloud-moon';
    //cloud
    case 1009:
      return IMAGE_PATH + 'cloud';
    //clear
    default:
      //check for night
      return isDay ? IMAGE_PATH + 'sun' : IMAGE_PATH + 'moon-stars';
  }
};

// Retrieves the coordinates of a given city using the OpenWeatherMap API.
const getCityCoordinates = async function (city) {
  try {
    // Retrieve data from the OpenWeatherMap API
    const data = await getJSON(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${KEYS}`
    );
    console.log(data);

    // Check if the data was empty then throw an error
    if (data.length === 0) {
      throw new Error('City Not Found');
    }

    // Extract latitude and longitude from the data
    const { lat, lon } = data[0];

    // Get weather information using the retrieved coordinates
    getWeather(lat, lon);

    // Hide the error cart
    errorCart.classList.add('hide');

    // Return the latitude and longitude
    return { latitude: lat, longitude: lon };
  } catch (err) {
    // Log any errors that occur during the process
    errorMessage(err.message);
  }
};

searchForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const cityName = searchInput.value;
  getCityCoordinates(cityName);
});
