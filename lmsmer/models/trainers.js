const mongoose = require("mongoose");

const TrainersSchema = new mongoose.Schema({
    
    trainer_name:{
        type:String,
        required:true,
    },
    trainer_desc:{
        type:String,
    },
    trainer_course:{
        type:String,
    },
    trainer_course_desc:{
        type:String,
    },
    disclaimer:{
        type:String,
    },
    learner_count:{
        type:Number,
    },
    video_total_time:{
        type:Number,
    },
    status:{
        type:String,
    },
    image:{
        type:String,
    },
    course_image:{
        type:String,
    }


});

module.exports = new mongoose.model("Trainers", TrainersSchema);
