const axios = require("axios");

function getRoute(req, res) {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).send({ error: "Missing start or end query" });
  }

  axios
    .get("https://api.openrouteservice.org/v2/directions/driving-car", {
      params: { start, end },
      headers: {
        Authorization: process.env.MY_ORS_KEY,
      },
    })
    .then((response) => res.json(response.data))
    .catch((err) => console.log("ORS err: ", err));
}

module.exports = { getRoute };
