const searchBox = document.getElementsByName("destination");
const searchButton = document.getElementById("search-button");
const clear = "./CSS/icons/sun.png";
const mainlyClear = "./CSS/icons/mainly-clear.png";
const overcast = "./CSS/icons/overcast.png";
const fog = "./CSS/icons/fog.png";
const lightRain = "./CSS/icons/light-rain.png";
const rain = "./CSS/icons/rain.png";
const sleet = "./CSS/icons/sleet.png";
const lightSnow = "./CSS/icons/light-snow.png";
const snow = "./CSS/icons/snow.png";
const thunderstorm = "./CSS/icons/thunderstorm.png";

let search = "";
const weatherCode = {
  0: clear,
  1: mainlyClear,
  2: mainlyClear,
  3: overcast,
  45: fog,
  48: fog,
  51: lightRain,
  53: lightRain,
  55: rain,
  56: sleet,
  57: sleet,
  61: lightRain,
  63: rain,
  65: rain,
  66: sleet,
  67: sleet,
  71: lightSnow,
  73: snow,
  75: snow,
  77: lightSnow,
  80: lightRain,
  81: rain,
  82: rain,
  85: lightSnow,
  86: snow,
  95: thunderstorm,
  96: thunderstorm,
  99: thunderstorm,
};

let restaurants = []
const fastFoodPlaces = []
const bars = []
const outdoorSpaces = []
const indoorAttractions = []
const kidsActivities = []
const entertainmentVenues = []
const parkingPlaces = []
const services = []


const handleSearch = (e) => {
  const resultsArea = document.getElementById("results");
  const userInputArea = document.getElementById("user-input");

  resultsArea.classList.remove("hidden");
  resultsArea.classList.add("grid");
  userInputArea.classList.remove("flex");
  userInputArea.classList.add("hidden");

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
              node["amenity"~"cafe|restaurant|fast_food|bar|parking|atm"](around:1000,${latitude},${longitude});
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

          restaurants = parsedPlaces.elements.filter((element) => {
            return element.tags.amenity === 'restaurant' && element.tags['fhrs:id']
          })

          console.log(restaurants)

          const routingFeatures = parsedRoute.features[0].properties;

          const temp = parsedWeather.current_weather.temperature;
          const weather =
            weatherCode[parsedWeather.current_weather.weathercode];
          const tempUnits = parsedWeather.current_weather_units.temperature;

          document.getElementById("temp").innerHTML = temp + " " + tempUnits;
          document.getElementById(
            "weather-condition"
          ).innerHTML = `<img src=${weather} />`;

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
