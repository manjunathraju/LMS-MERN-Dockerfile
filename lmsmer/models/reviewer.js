const mongoose = require("mongoose");

const ReviewerScehma = new mongoose.Schema({

    reviewername: {
    type: String,
    },
    
  
  rcomment: {
    type: String,
  },

  reviewerjobdesc  : {
    type: String,
  },
  
  reviewdate: {
    type: String,
  },

  reviewerrating: {
    type: Number,
  },

  reviewerlinkedinurl: {
    type: String,
  },

  reviewerimage: {
    type: String,
  },

  status: {
    type: String,
  },

});

module.exports = new mongoose.model("Review", ReviewerScehma);