const searchBox = document.getElementsByName("destination");
const searchButton = document.getElementById("search-button");
const backButton = document.getElementById("return-btn");
const foodButton = document.getElementById("food-btn");
const barsButton = document.getElementById("pubs-btn");
const outdoorButton = document.getElementById("outside-spaces-btn");
const indoorButton = document.getElementById("indoor-spaces-btn");
const kidsButton = document.getElementById("kids-btn");
const entertainmentButton = document.getElementById("entertainment-btn");
const parkingButton = document.getElementById("parking-btn");
const atmButton = document.getElementById("services-btn");
const homeButton = document.getElementById("app-title");

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

const foodAmenity = ["restaurant", "fast_food", "cafe"];
const outdoorAmenity = [
  "park",
  "nature_reserve",
  "wood",
  "beach",
  "cliff",
  "memorial",
  "monument",
  "ruins",
  "viewpoint",
];
const indoorAmenities = [
  "artwork",
  "escape_game",
  "museum",
  "amusement_arcade",
];
const kidsAmenities = [
  "amusement_arcade",
  "playground",
  "water_park",
  "museum",
  "park",
];
const entertainmentAmenities = [
  "amusement_arcade",
  "escape_game",
  "water_park",
  "attraction",
];

let foodPlaces = [];
let bars = [];
let outdoorSpaces = [];
let indoorAttractions = [];
let kidsActivities = [];
let entertainmentVenues = [];
let parkingPlaces = [];
let services = [];

const getCategory = (tags) => {
  const tagList = ["amenity", "leisure", "tourism", "natural", "historic"];
  for (let tag of tagList) {
    if (tags[tag]) return { type: "tag", category: tags[tag] };
  }
  return { type: "unknown", category: "default" };
};

const handleSearch = () => {
  const loadingScreen = document.getElementById("loading-screen");
  const userInputArea = document.getElementById("user-input");

  loadingScreen.classList.remove("hidden");
  loadingScreen.classList.add("flex");
  userInputArea.classList.remove("flex");
  userInputArea.classList.add("hidden");
  searchBox[0].classList.remove("fade-in-2");
  searchButton.classList.remove("fade-in-3");

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
          console.log(coordinates, "<----- Destination search results"); //<-------- use for a comprehensive list of cities

          const result = coordinates.results[0];

          const county = result.admin2 || "";
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
          console.log(parsedPlaces, "<------- all of the places found"); // <------------ logging the places data to help decide how to use the method filter on the array and object properties to display them in groups.

          foodPlaces = parsedPlaces.elements.filter((element) => {
            return (
              foodAmenity.includes(element.tags.amenity) &&
              element.tags["fhrs:id"]
            );
          });

          bars = parsedPlaces.elements.filter((element) => {
            return element.tags.amenity === "bar" && element.tags["fhrs:id"];
          });

          outdoorSpaces = parsedPlaces.elements.filter((element) => {
            return (
              element.tags.name &&
              outdoorAmenity.includes(
                element.tags.leisure ||
                  element.tags.tourism ||
                  element.tags.natural ||
                  element.tags.historic
              )
            );
          });

          indoorAttractions = parsedPlaces.elements.filter((element) => {
            return (
              element.tags.name &&
              indoorAmenities.includes(
                element.tags.leisure ||
                  element.tags.tourism ||
                  element.tags.natural ||
                  element.tags.historic
              )
            );
          });

          kidsActivities = parsedPlaces.elements.filter((element) => {
            return (
              element.tags.name &&
              kidsAmenities.includes(
                element.tags.leisure ||
                  element.tags.tourism ||
                  element.tags.natural ||
                  element.tags.historic
              )
            );
          });

          entertainmentVenues = parsedPlaces.elements.filter((element) => {
            return (
              element.tags.name &&
              entertainmentAmenities.includes(
                element.tags.leisure ||
                  element.tags.tourism ||
                  element.tags.natural ||
                  element.tags.historic
              )
            );
          });

          parkingPlaces = parsedPlaces.elements.filter((element) => {
            return element.tags.amenity === "parking";
          });

          services = parsedPlaces.elements.filter((element) => {
            return element.tags.amenity === "atm";
          });

          console.log(outdoorSpaces, "<-------- outdoor");

          const routingFeatures = parsedRoute.features[0].properties;

          const temp = parsedWeather.current_weather.temperature;
          const weather =
            weatherCode[parsedWeather.current_weather.weathercode];
          const tempUnits = parsedWeather.current_weather_units.temperature;

          document.getElementById("temp").innerHTML = temp + " " + tempUnits;
          document.getElementById(
            "weather-condition"
          ).innerHTML = `<img src=${weather} />`;

          const hours = Math.floor(routingFeatures.summary.duration / 3600);
          const minutes = Math.floor(
            (routingFeatures.summary.duration % 3600) / 60
          );
          const distance =
            (routingFeatures.summary.distance / 1609.344).toFixed(1) + " Miles";

          document.getElementById(
            "travel-time"
          ).innerHTML = `${hours}hr ${minutes}min`;
          document.getElementById("distance").innerHTML = distance;

          console.log(
            parsedRoute,
            "<--------- Route data such as directions, distance and travel time"
          ); //<------------------ can use to show directions
        })
        .then(() => {
          const resultsArea = document.getElementById("results");
          const loadingScreen = document.getElementById("loading-screen");
          const weatherBtn = document.getElementById("weather-info");
          const travelBtn = document.getElementById("travel-info");

          loadingScreen.classList.add("hidden");
          loadingScreen.classList.remove("flex");
          resultsArea.classList.remove("hidden");
          resultsArea.classList.add("grid");

          weatherBtn.classList.add("fade-in-1");
          travelBtn.classList.add("fade-in-2");
          foodButton.classList.add("fade-in-1");
          barsButton.classList.add("fade-in-2");
          outdoorButton.classList.add("fade-in-3");
          indoorButton.classList.add("fade-in-2");
          kidsButton.classList.add("fade-in-3");
          entertainmentButton.classList.add("fade-in-4");
          parkingButton.classList.add("fade-in-3");
          atmButton.classList.add("fade-in-4");
        })
        .catch((err) => {
          const loadingScreen = document.getElementById("loading-screen");
          loadingScreen.classList.remove("flex");
          loadingScreen.classList.add("hidden");

          console.log("promise chain err -------> ", err);
        });
    },
    (error) => {
      const loadingScreen = document.getElementById("loading-screen");
      loadingScreen.classList.remove("flex");
      loadingScreen.classList.add("hidden");
      console.log("getCurrPos Err --- >", error);
    }
  );
};

