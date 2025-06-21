const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const { getRoute } = require("./mapFuncs.js");

dotenv.config();

const app = express();
const port = 9001;

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.redirect("main.html");
});

app.get("/api/route", getRoute);

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
