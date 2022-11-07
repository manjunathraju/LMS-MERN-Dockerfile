const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  // sid: {
  //   type: Number,
  //   required: true,
  // },
  category_name:{
    type:String,
    required:true,
  },
  category_code: {
    type: String,
    required: true,
  },
  category_text:{
    type:String,
    required:true,
  },
  status: {
    type: String,
    required: true,
  },
  
  image:{
    type:String,
  },
  
  
  
  
  
  
});

module.exports = new mongoose.model("Category", CategorySchema);