const showPlaces = (placesArray) => {
  const results = document.getElementById("results");
  const lists = document.getElementById("lists");

  lists.innerHTML = "";

  let temp, card, newCard;

  temp = document.getElementsByTagName("template")[0];
  card = temp.content.querySelector(".list-card");
  placesArray.forEach((place) => {
    newCard = document.importNode(card, true);

    const { category } = getCategory(place.tags);

    const imgContainer = newCard.querySelector(".list-item-img");
    const img = document.createElement("img");

    img.src = `./CSS/icons/${category}.png`;
    img.alt = `${place.tags.amenity} icon`;
    img.classList.add("icon");

    const placeName = place.tags.name || place.tags.brand || place.tags.amenity;

    const street = place.tags["addr:street"] || "";
    const postcode = place.tags["addr:postcode"] || "";

    newCard.getElementsByTagName("h2")[0].textContent = placeName;
    newCard.getElementsByTagName("p")[0].textContent = `${street} ${postcode}`;

    newCard.classList.add("flex");
    newCard.classList.add("slide");
    document.getElementById("lists").appendChild(newCard);
    imgContainer.appendChild(img);
  });

  results.classList.add("hidden");
  results.classList.remove("grid");
  lists.classList.remove("hidden");
  backButton.classList.remove("hidden");
};

const handleReturn = () => {
  const lists = document.getElementById("lists");
  const results = document.getElementById("results");

  results.classList.add("grid");
  results.classList.remove("hidden");
  lists.classList.add("hidden");
  backButton.classList.add("hidden");
};

const returnHome = () => {
  const homeScreen = document.getElementById("user-input");
  const results = document.getElementById("results");
  const list = document.getElementById("lists");

  results.classList.add("hidden");
  list.classList.add("hidden");
  homeScreen.classList.remove("hidden");
  homeScreen.classList.add("flex");
  results.classList.remove("grid");
  backButton.classList.add("hidden");
  searchBox[0].value = "";
  searchBox[0].classList.add("fade-in-2");
  searchButton.classList.add("fade-in-3");
};

searchButton.addEventListener("click", handleSearch);
backButton.addEventListener("click", handleReturn);
foodButton.addEventListener("click", (e) => {
  showPlaces(foodPlaces);
});
barsButton.addEventListener("click", (e) => {
  showPlaces(bars);
});
outdoorButton.addEventListener("click", (e) => {
  showPlaces(outdoorSpaces);
});
indoorButton.addEventListener("click", (e) => {
  showPlaces(indoorAttractions);
});
kidsButton.addEventListener("click", (e) => {
  showPlaces(kidsActivities);
});
entertainmentButton.addEventListener("click", (e) => {
  showPlaces(entertainmentVenues);
});
parkingButton.addEventListener("click", (e) => {
  showPlaces(parkingPlaces);
});
atmButton.addEventListener("click", (e) => {
  showPlaces(services);
});
homeButton.addEventListener("click", returnHome);
