const mongoose = require("mongoose");

const CustomersSchema = new mongoose.Schema({
  // sid: {
  //   type: Number,
  //   required: true,
  // },
  customertype:{
    type:String,
    required:true,
  },
  customername: {
    type: String,
    required: true,
  },
  customeremail: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
 registeredmode: {
    type: String,
    default:"Online",
  },
  accesstype: {
    type: String, ///paid version similar to choose version
    required: true,
  },
  expdate:{
    type: String,
    required: true,
  },
 subscriptionstatus: {
    type: String,
   
  },
  signeddate:{
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  gender:{
    type:String,
    required:true,
  },
  accounttype:{
    type:String,
    required:true,
  },
  password:{
    type:String,
    required:true,
  },
  country:{
    type:String,
    required:true,
  
  },
  state:{
    type:String,
    required:true,
  },
  examaccess:{
    type:String,
    required:true,
  },
  category:[{
    type:String,
    required:true,
  }],
  image:{
    type:String,
  },
  
  
  
  
  
});

module.exports = new mongoose.model("Customers", CustomersSchema);
