const searchBox = document.getElementsByName("destination");
const searchButton = document.getElementById("search-button");

const handleSearch = (e) => {
  console.log(searchBox[0].value);
};

searchButton.addEventListener("click", handleSearch);
