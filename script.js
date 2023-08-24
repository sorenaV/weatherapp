'use strict';

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
        <svg xmlns="http://www.w3.org/2000/svg" class="error-icon" viewBox="0 0 24 24">
          <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z">
          </path>
        </svg>
        <h3 class="cart-title">OOPS!</h3>
        <p class="cart-text">${errorMess}, Please Try agian. 👆</p>
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
    if (navigator.geolocation) {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = pos.coords;
      const weather = await getWeather(latitude, longitude);
    } else {
      // Handle the case when geolocation is not available
      throw new Error(
        'cannot get location, Geolocation is not available in this browser.'
      );
    }
  } catch (err) {
    errorMessage(`${err.message}, Search by city name`);
    console.log(err);
    // Handle the error here (e.g., show an error message to the user)
  }
};

getLocationAndWeather();

const getWeather = async function (latitude, longitude) {
  try {
    // Fetch weather data from the weather API
    const data = await getJSON(
      `http://api.weatherapi.com/v1/forecast.json?q=${latitude} ${longitude}&days=6&key=${API_KEYS}`
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
getWeather(`44.34`, '10.99');

const renderMarkup = function (data) {
  const current = data.current;
  const location = data.location;
  const forecastDays = data.forecast.forecastday.slice(1);
  weatherContainer.classList.remove('hide');
  return `
  <div class="main">
  <img class="weather-icon" src="${getIconPath(
    current.condition.code,
    current.is_day
  )}" alt="" />

  <div class="main-condition">
    <p class="city-name">${location.region}</p>
    <h1 class="temp-deg">${Math.trunc(current.temp_c) + ' °C'}</h1>
    <h1 class="weather-main">${current.condition.text}</h1>
    <h3 class="weather-time">${location.name + getFormattedDate()}</h3>
  </div>
</div>

<div class="temperature">
  <div class="temperature-range">
    <i class="fa-arrow-up temperature-icon"
      ><svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="50"
        height="50"
      >
        <path
          d="M11.9997 10.8284L7.04996 15.7782L5.63574 14.364L11.9997 8L18.3637 14.364L16.9495 15.7782L11.9997 10.8284Z"
        ></path></svg
    ></i>
    <div>
      <span class="temperature-label">Upper:</span>
      <p class="temperature-value max">${
        Math.trunc(forecastDays[0].day.maxtemp_c) + '°C'
      }</p>
    </div>
  </div>
  <div class="temperature-range">
    <i class="fa-arrow-down temperature-icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="50"
        height="50"
      >
        <path
          d="M11.9997 13.1714L16.9495 8.22168L18.3637 9.63589L11.9997 15.9999L5.63574 9.63589L7.04996 8.22168L11.9997 13.1714Z"
        ></path>
      </svg>
    </i>
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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="detail-icon"
      viewBox="0 0 24 24"
    >
      <path
        d="M10.5 17H4V15H10.5C12.433 15 14 16.567 14 18.5C14 20.433 12.433 22 10.5 22C8.99957 22 7.71966 21.0559 7.22196 19.7293L9.09513 19.0268C9.30843 19.5954 9.85696 20 10.5 20C11.3284 20 12 19.3284 12 18.5C12 17.6716 11.3284 17 10.5 17ZM5 11H18.5C20.433 11 22 12.567 22 14.5C22 16.433 20.433 18 18.5 18C16.9996 18 15.7197 17.0559 15.222 15.7293L17.0951 15.0268C17.3084 15.5954 17.857 16 18.5 16C19.3284 16 20 15.3284 20 14.5C20 13.6716 19.3284 13 18.5 13H5C3.34315 13 2 11.6569 2 10C2 8.34315 3.34315 7 5 7H13.5C14.3284 7 15 6.32843 15 5.5C15 4.67157 14.3284 4 13.5 4C12.857 4 12.3084 4.40463 12.0951 4.97317L10.222 4.27073C10.7197 2.94414 11.9996 2 13.5 2C15.433 2 17 3.567 17 5.5C17 7.433 15.433 9 13.5 9H5C4.44772 9 4 9.44772 4 10C4 10.5523 4.44772 11 5 11Z"
      ></path>
    </svg>
    <div class="text">
      <h5 class="detail-name">Wind</h5>
      <p class="detail-value wind">${Math.trunc(current.wind_kph) + ' km/h'}</p>
    </div>
  </div>

  <div class="detail-item">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="detail-icon"
      viewBox="0 0 24 24"
    >
      <path
        d="M4.5 10C2.567 10 1 8.433 1 6.5C1 4.567 2.567 3 4.5 3C6.433 3 8 4.567 8 6.5C8 8.433 6.433 10 4.5 10ZM4.5 8C5.32843 8 6 7.32843 6 6.5C6 5.67157 5.32843 5 4.5 5C3.67157 5 3 5.67157 3 6.5C3 7.32843 3.67157 8 4.5 8ZM22 10H20C20 7.79086 18.2091 6 16 6C13.7909 6 12 7.79086 12 10V15C12 17.2091 13.7909 19 16 19C18.2091 19 20 17.2091 20 15H22C22 18.3137 19.3137 21 16 21C12.6863 21 10 18.3137 10 15V10C10 6.68629 12.6863 4 16 4C19.3137 4 22 6.68629 22 10Z"
      ></path>
    </svg>
    <div class="text">
      <h5 class="detail-name">Feels Like</h5>
      <p class="detail-value feels-like">${
        Math.trunc(current.feelslike_c) + ' °C'
      }</p>
    </div>
  </div>

  <div class="detail-item">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="detail-icon"
      viewBox="0 0 24 24"
    >
      <path
        d="M7.05025 8.04673L12 3.09698L16.9497 8.04673C19.6834 10.7804 19.6834 15.2126 16.9497 17.9462C14.2161 20.6799 9.78392 20.6799 7.05025 17.9462C4.31658 15.2126 4.31658 10.7804 7.05025 8.04673ZM18.364 6.63252L12 0.268555L5.63604 6.63252C2.12132 10.1472 2.12132 15.8457 5.63604 19.3604C9.15076 22.8752 14.8492 22.8752 18.364 19.3604C21.8787 15.8457 21.8787 10.1472 18.364 6.63252ZM16.2427 10.1714L14.8285 8.75718L7.7574 15.8282L9.17161 17.2425L16.2427 10.1714ZM8.11095 11.232C8.69674 11.8178 9.64648 11.8178 10.2323 11.232C10.8181 10.6463 10.8181 9.69652 10.2323 9.11073C9.64648 8.52494 8.69674 8.52494 8.11095 9.11073C7.52516 9.69652 7.52516 10.6463 8.11095 11.232ZM15.8891 16.8889C15.3033 17.4747 14.3536 17.4747 13.7678 16.8889C13.182 16.3031 13.182 15.3534 13.7678 14.7676C14.3536 14.1818 15.3033 14.1818 15.8891 14.7676C16.4749 15.3534 16.4749 16.3031 15.8891 16.8889Z"
      ></path>
    </svg>
    <div class="text">
      <h5 class="detail-name">Humidity</h5>
      <p class="detail-value humidity">${current.humidity + ' %'}</p>
    </div>
  </div>

  <div class="detail-item">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="detail-icon"
      viewBox="0 0 24 24"
    >
      <path
        d="M6.34323 14.7278L3.5148 17.5563L7.05033 21.0918L20.4854 7.65678L16.9498 4.12124L14.8285 6.24257L16.2427 7.65678L14.8285 9.07099L13.4143 7.65678L11.293 9.7781L13.4143 11.8994L12.0001 13.3136L9.87876 11.1923L7.75744 13.3136L9.17165 14.7278L7.75744 16.1421L6.34323 14.7278ZM17.6569 1.99992L22.6067 6.94967C22.9972 7.3402 22.9972 7.97336 22.6067 8.36389L7.75744 23.2131C7.36692 23.6037 6.73375 23.6037 6.34323 23.2131L1.39348 18.2634C1.00295 17.8729 1.00295 17.2397 1.39348 16.8492L16.2427 1.99992C16.6332 1.6094 17.2664 1.6094 17.6569 1.99992Z"
      ></path>
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
      <img
        class="forecast-icon"
        src="${getIconPath(value.day.condition.code)}"
        alt=""
      />
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
  const IMAGE_PATH = 'img/';
  switch (code) {
    case 1063:
    case 1189:
    case 1186:
      return IMAGE_PATH + '1000.svg';
    case 1072:
    case 1150:
    case 1153:
    case 1168:
    case 1171:
    case 1180:
    case 1183:
    case 1198:
      return IMAGE_PATH + '1200.svg';
    case 1192:
    case 1195:
    case 1201:
    case 1240:
    case 1243:
    case 1246:
      return IMAGE_PATH + '1400.svg';
    case 1273:
    case 1276:
    case 1279:
    case 1282:
    case 1117:
      return IMAGE_PATH + '2200.svg';
    case 1087:
      return IMAGE_PATH + '2000.svg';
    case 1204:
    case 1210:
    case 1213:
    case 1216:
    case 1219:
      return IMAGE_PATH + '3000.svg';
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
      return IMAGE_PATH + '3200.svg';
    case 1030:
    case 1135:
    case 1147:
      return IMAGE_PATH + '4000.svg';
    case 1006:
      //Check for night
      return isDay ? IMAGE_PATH + '5000.svg' : IMAGE_PATH + '5000night.svg';
    case 1003:
      //Cheak for night
      return isDay ? IMAGE_PATH + '5200.svg' : IMAGE_PATH + '5200night.svg';
    case 1009:
      return IMAGE_PATH + '5400.svg';
    default:
      //check for night
      return isDay ? IMAGE_PATH + '6000.svg' : IMAGE_PATH + '6000night.svg';
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
