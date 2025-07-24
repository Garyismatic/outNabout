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
  const tagList = ["amenity", "leisure", "tourism", "natural", "historic"];
  for (let tag of tagList) {
    if (tags[tag]) return { type: "tag", category: tags[tag] };
  }
  return { type: "unknown", category: "default" };
}

export function filterPlaces(selectedType, currentPlaces) {
  lists.innerHTML = "";

  const filteredList =
    selectedType === "All"
      ? currentPlaces
      : currentPlaces.filter(({ tags }) => {
          return (
            tags.amenity === selectedType.toLowerCase().replaceAll(" ", "_") ||
            tags.leisure === selectedType.toLowerCase().replaceAll(" ", "_") ||
            tags.tourism === selectedType.toLowerCase().replaceAll(" ", "_") ||
            tags.natural === selectedType.toLowerCase().replaceAll(" ", "_") ||
            tags.historic === selectedType.toLowerCase().replaceAll(" ", "_")
          );
        });

  const temp = document.getElementsByTagName("template")[0];
  const card = temp.content.querySelector(".list-card");

  filteredList.forEach((place) => {
    const newCard = document.importNode(card, true);
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
    newCard.classList.add("flex", "slide");

    imgContainer.appendChild(img);
    lists.appendChild(newCard);
  });
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
