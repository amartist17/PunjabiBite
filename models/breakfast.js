const mongoose = require("mongoose");

const breakfastSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("breakfast", breakfastSchema);
