const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  timeCategory: [String],
  mainCategory: [{ name: String, foodType: String, price: Number }],
});

module.exports = mongoose.model("categories", categorySchema);

// ["Veg (North)", "Veg(South)", "NonVeg","RiceBowl", "Snacks", "Beverages" ]
