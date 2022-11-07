const mongoose = require("mongoose");

const CountryScehma = new mongoose.Schema({
  country_name: {
    type: String,
    required: true,
  },
  country_code: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  currency_symbol: {
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

module.exports = new mongoose.model("Countries", CountryScehma);
