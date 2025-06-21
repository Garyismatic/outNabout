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
  const resultsArea = document.getElementById("results");
  const userInputArea = document.getElementById("user-input");

  resultsArea.classList.remove("hidden");
  userInputArea.classList.add("hidden");
  userInputArea.classList.remove("active");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLong = position.coords.longitude;

      const start = `${userLong},${userLat}`;
      search = searchBox[0].value;

      fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${search}`)
        .then((res) => {
          return res.json();
        })
        .then((coordinates) => {
          console.log(coordinates); //<-------- use for a comprehensive list of cities

          const result = coordinates.results[0];
          const county = result.admin2;
          const city = result.name;
          const { latitude, longitude } = coordinates.results[0];
          const overpassQuery = `
            [out:json];
            ( 
              node["amenity"~"cafe|restaurant|fast_food|bar|parking|atm|fountain"](around:1000,${latitude},${longitude});
              node["leisure"~"park|amusement_arcade|escape_game|nature_reserve|playground|water_park"](around:1000,${latitude},${longitude});
              node["tourism"~"viewpoint|attraction|artwork|museum"](around:1000,${latitude},${longitude});
              node["natural"~"wood|beach|cliff"](around:1000,${latitude},${longitude});
              node["historic"~"memorial|monument|ruins"](around:1000,${latitude},${longitude});
            );
            out body;
            `;

          if (city !== county) {
            document.getElementById("city").innerHTML = city + " " + county;
          } else {
            document.getElementById("city").innerHTML = city;
          }

          const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
          const routeURL = `/api/route?start=${start}&end=${longitude},${latitude}`;
          const placesURL = "https://overpass-api.de/api/interpreter";

          return Promise.all([
            fetch(weatherURL),
            fetch(routeURL),
            fetch(placesURL, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: `data=${encodeURIComponent(overpassQuery)}`,
            }),
          ]);
        })
        .then(([weather, route, places]) => {
          return Promise.all([weather.json(), route.json(), places.json()]);
        })
        .then(([parsedWeather, parsedRoute, parsedPlaces]) => {
          console.log(parsedPlaces); // <------------ logging the places data to help decide how to use the method filter on the array and object properties to display them in groups.

          const routingFeatures = parsedRoute.features[0].properties;

          const temp = parsedWeather.current_weather.temperature;
          const weather =
            weatherCode[parsedWeather.current_weather.weathercode];
          const tempUnits = parsedWeather.current_weather_units.temperature;

          document.getElementById("temp").innerHTML = temp + " " + tempUnits;
          document.getElementById("weather-condition").innerHTML = weather;

          hours = Math.floor(routingFeatures.summary.duration / 3600);
          minutes = Math.floor((routingFeatures.summary.duration % 3600) / 60);
          distance =
            (routingFeatures.summary.distance / 1609.344).toFixed(1) + " Miles";

          document.getElementById(
            "travel-time"
          ).innerHTML = `${hours}hr ${minutes}min`;
          document.getElementById("distance").innerHTML = distance;

          console.log(parsedRoute); //<------------------ can use to show directions
        })
        .catch((err) => {
          console.log(err);
        });
    },
    (error) => {
      console.log("getCurrPos Err --- >", error);
    }
  );
};

searchButton.addEventListener("click", handleSearch);
