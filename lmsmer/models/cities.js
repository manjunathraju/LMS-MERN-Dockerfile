const mongoose = require("mongoose");

const CityScehma = new mongoose.Schema({
  city_name: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  
  number: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("Cities", CityScehma);
