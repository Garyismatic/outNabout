export function getList(arrayOfTypes, placesObj) {
  const list = placesObj.elements.filter((element) => {
    return (
      element.tags.name &&
      arrayOfTypes.includes(
        element.tags.leisure ||
          element.tags.tourism ||
          element.tags.natural ||
          element.tags.historic
      )
    );
  });
  return list;
}

export function getService(service, placesObj) {
  const listOfServices = placesObj.elements.filter((element) => {
    return element.tags.amenity === service;
  });
  return listOfServices;
}

export function getCategory(tags) {
  // this function takes an object and checks to see if the object contains a key listed in the whitelist tagsList
  const tagList = ["amenity", "leisure", "tourism", "natural", "historic"];
  for (let tag of tagList) {
    if (tags[tag]) return { type: "tag", category: tags[tag] }; // iterate over the whitelist and if a key is found return an object and the found value linked to a key of category
  }
}

export function filterPlaces(selectedType, currentPlacesInView) {
  // This function will empty out the current list of places shown and re populate it with places associated with the selected type such as cafe, restaurant or amusement arcade and use the same process of creating new cards using the html template

  lists.innerHTML = "";

  // create a new array of places from the current array of places, if 'All' is selected then just show the full list of current places

  const filteredList =
    selectedType === "All"
      ? currentPlacesInView
      : currentPlacesInView.filter(({ tags }) => {
          return (
            tags.amenity === selectedType.toLowerCase().replaceAll(" ", "_") ||
            tags.leisure === selectedType.toLowerCase().replaceAll(" ", "_") ||
            tags.tourism === selectedType.toLowerCase().replaceAll(" ", "_") ||
            tags.natural === selectedType.toLowerCase().replaceAll(" ", "_") ||
            tags.historic === selectedType.toLowerCase().replaceAll(" ", "_")
          );
        });

  createList(filteredList);
}

export function createList(arrayOfPlaces) {
  //This function will take an array of place objects and use the html template to create a list of card divs to display to the user
  const temp = document.getElementsByTagName("template")[0];
  const card = temp.content.querySelector(".list-card");

  // iterate over each place and create a new card element to show in the list

  arrayOfPlaces.forEach((place) => {
    const newCard = document.importNode(card, true);
    const { category } = getCategory(place.tags);

    const imgContainer = newCard.querySelector(".list-item-img");
    const img = document.createElement("img");

    img.src = `./CSS/icons/${category}.png`; // the icon is inserted dynamically depending on the category
    img.alt = `${place.tags.amenity} icon`;
    img.classList.add("icon");

    const placeName = place.tags.name || place.tags.brand || place.tags.amenity; // Name to display on the card based on priority if previous value not found

    // add street and postcode if available on the object else set as black as default
    const street = place.tags["addr:street"] || "";
    const postcode = place.tags["addr:postcode"] || "";

    newCard.getElementsByTagName("h2")[0].textContent = placeName;
    newCard.getElementsByTagName("p")[0].textContent = `${street} ${postcode}`;
    newCard.classList.add("flex", "slide");

    imgContainer.appendChild(img);
    lists.appendChild(newCard);
  });
}

export function createFilter(arrayOfTypes) {
  // This function will create our filter to display at the top of our list of places so a user can narrow the list down further

  const filterDefault = document.createElement("option");
  filterDefault.value = "All";
  filterDefault.textContent = "All";
  filterDefault.selected = true;
  filter.appendChild(filterDefault);

  arrayOfTypes.forEach((type) => {
    const typeString = type.replaceAll("_", " ").replace(/^\w/, (letter) => {
      return letter.toUpperCase();
    }); // Formatting the text to be more user friendly in the filter drop down box replacing all the underscores with spaces and grabbing the first letter what ever it is and using a callback function to capitalise that letter

    const filterType = document.createElement("option"); // create an option on the filter with the current type in the iteration with the newly formatted string

    filterType.value = typeString;
    filterType.textContent = typeString;
    filter.appendChild(filterType); // once formatted add to the filter options
  });
}

export function getFilterTypes(arrayOfPlaces) {
  // Create a new set by iterating over the places found and extracting the type of place it is such as cafe, restaurant or monument to be able to populate a drop down list and use it to filter the places shown to the user, so only monuments or cafes

  const placeTypes = new Set();
  arrayOfPlaces.forEach(({ tags }) => {
    if (tags.amenity) placeTypes.add(tags.amenity);
    if (tags.leisure) placeTypes.add(tags.leisure);
    if (tags.tourism) placeTypes.add(tags.tourism);
    if (tags.natural) placeTypes.add(tags.natural);
    if (tags.historic) placeTypes.add(tags.historic);
  });

  const placeTypesArray = [...placeTypes]; // Spread set into array to be able to use array methods

  return { length: placeTypesArray.length, types: placeTypesArray };
}

export function returnHome(
  listOptions,
  footer,
  resultsArea,
  lists,
  userInputArea,
  searchBox,
  searchButton
) {
  listOptions.classList.add("hidden");
  listOptions.classList.remove("flex");
  footer.classList.remove("hidden");
  footer.classList.add("flex");
  resultsArea.classList.add("hidden");
  lists.classList.add("hidden");
  lists.classList.remove("grid");
  userInputArea.classList.remove("hidden");
  userInputArea.classList.add("flex");
  resultsArea.classList.remove("grid");
  searchBox[0].value = "";
  searchBox[0].classList.add("fade-in-2");
  searchButton.classList.add("fade-in-3");
}

export function handleReturn(resultsArea, lists, listOptions) {
  resultsArea.classList.add("grid");
  resultsArea.classList.remove("hidden");
  lists.classList.add("hidden");
  lists.classList.remove("grid");
  listOptions.classList.remove("flex");
  listOptions.classList.add("hidden");
}
