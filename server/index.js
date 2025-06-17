const app = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 9001;

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
