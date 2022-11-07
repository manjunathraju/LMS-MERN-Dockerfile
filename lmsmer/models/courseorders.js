const mongoose = require("mongoose");

const CourseOrderSchema = new mongoose.Schema({
  sid: {
    type: Number,
    required: true,
  },
  order_id: {
    type: String,
    required: true,
  },
  invoice_id: {
    type: String,
    required: true,
  },
 transaction_id: {
    type: String,
    required: true,
  },
 course_code: {
    type: String,
    required: true,
  },
  learner_count: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required:true,
    
  },
  order_date: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("courseorders", CourseOrderSchema);
