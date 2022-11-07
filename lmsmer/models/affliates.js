const mongoose = require("mongoose");

const AffliatesSchema = new mongoose.Schema({
  sid: {
    type: Number,
    required: true,
  },
  affliate_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
 commission: {
    type: String,
    required: true,
  },
  links_clicked: {
    type: Number,
    required: true,
  },
  incomplete_reg: {
    type: Number,
    required: true,
  },
  trial_reg: {
    type: Number,
    required:true,
    
  },
  paid_reg: {
    type: Number,
    required: true,
  },
});

module.exports = new mongoose.model("Affliates", AffliatesSchema);
