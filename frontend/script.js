import {
  getList,
  getCategory,
  filterPlaces,
  getService,
  returnHome,
  handleReturn,
} from "./utils.js"; // seperate functions from main javaScript file

import { typeArrays, weatherCode } from "./data.js"; // seperate data for easier readability

// Below I target the sections in html to switch between visible and hidden depending on functionality used

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
const filter = document.getElementById("filter");
const loadingScreen = document.getElementById("loading-screen");
const resultsArea = document.getElementById("results");
const lists = document.getElementById("lists");
const userInputArea = document.getElementById("user-input");
const listOptions = document.getElementById("list-options");
const footer = document.getElementById("footer");

// below initialise the places arrays ready to be populated once search is completed, and then called on depending which event listener is triggered

let foodPlaces = [];
let bars = [];
let outdoorSpaces = [];
let indoorAttractions = [];
let kidsActivities = [];
let entertainmentVenues = [];
let parkingPlaces = [];
let services = [];
let currentPlaces = [];

const handleSearch = () => {
  loadingScreen.classList.remove("hidden");
  loadingScreen.classList.add("flex");
  userInputArea.classList.remove("flex");
  userInputArea.classList.add("hidden");
  footer.classList.remove("flex");
  footer.classList.add("hidden");

  //get a users current position to calculate distance and time to destination declared in the search box

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLong = position.coords.longitude;

      const start = `${userLong},${userLat}`;
      const search = searchBox[0].value;

      fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${search}`)
        .then((res) => {
          return res.json();
        })
        .then((coordinates) => {
          console.log(coordinates, "<----- Destination search results"); //<-------- use for a comprehensive list of cities

          const result = coordinates.results[0]; //select the first location in the array of possibilities

          const county = result.admin2 || ""; // if a county is not present default is blank

          const city = result.name; //confirm to the user they are looking at the correct destination

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
            `; // overpass own QL as referenced in their docs

          if (city !== county) {
            document.getElementById("city").innerHTML = city + " " + county;
          } else {
            document.getElementById("city").innerHTML = city;
          } // conditional statement to avoid listing the destination twice to improve ux

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

          // below the function starts populating the arrays of places declared at the start.

          foodPlaces = parsedPlaces.elements.filter((element) => {
            return (
              typeArrays.foodAmenity.includes(element.tags.amenity) &&
              element.tags["fhrs:id"]
            );
          });

          bars = parsedPlaces.elements.filter((element) => {
            return element.tags.amenity === "bar" && element.tags["fhrs:id"];
          });

          outdoorSpaces = getList(typeArrays.outdoorAmenity, parsedPlaces);

          indoorAttractions = getList(typeArrays.indoorAmenities, parsedPlaces);

          kidsActivities = getList(typeArrays.kidsAmenities, parsedPlaces);

          entertainmentVenues = getList(
            typeArrays.entertainmentAmenities,
            parsedPlaces
          );

          parkingPlaces = getService("parking", parsedPlaces);

          services = getService("atm", parsedPlaces);

          const routingFeatures = parsedRoute.features[0].properties; // declare a variable to easily access distance and time from the response of the openrouteService API

          const temp = parsedWeather.current_weather.temperature;

          const weather =
            weatherCode[parsedWeather.current_weather.weathercode]; // set the icon dynamically based on the weather code in the response compared to the key value pairs in data.js

          const tempUnits = parsedWeather.current_weather_units.temperature;

          document.getElementById("temp").innerHTML = temp + " " + tempUnits;
          document.getElementById(
            "weather-condition"
          ).innerHTML = `<img src=${weather} />`; // set the values in the weather tile of the app

          const hours = Math.floor(routingFeatures.summary.duration / 3600); // The response for time is in seconds, here we convert it to hours

          const minutes = Math.floor(
            (routingFeatures.summary.duration % 3600) / 60
          ); // finding the remaining seconds that do not equate to a full hour and converting them to minutes rounding down

          const distance =
            (routingFeatures.summary.distance / 1609.344).toFixed(1) + " Miles"; // convert km to miles

          document.getElementById(
            "travel-time"
          ).innerHTML = `${hours}hr ${minutes}min`;
          document.getElementById("distance").innerHTML = distance; // set the values in the travel tile of the app

          console.log(
            parsedRoute,
            "<--------- Route data such as directions, distance and travel time"
          ); //<------------------ can use to show directions
        })
        .then(() => {
          // Async functions should now be complete and ready to display to the user with places pre loaded ready to filter.

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
          loadingScreen.classList.remove("flex");
          loadingScreen.classList.add("hidden");

          console.log("promise chain err -------> ", err);
        });
    },
    (error) => {
      loadingScreen.classList.remove("flex");
      loadingScreen.classList.add("hidden");
      console.log("getCurrPos Err --- >", error);
    }
  );
};

const showPlaces = (placesArray) => {
  currentPlaces = placesArray;
  const filter = document.getElementById("filter");

  lists.innerHTML = "";
  filter.innerHTML = "";

  const placeTypes = new Set();
  placesArray.forEach(({ tags }) => {
    if (tags.amenity) placeTypes.add(tags.amenity);
    if (tags.leisure) placeTypes.add(tags.leisure);
    if (tags.tourism) placeTypes.add(tags.tourism);
    if (tags.natural) placeTypes.add(tags.natural);
    if (tags.historic) placeTypes.add(tags.historic);
  });

  const filterDefault = document.createElement("option");
  filterDefault.value = "All";
  filterDefault.textContent = "All";
  filterDefault.selected = true;
  filter.appendChild(filterDefault);

  const placeTypesArray = [...placeTypes]; // spread the set into an array here to use array methods

  placeTypesArray.forEach((type) => {
    const typeString = type.replaceAll("_", " ").replace(/^\w/, (letter) => {
      return letter.toUpperCase();
    }); // Formatting the text to be more user friendly in the filter drop down box

    const filterType = document.createElement("option");
    filterType.value = typeString;
    filterType.textContent = typeString;
    filter.appendChild(filterType); // once formatted add to the filter options
  });

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
    lists.appendChild(newCard);
    imgContainer.appendChild(img);
  });

  listOptions.classList.remove("hidden");
  listOptions.classList.add("flex");
  resultsArea.classList.add("hidden");
  resultsArea.classList.remove("grid");
  lists.classList.remove("hidden");
  lists.classList.add("grid");
  filter.classList.remove("hidden");
  if (placeTypesArray.length <= 1) filter.classList.add("hidden");
};

searchButton.addEventListener("click", handleSearch);
backButton.addEventListener("click", (e) => {
  handleReturn(resultsArea, lists, listOptions);
});
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
homeButton.addEventListener("click", (e) => {
  returnHome(
    listOptions,
    footer,
    resultsArea,
    lists,
    userInputArea,
    searchBox,
    searchButton
  );
});
filter.addEventListener("change", (e) => {
  const selectedType = e.target.value;
  filterPlaces(selectedType, currentPlaces);
});
