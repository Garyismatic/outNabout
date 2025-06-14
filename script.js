const searchBox = document.getElementsByName("destination");
const searchButton = document.getElementById("search-button");

let city = "";

const handleSearch = (e) => {
  city = searchBox[0].value;
  console.log(city);
  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`)
    .then((res) => {
      return res.json();
    })
    .then((coordinates) => {
      const { latitude, longitude } = coordinates.results[0];
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
    })
    .catch((err) => {
      console.log(err);
    });
};

searchButton.addEventListener("click", handleSearch);
