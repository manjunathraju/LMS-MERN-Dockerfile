const mongoose = require("mongoose");

const OffersSchema = new mongoose.Schema({
  // sid: {
  //   type: Number,
  //   required: true,
  // },
  offername: {
    type: String,
    required: true,
  },
  coupon_code: {
    type: String,
    required: true,
  },
 course_category: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
 status: {
    type: String,
    required: true,
  },
  applicablecountries: [{
    type: String,
    required: true,
  }],
  offermode: {
    type: String,
    required: true,
  },
  discountamt: {
    type: String,
    required: true,
  },
  startdate:{
    type: String,
    required: true,
  },
  enddate:{
    type: String,
    required: true,
  }
  
});

module.exports = new mongoose.model("Offers", OffersSchema);
