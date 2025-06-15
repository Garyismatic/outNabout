const searchBox = document.getElementsByName("destination");
const searchButton = document.getElementById("search-button");

let search = "";
const weatherCode = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snowfall",
  73: "Moderate snowfall",
  75: "Heavy snowfall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

const handleSearch = (e) => {
  search = searchBox[0].value;
  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${search}`)
    .then((res) => {
      return res.json();
    })
    .then((coordinates) => {
      const city = coordinates.results[0].admin3
        ? coordinates.results[0].admin3
        : "";

      const county = coordinates.results[0].admin2;
      const { latitude, longitude } = coordinates.results[0];

      document.getElementById("city").innerHTML = city + " " + county;

      return { latitude, longitude };
    })
    .then(({ latitude, longitude }) => {
      return fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
    })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
      temp = data.current_weather.temperature;
      weather = weatherCode[data.current_weather.weathercode];
      tempUnits = data.current_weather_units.temperature;
      document.getElementById("temp").innerHTML = temp + " " + tempUnits;
      document.getElementById("weather-condition").innerHTML = weather;
    })
    .catch((err) => {
      console.log(err);
    });
};

searchButton.addEventListener("click", handleSearch);
