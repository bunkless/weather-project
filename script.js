'use strict';

const API_GEOLOCATION_URL = "https://geocoding-api.open-meteo.com/v1/search";
const API_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const cityForm = document.querySelector("#cityForm");
const locationBtn = document.querySelector("#locationBtn");

cityForm.addEventListener("submit", onCityFormSubmit);
locationBtn.addEventListener("click," onLocationBtnClick);

async function onCityFormSubmit(event) {
    event.preventDefault();

    clearContent();

    const cityInput = cityForm.querySelector("#city");
    const cityName = cityInput.value.trim();

    if (!cityName) {
        alert("Enter the name of a city");
        return;
    }

    displayLoading();


  const cityCoordinates = await getCityCoordinates(cityName);
  if(cityCoordinates === null) {
    alert(`The coordinates of the city could not be retrieved ${cityName}`);
    return;
  }

  const weatherResponse = await getWeather(
    cityCoordinates.lat,
    cityCoordinates.long
  );

const weatherData = parseApiData(weatherResponse);
console.log(weatherData);

}

async function getCityCoordinates(cityName) {
    const apiUrl = new URL(API_GEOLOCATION_URL);
    apiUrl.searchParams.append("name", cityName);
    apiUrl.searchParams.append("count", 1);

    console.log(apiUrl.toString());

    const response = await fetch(apiUrl.toString());
    const data = await response.json();

    if(!data || !data.hasOwnProperty("results")){
        return null;
    }

    const result = data.results[0];
    return {lat: result.latitude, long: result.longitude};
}

async function getWeather(lat, long) {
   

    const apiUrl = new URL(API_FORECAST_URL);
    apiUrl.searchParams.append("latitude", lat);
    apiUrl.searchParams.append("longitude", long);
    apiUrl.searchParams.append("timezone", "auto");
    apiUrl.searchParams.append("hourly", "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m");

    console.log(apiUrl.toString());

    const response = await fetch(apiUrl.toString());
    const data = await response.json();
    return data;
}

function parseApiData(data) {
  const numberOfItems = data.hourly.time.length;
  let currentWeather = null;
  const forecasts = [];

  const currentDateTime = new Date();

  for(let i = 0; i < numberOfItems; i++) {
    const itemDateTime = new Date(data.hourly.time[i]);

    const isToday = currentDateTime.toDateString() === itemDateTime.toDateString();

    const isCurrentHour = currentDateTime.getHours() === itemDateTime.getHours();

    if(isToday && isCurrentHour) {
      currentWeather = {
        data: data.hourly.time[i],
        temp: data.hourly.temperature_2m[i],
        wind: data.hourly.wind_speed_10m[i],
        humidity: data.hourly.relative_humidity_2m[i],
        code: data.hourly.weather_code[i],
      };
    }else if (isCurrentHour) {
      forecasts.push({
        data: data.hourly.time[i],
        temp: data.hourly.temperature_2m[i],
        wind: data.hourly.wind_speed_10m[i],
        humidity: data.hourly.relative_humidity_2m[i],
        code: data.hourly.weather_code[i],
      });
    }
  }

  return {
    current: currentWeather,
    forecasts: forecasts,
  }
}

function dispkayWeather(cityName, weather) {
  const pageContent = document.querySelector(".page-content");

  pageContent.append(createTodayWeatherSection(cityName, weather.current));
  pageContent.append(createForecastWeatherSection(cityName, weather.forecast));
}

function createTodayWeatherSection(cityName, currentWeather) {
  const todaySection = document.createElement('div');

  const title = document.createElement('h2');
  title.classList.add('section-title');
  title.innerText = `Vremea in ${cityName} astazi`;

  todaySection.append(title);

  const weatherPanel = createWeatherPanel(currentWeather, true);
  todaySection.append(weatherPanel);

  return todaySection;
}

function createForecastWeatherSection(cityName, forecasts) {
  const forecastSection = document.createElement('div');

  const title = document.createElement('h2');
  title.classList.add('section-title');
  title.innerText = `Vremea in ${cityName} in urmatoarele zile`;
  forecastSection.append(title);

  const weatherItems = document.createElement('div');
  weatherItems.classList.add('weather-items');
  forecastSection.append(weatherItems);

  for (let i = 0; i < forecasts.length; i++) {
    const weatherPanel = createWeatherPanel(forecasts[i], false);
    weatherItems.append(weatherPanel);
  }

  return forecastSection;
}


function createWeatherPanel(weather, isToday) {
  const weatherPanel = document.createElement('div');
  const panelClass = isToday ? 'today' : 'forecast';

  weatherPanel.classList.add('weather-panel', panelClass);

  const weatherDetails = document.createElement('div');
  weatherDetails.classList.add('weather-details');
  weatherPanel.append(weatherDetails);

  const currentHour = new Date().getHours();
  const isNight = currentHour >= 20 || currentHour <= 6;

  const weatherIcon = getIcon(weather.code, isNight);

  const imageContainer = document.createElement('div');
  const icon = document.createElement('img');
  icon.src = weatherIcon;

  imageContainer.append(icon);
  weatherPanel.append(imageContainer);

  const date = document.createElement('p');
  date.classList.add('date');
  date.innerText = weather.date.replace('T', ', ');

  const temp = document.createElement('p');
  temp.innerText = `Temperatura: ${weather.temp}°C`;

  const wind = document.createElement('p');
  wind.innerText = `Vant: ${weather.wind} km/h`;

  const humidity = document.createElement('p');
  humidity.innerText = `Umiditate: ${weather.humidity} %`;

  weatherDetails.append(date, temp, wind, humidity);

  return weatherPanel;
}
