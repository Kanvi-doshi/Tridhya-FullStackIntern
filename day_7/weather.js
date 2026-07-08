const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const feelsLike = document.getElementById("feelsLike");
const historyList = document.getElementById("historyList");

let searchHistory = [];
// const API_KEY = "5f5da0d999f2d15f9c17a509e725f568";
// const BASE_URL = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m";
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

function saveHistory() {
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

function loadHistory() {
  const storedHistory = JSON.parse(localStorage.getItem("searchHistory"));
  if (storedHistory) {
    searchHistory = storedHistory;
    displayHistory();
  }
}

function displayHistory() {
  historyList.innerHTML = searchHistory
    .map((city) => `<li data-city="${city}">${city}</li>`)
    .join("");
}

function getWeatherDescription(code) {
  switch (code) {
    case 0:
      return "Clear Sky";
    case 1:
      return "Mainly Clear";
    case 2:
      return "Partly Cloudy";
    case 3:
      return "Overcast";
    case 45:
    case 48:
      return "Fog";
    case 51:
    case 53:
    case 55:
      return "Drizzle";
    case 61:
    case 63:
    case 65:
      return "Rain";
    case 71:
    case 73:
    case 75:
      return "Snow";
    case 80:
    case 81:
    case 82:
      return "Rain Showers";
    case 95:
      return "Thunderstorm";
    default:
      return "Weather Unavailable";
  }
}
loadHistory();

async function getWeather(city) {
  try {
    const geoResponse = await fetch(`${GEO_URL}?name=${city}&count=1`);
    const geoData = await geoResponse.json();
    if (!geoData.results) {
      throw new Error("City not found");
    }
    // console.log(geoData);
    const { latitude, longitude, name } = geoData.results[0];
    const weatherResponse = await fetch(
      `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code`,
    );
    const weatherData = await weatherResponse.json();
    console.log(weatherData);
    const {
      temperature_2m,
      relative_humidity_2m,
      apparent_temperature,
      wind_speed_10m,
      weather_code,
    } = weatherData.current;

    cityName.textContent = name;
    description.textContent = `${getWeatherDescription(weather_code)}`;
    temperature.textContent = ` ${temperature_2m}°C`;
    humidity.textContent = `${relative_humidity_2m}%`;
    wind.textContent = ` ${wind_speed_10m} km/h`;
    feelsLike.textContent = `${apparent_temperature}°C`;

    if (!searchHistory.includes(name.trim())) {
      searchHistory.push(name.trim());
      saveHistory();
      displayHistory();
    }
    // console.log(weather_code);
  } catch (error) {
    alert(error.message);
  }
}
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    alert("Please enter a city.");
    return;
  }
  getWeather(city);
});

historyList.addEventListener("click", (event) => {
  const city = event.target.dataset.city;
  if (!city) return;
  cityInput.value = city;
  getWeather(city);
});
