const app = require("./app");
const dotenv = require("dotenv/config");
const mongoose = require("mongoose");
mongoose
  .connect(process.env.DB_CONNECTION, {
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connection established"));

app.listen(3000, (req, res) => {
  console.log("listening on port 3000");
});
