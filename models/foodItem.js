const mongoose = require("mongoose");

const foodItemSchema = mongoose.Schema({
  name: "string",
  type: "string",
  price: "number",
});

module.exports = mongoose.model("foodItem", foodItemSchema);
