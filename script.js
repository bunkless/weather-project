'use strict';

const API_GEOLOCATION_URL = "https://geocoding-api.open-meteo.com/v1/search";
const API_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const cityForm = document.querySelector("#cityForm");

cityForm.addEventListener("submit", onCityFormSubmit);

async function onCityFormSubmit(event) {
    event.preventDefault();

    const cityInput = cityForm.querySelector("#city");
    const cityName = cityInput.value.trim();

    if (!cityName) {
        alert("Enter the name of a city");
        return;
    }

  const cityCoordinates = await getCityCoordinates(cityName);
  if(cityCoordinates === null) {
    alert(`The coordinates of the city could not be retrieved ${cityName}`);
    return;
  }

  const weatherResponse = await getWeather(
    cityCoordinates.lat,
    cityCoordinates.long
  );
console.log(weatherResponse);

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
