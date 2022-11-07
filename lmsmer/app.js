const express = require("express");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const multer = require('multer');
const alert =require('alert');
const authenticateUser = require("./middlewares/authenticateUser");
const path=require('path')
const fs = require('fs')
const fse = require('fs-extra')
const csv=require('csvtojson')
var bodyParser=require('body-parser')
const { execSync } = require('child_process');
const execOptions = { encoding: 'utf-8', windowsHide: true };
let MongoClient = require('mongodb').MongoClient;
const fileupload = require('express-fileupload');
const util = require ('util');
const app = express();

//models///
const AdminCred = require("./models/admincred");
const Affliates = require("./models/affliates");
const courseorders = require("./models/courseorders");
const Offers = require("./models/offers");
const Customers=require("./models/customers");
const Countries=require("./models/countries");
const Cities=require("./models/cities");
const Category=require("./models/categories");
const Courses=require("./models/courses");
const ScheduledCourses=require("./models/scheduledcourses");
const Trainers =require('./models/trainers');

////--////
const reviewer=require("./models/reviewer");



// mongdb cloud connection is here
mongoose
  .connect("mongodb://localhost/lmsadmin", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("connected to mongodb cloud! :)");
  })
  .catch((err) => {
    console.log(err);
  });

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json({limit:"1mb"}))
app.set('views', __dirname + '/views');
//  app.use(fileupload());

// cookie session
app.use(
  cookieSession({
    keys: ["randomStringASyoulikehjudfsajk"],
  })
);
////multer config for storing images to disk space
 var Storage=multer.diskStorage({
   destination:"./public/uploads/",
   filename:(req,file,cb)=>{ 
     cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))
   }
 });
 
var Storageforcategory=multer.diskStorage({
  destination:(req,file,cb)=>{
    const {categoryname}=req.body;
    const dir=`./public/uploads/${categoryname}`;
    fs.access(dir,function(error){
      if(error){
       // console.log("dir not exists");
        return fs.mkdir(dir,(error)=>cb(error,dir));
      }
      else{
        //console.log("dir exists");
        return cb(null,dir);
      }
    });
  },
  filename:(req,file,cb)=>{ 
    cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))
  }
});

// var Storageforcourses=multer.diskStorage({
//   destination:(req,file,cb)=>{
//     const {coursename,category}=req.body;
//     const dir=`./public/uploads/${category}`;
//     fs.access(dir,function(error){
//       if(error){
//         console.log("dir not exists");
//         //return fs.mkdir(dir,(error)=>cb(error,dir));
//       }
//       else{
//         const newdir=`./public/uploads/${category}/${coursename}`;
//         //console.log("dir exists");
//         //return cb(null,dir);
//         return fs.mkdir(newdir,(error)=>cb(error,dir));
//       }
//     });
//   },
//   filename:(req,file,cb)=>{ 
//     cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))
//   }
// });


////



 //////middleware for upload file///////
 var upload=new multer({
   storage:Storage
 }).single('file');

 var categoryupload=new multer({
  storage:Storageforcategory
}).single('file');

// var courseupload=new multer({
//   storage:Storageforcourses
// }).single('studymaterial');


// route for serving frontend files
app
  .get("/", (req, res) => {
    res.render("index"); //use here for lms homepage
  })
  .get("/login", (req, res) => {
    res.render("login");
  })
  .get("/signup", (req, res) => {
    res.render("register");
  })
  .get("/admin", (req, res) => {
    res.render("adminlogin");
  })
  .get("/adminprofile", (req, res) => {
    res.render("profile");
  })
  .get("/affliates", authenticateUser,  (req, res) => {
    res.render("affliates");
  })
  .get("/courseorder", authenticateUser,  (req, res) => {
    res.render("courseorder");
  })
  .get("/offers", authenticateUser,  (req, res,next) => {
    Offers.find().then(data => {
      //res.json(data);
      //console.log(data);
        res.render("offers",{data:data});
    }).catch(err=>res.send(err));
    
  })
  .get("/addoffers", authenticateUser,  (req, res) => {
    Category.find().then(data => {
      var categorydata=[];
      for(var i=0;i<data.length;i++){
        //console.log(data[i].category_name);
        categorydata.push(data[i].category_name)
      }
      Countries.find().then(countrydata=>{
        var countriesdata=[];
        for(var i=0;i<countrydata.length;i++){
        countriesdata.push(countrydata[i].country_name)
        }
        res.render("addoffers",{data:categorydata,countrydata:countriesdata});
        }).catch(err=>res.send(err))
    }).catch(err=>res.send(err));
    // res.render("addoffers");
  })
  .get("/addcustomers", authenticateUser,  (req, res) => {
    res.render("addcustomers");
  })
  .get("/addcountry", authenticateUser,  (req, res) => {
    res.render("addcountries");
  })
  .get("/addcity", authenticateUser,  (req, res) => {
    Countries.find().then(data => {
      var countrydata=[];
      for(var i=0;i<data.length;i++){
        //console.log(data[i].category_name);
        countrydata.push(data[i].country_name)
      }
      res.render("addcity",{data:countrydata});
    }).catch(err=>res.send(err));

    
  })
  .get("/addcategories", authenticateUser,  (req, res) => {
    res.render("addcategories");
  })

  .get("/schedulecourses", authenticateUser,  (req, res) => {
    Courses.find().then(data => {
      var coursesdata=[];
      for(var i=0;i<data.length;i++)
      {
        coursesdata.push(data[i].coursename)
      }
      //res.json(data);
      //console.log(data);
      ScheduledCourses.find().then(schedules=>{
        res.render("schedule_courses",{data:coursesdata,schedules:schedules});
      }).catch(err=>res.send(err))
    }).catch(err=>res.send(err));
    
  })
  .get("/addschedule", authenticateUser,  (req, res) => {
    Category.find().then(catdata => {
      var categorydata=[];
      for(var i=0;i<catdata.length;i++){
        //console.log(data[i].category_name);
        categorydata.push(catdata[i].category_name)
      }
      Courses.find().then(coursedata => {
        var coursesdata=[];
        for(var i=0;i<coursedata.length;i++)
        {
          coursesdata.push(coursedata[i].coursename)
        }
        Countries.find().then(countrydata=>{
          var countriesdata=[];
          for(var i=0;i<countrydata.length;i++){
            countriesdata.push(countrydata[i].country_name)
          }
          Cities.find().then(citydata=>{
            var citiesdata=[];
            for(var i=0;i<citydata.length;i++){
              citiesdata.push(citydata[i].city_name)
            }
            res.render("addschedules",{categorydata:categorydata,coursesdata:coursesdata,countrydata:countriesdata,citydata:citiesdata});
          }).catch(err=>res.send(err))
        }).catch(err=>res.send(err))
      }).catch(err=>res.send(err))
    }).catch(err=>res.send(err));
  })
  .get("/edit_schedules/:id/:coursename", authenticateUser, async (req, res) => {   //////rendering edit page for countries
    const id=req.params.id;
    const coursename=req.params.coursename;

    const scheduledetails = await ScheduledCourses.findOne({_id:id});
    Category.find().then(catdata => {
      var categorydata=[];
      for(var i=0;i<catdata.length;i++){
        //console.log(data[i].category_name);
        categorydata.push(catdata[i].category_name)
      }
      Courses.find().then(coursedata => {
        var coursesdata=[];
        for(var i=0;i<coursedata.length;i++)
        {
          coursesdata.push(coursedata[i].coursename)
        }
        Countries.find().then(countrydata=>{
          var countriesdata=[];
          for(var i=0;i<countrydata.length;i++){
            countriesdata.push(countrydata[i].country_name)
          }
          Cities.find().then(citydata=>{
            var citiesdata=[];
            for(var i=0;i<citydata.length;i++){
              citiesdata.push(citydata[i].city_name)
            }
            res.render("editschedules",{scheduleddata:scheduledetails,categorydata:categorydata,coursesdata:coursesdata,countrydata:countriesdata,citydata:citiesdata});
          }).catch(err=>res.send(err))
        }).catch(err=>res.send(err))
      }).catch(err=>res.send(err))
    }).catch(err=>res.send(err));
  })
  .get("/delete_schedules/:id/:coursename", authenticateUser, async (req, res) => {
    const id=req.params.id;
    const coursename=req.params.coursename;
  
    const coursedetails = await ScheduledCourses.findOne({_id:id});
     //console.log(offerdetails)
     if(coursedetails){
      ScheduledCourses
      .deleteOne ({ _id: coursedetails._id })
      .then(()=>{
        alert("You have succesfully Deleted  Data!")
        return;
       
      })
     .catch((err) => console.log(err));
    }else{
      res.send("no data found to edit");
    }
   res.redirect("/schedulecourses");
  })
  ////route to add courses////////////////////////////////////

  .get("/addcourses", authenticateUser,  (req, res) => {
    Category.find().then(data => {
      var categorydata=[];
      for(var i=0;i<data.length;i++){
        //console.log(data[i].category_name);
        categorydata.push(data[i].category_name)
      }
      res.render("addcourses",{data:categorydata});
    }).catch(err=>res.send(err));
   // res.render("addcourses");
  })

  .get("/edit_course/:id/:coursename", authenticateUser, async (req, res) => {   //////rendering edit page for countries
    const id=req.params.id;
    const coursename=req.params.coursename;

    const coursedetails = await Courses.findOne({_id:id});
    Category.find().then(data => {
      var categorydata=[];
      for(var i=0;i<data.length;i++){
        //console.log(data[i].category_name);
        categorydata.push(data[i].category_name)
      }
    // console.log(coursedetails.onlinetraining.key1)
   res.render("editcourses",{coursesdata:coursedetails,data:categorydata});
  }).catch(err=>res.send(err));
  })
  ////update offers -edit offers all data from db going to update offers page///
  .get("/update_offer/:id/:offername", authenticateUser, async (req, res) => {
    const id=req.params.id;
    const offername=req.params.offername;

    const offerdetails = await Offers.findOne({_id:id});
    Category.find().then(data => {
      var categorydata=[];
      for(var i=0;i<data.length;i++){
        //console.log(data[i].category_name);
        categorydata.push(data[i].category_name)
      }
      Countries.find().then(countrydata=>{
        var countriesdata=[];
        for(var i=0;i<countrydata.length;i++){
        countriesdata.push(countrydata[i].country_name)
        }
        res.render("updateoffers",{offerdata:offerdetails,data:categorydata,countrydata:countriesdata});
        }).catch(err=>res.send(err))
    }).catch(err=>res.send(err));
     //console.log(offerdetails)
  //  res.render("updateoffer",{offerdata:offerdetails});
  })
  //////delete offers from db using data id in mongo//////////
  .get("/delete_offer/:id/:offername", authenticateUser, async (req, res) => {
    const id=req.params.id;
    const offername=req.params.offername;

    const offerdetails = await Offers.findOne({_id:id});
     //console.log(offerdetails)
     if(offerdetails){
      Offers
      .deleteOne ({ _id: offerdetails._id })
      .then(()=>{
        alert("You have succesfully Deleted  Data!")
        return;
       
      })
     .catch((err) => console.log(err));
    }else{
      res.send("no data found to edit");
    }
   res.redirect("/offers");
  })
  ////update customers -edit customers all data from db going to update offers page///
  .get("/edit_customer/:id/:customername", authenticateUser, async (req, res) => {
    const id=req.params.id;
    const customername=req.params.customername;

    const customerdetails = await Customers.findOne({_id:id});
     //console.log(offerdetails)
   res.render("editcustomers",{customerdata:customerdetails});
  })
  
  .get("/get_affliates", (req, res,next) => {  
    Affliates.find().then(data => {
      res.json(data);
      //console.log('affliate data')
       // console.log(data);
    }).catch(next);
    
  })
  .get("/get_courseorders", (req, res,next) => {
    courseorders.find().then(data => {
      res.json(data);
      //console.log('affliate data')
       // console.log(data);
    }).catch(next);
    
  })
 //////delete customers from db using data id in mongo//////////
 .get("/delete_customer/:id/:customername", authenticateUser, async (req, res) => {
  const id=req.params.id;
  const customername=req.params.customername;

  const customerdetails = await Customers.findOne({_id:id});
   //console.log(offerdetails)
   if(customerdetails){
    Customers
    .deleteOne ({ _id: customerdetails._id })
    .then(()=>{
      alert("You have succesfully Deleted  Data!")
      return;
     
    })
   .catch((err) => console.log(err));
  }else{
    res.send("no data found to edit");
  }
 res.redirect("/customers");
})

  .get("/customers", authenticateUser,  (req, res,next) => {
    Customers.find().then(data => {
      //res.json(data);
      //console.log(data);
        res.render("customers",{data:data});
    }).catch(err=>res.send(err));
    
  })
  // .get("/get_offers", (req, res,next) => {   //not required bcz we are fetching data in /offers itself
  //   Offers.find().then(data => {
  //     res.json(data);
  //     //console.log('affliate data')
  //       //console.log(data);
  //   }).catch(next);
  // })
  .get("/countries", authenticateUser,  (req, res,next) => { /////////countries fetching 
    Countries.find().then(data => {
      //res.json(data);
      //console.log(data);
        res.render("countries",{data:data});
    }).catch(err=>res.send(err));
  })
  .get("/edit_countries/:id/:countryname", authenticateUser, async (req, res) => {   //////rendering edit page for countries
    const id=req.params.id;
    const countryname=req.params.countryname;

    const countrydetails = await Countries.findOne({_id:id});
     //console.log(offerdetails)
   res.render("editcountry",{countrydata:countrydetails});
  })
  
  .get("/admin/dashboard", authenticateUser, (req, res) => {
    res.render("home", { user: req.session.user });
  })
  .get("/delete_countries/:id/:countryname", authenticateUser, async (req, res) => {  /////deleting countries
    const id=req.params.id;
    const countryname=req.params.countryname;
  
    const countrydetails = await Countries.findOne({_id:id});
     //console.log(offerdetails)
     if(countrydetails){
      Countries
      .deleteOne ({ _id: countrydetails._id })
      .then(()=>{
        alert("You have succesfully Deleted  Data!")
        return;
       
      })
     .catch((err) => console.log(err));
    }else{
      res.send("no data found to edit");
    }
   res.redirect("/countries");
  })
  .get("/cities", authenticateUser,  (req, res,next) => { /////////countries fetching 
    Cities.find().then(data => {
      //res.json(data);
      //console.log(data);
        res.render("cities",{data:data});
    }).catch(err=>res.send(err));
  })
  .get("/edit_city/:id/:cityname", authenticateUser, async (req, res) => {   //////rendering edit page for countries
    const id=req.params.id;
    const cityname=req.params.cityname;

    const citydetails = await Cities.findOne({_id:id});
    Countries.find().then(data => {
      var countrydata=[];
      for(var i=0;i<data.length;i++){
        //console.log(data[i].category_name);
        countrydata.push(data[i].country_name)
      }
      res.render("editcity",{data:countrydata,citydata:citydetails});
    }).catch(err=>res.send(err));
   
  })
  .get("/delete_city/:id/:cityname", authenticateUser, async (req, res) => {  /////deleting countries
    const id=req.params.id;
    const cityname=req.params.cityname;
  
    const citydetails = await Cities.findOne({_id:id});
     //console.log(offerdetails)
     if(citydetails){
      Cities
      .deleteOne ({ _id: citydetails._id })
      .then(()=>{
        alert("You have succesfully Deleted  Data!")
        return;
       
      })
     .catch((err) => console.log(err));
    }else{
      res.send("no data found to edit");
    }
   res.redirect("/cities");
  })
  .get("/categories", authenticateUser,  (req, res,next) => { /////////categories fetching 
    Category.find().then(data => {
      //res.json(data);
      //console.log(data);
        res.render("categories",{data:data});
    }).catch(err=>res.send(err));
  })
  .get("/edit_category/:id/:categoryname", authenticateUser, async (req, res) => {   //////rendering edit page for countries
    const id=req.params.id;
    const categoryname=req.params.categoryname;

    const categorydetails = await Category.findOne({_id:id});
     //console.log(offerdetails)
   res.render("editcategory",{categorydata:categorydetails});
  })
  //////delete customers from db using data id in mongo//////////
 .get("/delete_category/:id/:categoryname", authenticateUser, async (req, res) => {
  const id=req.params.id;
  const categoryname=req.params.categoryname;

  const categorydetails = await Category.findOne({_id:id});
   //console.log(offerdetails)
   if(categorydetails){
    Category
    .deleteOne ({ _id: categorydetails._id })
    .then(()=>{
      alert("You have succesfully Deleted  Data!")
      return;
     
    })
   .catch((err) => console.log(err));
  }else{
    res.send("no data found to edit");
  }
 res.redirect("/categories");
})
.get("/courses", authenticateUser,  (req, res,next) => { /////////countries fetching 
  Courses.find().then(data => {
    //res.json(data);
    //console.log(data);
      res.render("courses",{data:data});
  }).catch(err=>res.send(err));
})
//////delete courses from db using data id in mongo//////////
.get("/delete_course/:id/:coursename", authenticateUser, async (req, res) => {
  const id=req.params.id;
  const coursename=req.params.coursename;

  const coursedetails = await Courses.findOne({_id:id});
   //console.log(offerdetails)
   if(coursedetails){
    Courses
    .deleteOne ({ _id: coursedetails._id })
    .then(()=>{
      alert("You have succesfully Deleted  Data!")
      return;
     
    })
   .catch((err) => console.log(err));
  }else{
    res.send("no data found to edit");
  }
 res.redirect("/courses");
})
////reviews ///
.get("/reviews",  (req, res) => { /////////FaqDetails fetching 
  reviewer.find().then(data => {
      res.render("review",{data:data});
  }).catch(err=>res.send(err));
})
.get("/addreview",  (req, res) => { 
  
  res.render("reviewdetails");
})
.get('/edit_reviewer/:id/:reviewername',async(req,res)=>{ ////edit review
  const id=req.params.id;
  const question=req.params.question;
  const ifexists = await reviewer.findOne({_id:id});
  

  //console.log(offerdetails)
res.render("editreviewer",{hdata:ifexists});
})
.get("/delete_reviewer/:id/:reviewername",  async (req, res) => { ////delete review
  const id=req.params.id;
  const reviewername=req.params.reviewername;
  const review = await reviewer.findOne({_id:id});
   if(review){
    reviewer
    .deleteOne ({ _id: review._id })
    .then(()=>{
      return;
    }) 
   .catch((err) => console.log(err));
  }else{
    res.send("no data found to edit");
  }
 res.redirect("/reviews");
})
//////route for trainers
.get("/trainers", authenticateUser,  (req, res,next) => { /////////countries fetching 
  Trainers.find().then(data => {
    //res.json(data);
    //console.log(data);
      res.render("trainers",{data:data});
  }).catch(err=>res.send(err));
})
.get("/addtrainers", authenticateUser,  (req, res) => {
  Courses.find().then(data => {
    var coursedata=[];
      for(var i=0;i<data.length;i++){
        //console.log(data[i].category_name);
        coursedata.push(data[i].coursename)
      }
    res.render("addtrainers",{data:coursedata});
  }).catch(err=>res.send(err));
 // res.render("addcourses");
})
////update customers -edit customers all data from db going to update offers page///
.get("/edit_trainer/:id/:trainername", authenticateUser, async (req, res) => {
  const id=req.params.id;
  const trainername=req.params.trainername;
  const trainerdetails = await Trainers.findOne({_id:id});
  Courses.find().then(data => {
    var coursedata=[];
      for(var i=0;i<data.length;i++){
        //console.log(data[i].category_name);
        coursedata.push(data[i].coursename)
      }
    res.render("edittrainers",{data:coursedata,trainerdata:trainerdetails});
  }).catch(err=>res.send(err));
})
.get("/delete_trainer/:id/:trainername", authenticateUser, async (req, res) => {
  const id=req.params.id;
  const trainername=req.params.trainername;

  const trainerdetails = await Trainers.findOne({_id:id});
   //console.log(offerdetails)
   if(trainerdetails){
    Trainers
    .deleteOne ({ _id: trainerdetails._id })
    .then(()=>{
      alert("You have succesfully Deleted  Data!")
      return;
     
    })
   .catch((err) => console.log(err));
  }else{
    res.send("no data found to edit");
  }
 res.redirect("/trainers");
})
;
// route for handling post requests////////////////////////////////////////////////////////////////////////////////
app
  .post("/login", async (req, res) => {
    const { email, password } = req.body;

    // check for missing filds
    if (!email || !password) {
      res.send("Please enter all the fields");
      return;
    }

    const doesUserExits = await AdminCred.findOne({ email });

    if (!doesUserExits) {
      res.send("invalid username or password");
      return;
    }

    const doesPasswordMatch = await bcrypt.compare(
      password,
      doesUserExits.password
    );

    if (!doesPasswordMatch) {
      res.send("invalid useranme or password");
      return;
    }

    // else he\s logged in
    req.session.user = {
      email,
    };

    res.redirect("/admin/dashboard");
  })

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //for register new user
  .post("/register", async (req, res) => {
    const { email, password } = req.body;

    // check for missing filds
    if (!email || !password) {
      res.send("Please enter all the fields");
      return;
    }

    const doesUserExitsAlreay = await AdminCred.findOne({ email });

    if (doesUserExitsAlreay) {
      res.send("A user with that email already exits please try another one!");
      return;
    }

    // lets hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    const latestUser = new AdminCred({ email, password: hashedPassword });

    latestUser
      .save()
      .then(() => {
        res.send("registered account!");
        return;
      })
      .catch((err) => console.log(err));
  })

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //for changing password of admin login
  .post("/changecred", async (req, res) => {
    const { email, password } = req.body;

    // check for missing filds
    if (!email || !password) {
      res.send("Please enter all the fields");
      return;
    }

    const doesUserExitsAlreay = await AdminCred.findOne({ email });
    if(!doesUserExitsAlreay){
      alert("Invalid Email entered!")
      res.redirect('/adminprofile')
    }
    // lets hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    const latestUser = new AdminCred({  password: hashedPassword });

    if (doesUserExitsAlreay) {
      AdminCred
      .updateMany ({ email: doesUserExitsAlreay.email },{ password:hashedPassword})
      .then(()=>{
        console.log("You have succesfully Updated your password")
        res.redirect('/home')
        alert('You have succesfully Updated your password')
        return;
      })
    .catch((err) => console.log(err));
    }
   
  })
  //////////////////add offers //////////////////////////////////////////////////
  .post("/offerdata", async (req, res) => {
   
    const { offername,couponcode,category, type,status,applicablecountries,offermode,discountamt,startdate,enddate} = req.body;
     

    const latestUser = new Offers({ offername:offername,coupon_code:couponcode,course_category:category,type,status,applicablecountries,offermode,discountamt,startdate, enddate});
    latestUser
      .save()
      .then(() => {
        console.log("offer data recieved");
        alert("offer created")
      })
      .catch((err) => console.log(err));
      res.redirect('/offers');
      
  })
  ///////////////////update offers / edit offers/////////////////////////////////
  .post("/updateoffer/:id", async (req, res) => {
   const id=req.params.id;
    const { offername,couponcode,category, type,status,applicablecountries,offermode,discountamt,startdate,enddate} = req.body;
 
   const idexist=await Offers.findOne({_id:id});
   //console.log(idexist)
   if(idexist){
    Offers
    .updateMany ({ _id: idexist._id },{offername:offername,coupon_code:couponcode,course_category:category,type,status,applicablecountries,offermode,discountamt,startdate, enddate})
    .then(()=>{
      //res.redirect('/Thanks')
      alert("You have succesfully Updated your Data!You can Go Back,Thanks")
      return;
    })
   .catch((err) => console.log(err));
  }else{
    res.send("no data found to edit");
  }
  })
   //////////////////add customers //////////////////////////////////////////////////
   .post("/customerdata", upload,async (req, res) => {
   
    const {customertype,gender,customername,customeremail,password,cpassword,accounttype,mobile,country,state,accesstype,examaccess,startedate,expdate,category,status} = req.body;
  
    const image=req.file.filename;
  
    // const image=req.file.filename;
     

    const latestUser = new Customers({ customertype,gender,customername,customeremail,password,accounttype,number:mobile,country,state,accesstype,examaccess,signeddate:startedate,expdate,category,status,image});
    latestUser
      .save()
      .then(() => {
        console.log("customer data recieved");
        alert("customer created")
      })
      .catch((err) => console.log(err));
      res.redirect('/customers');
      
  })
  ///////////////////update customer / edit customers/////////////////////////////////
  .post("/updatecustomer/:id",upload, async (req, res) => {
   const id=req.params.id;
   const {customertype,gender,customername,customeremail,password,cpassword,accounttype,mobile,country,state,accesstype,examaccess,startedate,expdate,category,status} = req.body;
  
   const image=req.file.filename; 
   const idexist=await Customers.findOne({_id:id});
   //console.log(idexist)
   if(idexist){
    Customers
    .updateMany ({ _id: idexist._id },{ customertype,gender,customername,customeremail,password,accounttype,number:mobile,country,state,accesstype,examaccess,signeddate:startedate,expdate,category,status,image})
    .then(()=>{
      //res.redirect('/Thanks')
      alert("You have succesfully Updated your Data!You can Go Back,Thanks")
      return;
    })
   .catch((err) => console.log(err));
  }else{
    res.send("no data found to edit");
  }
  res.redirect('/customers');
  })
  //////////////////add ocountries //////////////////////////////////////////////////
  .post("/countriesdata", async (req, res) => {
   
    const { countryname,countrycode,currencyname, currencysymbol,contact,status} = req.body;
     

    const latestUser = new Countries({ country_name:countryname,country_code:countrycode,currency:currencyname,currency_symbol:currencysymbol,number:contact,status});
    latestUser
      .save()
      .then(() => {
        console.log("country created");
        alert("country created")
      })
      .catch((err) => console.log(err));
      res.redirect('/countries');
      
  })
  ///////////////////update country / edit country/////////////////////////////////
  .post("/updatecountry/:id",upload, async (req, res) => {
    const id=req.params.id;
    const {countryname,countrycode,currencyname, currencysymbol,contact,status} = req.body;
   
    const idexist=await Countries.findOne({_id:id});
    //console.log(idexist)
    if(idexist){
     Countries
     .updateMany ({ _id: idexist._id },{ country_name:countryname,country_code:countrycode,currency:currencyname,currency_symbol:currencysymbol,number:contact,status})
     .then(()=>{
       //res.redirect('/Thanks')
       alert("You have succesfully Updated country")
       return;
     })
    .catch((err) => console.log(err));
   }else{
     res.send("no data found to edit");
   }
   res.redirect('/countries');
   })
    //////////////////add cities //////////////////////////////////////////////////
  .post("/citydata", async (req, res) => {
   
    const { cityname,country,contact,status} = req.body;
   
     

    const latestUser = new Cities({ city_name:cityname,country,number:contact,status});
    latestUser
      .save()
      .then(() => {
        console.log("city created");
        alert("city created")
      })
      .catch((err) => console.log(err));
      res.redirect('/cities');
    }) 
    ///////////////////update city / edit city/////////////////////////////////
  .post("/updatecity/:id", async (req, res) => {
    const id=req.params.id;
    const {cityname,country,contact,status} = req.body;
   
    const idexist=await Cities.findOne({_id:id});
    //console.log(idexist)
    if(idexist){
      Cities
     .updateMany ({ _id: idexist._id },{ city_name:cityname,country,number:contact,status})
     .then(()=>{
       //res.redirect('/Thanks')
       alert("You have succesfully Updated City")
       return;
     })
    .catch((err) => console.log(err));
   }else{
     res.send("no data found to edit");
   }
   res.redirect('/cities');
  })
  .post('/countryfileupload', upload, (req, res) =>{
    countryfileimport('./public/uploads/' + req.file.filename);
    alert('file uploaded sucessfully')
    res.redirect('/countries');
    
  })
  .post('/cityfileupload', upload, (req, res) =>{
    cityfileimport('./public/uploads/' + req.file.filename);
    alert('file uploaded sucessfully')
    res.redirect('/cities');
    
  })
  .post('/scheduleupload', upload, (req, res) =>{
    const coursename=req.body.course;

   Courses.find({coursename}).then(data=>{
     for(var i=0;i<data.length;i++){
      var category=data[i].coursecategory
     }
    
      schedulefileimport('./public/uploads/' + req.file.filename,coursename,category);
     alert('file uploaded sucessfully')
     res.redirect('/schedulecourses');
   }).catch(err=>res.send(err));
  })
  //////////////////add categories //////////////////////////////////////////////////
  .post("/categoriesdata",categoryupload,async(req, res) => {
   
    const {categoryname,categorycode,categorytext,status} = req.body;
    const image=req.file.filename;
     

    const latestUser = new Category({ category_name:categoryname,category_code:categorycode,category_text:categorytext,status,image});
    latestUser
      .save()
      .then(() => {
        console.log("category created");
        alert("category created")
      })
      .catch((err) => console.log(err));
      res.redirect('/categories');
      
  })
  ///////////////////update category / edit category/////////////////////////////////
  .post("/updatecategory/:id",categoryupload, async (req, res) => {
    const id=req.params.id;
    const {categoryname,categorycode,categorytext,status} = req.body;
   
    const image=req.file.filename; 
    const idexist=await Category.findOne({_id:id});
    //console.log(idexist)
    if(idexist){
      Category
     .updateMany ({ _id: idexist._id },{ category_name:categoryname,category_code:categorycode,category_text:categorytext,status,image})
     .then(()=>{
       //res.redirect('/Thanks')
       alert("You have succesfully Updated category")
       return;
     })
    .catch((err) => console.log(err));
   }else{
     res.send("no data found to edit");
   }
   res.redirect('/categories');
   })


   //////post course data/////////////////////
   .post("/coursesdata",fileupload(), async (req, res) => {

   const {coursename,coursecode,coursehtag,category,
          coursetype,courseregid,rating,coursereview,
          reviewurl,coursetimezone,status,countrymetatitle,
          countrymetadesc,citymetatitle,citymetadesc,
          bannerimageurl,
          key1,key2,key3,key4,key5,key6,key7,key8,key9,key10,key11,key12,
          key13,key14,key15,key16,key17,key18,key19,key20,key21,key22,key23,key24,
          gqs,gqsans1,gqsans2,gqsans3,
          csdescq1,csdsca1,csdescq2,csdsca2,csdescq3,csdsca3,csdescq4,csdsca4,
          m1name,
          m1t1,m1vl1,m1t2,m1vl2,m1t3,m1vl3,m1t4,m1vl4,m1t5,m1vl5,m1t6,m1vl6,m1t7,m1vl7,m1t8,m1vl8,m1t9,m1vl9,m1t10,m1vl10,
          m1t11,m1vl11,m1t12,m1vl12,m1t13,m1vl13,m1t14,m1vl14,m1t15,m1vl15,m1t16,m1vl16,m1t17,m1vl17,m1t18,m1vl18,m1t19,m1vl19,m1t20,m1vl20,
          m2name,
          m2t1,m2vl1,m2t2,m2vl2,m2t3,m2vl3,m2t4,m2vl4,m2t5,m2vl5,m2t6,m2vl6,m2t7,m2vl7,m2t8,m2vl8,m2t9,m2vl9,m2t10,m2vl10,
          m2t11,m2vl11,m2t12,m2vl12,m2t13,m2vl13,m2t14,m2vl14,m2t15,m2vl15,m2t16,m2vl16,m2t17,m2vl17,m2t18,m2vl18,m2t19,m2vl19,m2t20,m2vl20,
          m3name,
          m3t1,m3vl1,m3t2,m3vl2,m3t3,m3vl3,m3t4,m3vl4,m3t5,m3vl5,m3t6,m3vl6,m3t7,m3vl7,m3t8,m3vl8,m3t9,m3vl9,m3t10,m3vl10,
          m3t11,m3vl11,m3t12,m3vl12,m3t13,m3vl13,m3t14,m3vl14,m3t15,m3vl15,m3t16,m3vl16,m3t17,m3vl17,m3t18,m3vl18,m3t19,m3vl19,m3t20,m3vl20,
          m4name,
          m4t1,m4vl1,m4t2,m4vl2,m4t3,m4vl3,m4t4,m4vl4,m4t5,m4vl5,m4t6,m4vl6,m4t7,m4vl7,m4t8,m4vl8,m4t9,m4vl9,m4t10,m4vl10,
          m4t11,m4vl11,m4t12,m4vl12,m4t13,m4vl13,m4t14,m4vl14,m4t15,m4vl15,m4t16,m4vl16,m4t17,m4vl17,m4t18,m4vl18,m4t19,m4vl19,m4t20,m4vl20,
          m5name,
          m5t1,m5vl1,m5t2,m5vl2,m5t3,m5vl3,m5t4,m5vl4,m5t5,m5vl5,m5t6,m5vl6,m5t7,m5vl7,m5t8,m5vl8,m5t9,m5vl9,m5t10,m5vl10,
          m5t11,m5vl11,m5t12,m5vl12,m5t13,m5vl13,m5t14,m5vl14,m5t15,m5vl15,m5t16,m5vl16,m5t17,m5vl17,m5t18,m5vl18,m5t19,m5vl19,m5t20,m5vl20,
          m6name,
          m6t1,m6vl1,m6t2,m6vl2,m6t3,m6vl3,m6t4,m6vl4,m6t5,m6vl5,m6t6,m6vl6,m6t7,m6vl7,m6t8,m6vl8,m6t9,m6vl9,m6t10,m6vl10,
          m6t11,m6vl11,m6t12,m6vl12,m6t13,m6vl13,m6t14,m6vl14,m6t15,m6vl15,m6t16,m6vl16,m6t17,m6vl17,m6t18,m6vl18,m6t19,m6vl19,m6t20,m6vl20,
          m7name,
          m7t1,m7vl1,m7t2,m7vl2,m7t3,m7vl3,m7t4,m7vl4,m7t5,m7vl5,m7t6,m7vl6,m7t7,m7vl7,m7t8,m7vl8,m7t9,m7vl9,m7t10,m7vl10,
          m7t11,m7vl11,m7t12,m7vl12,m7t13,m7vl13,m7t14,m7vl14,m7t15,m7vl15,m7t16,m7vl16,m7t17,m7vl17,m7t18,m7vl18,m7t19,m7vl19,m7t20,m7vl20,
          m8name,
          m8t1,m8vl1,m8t2,m8vl2,m8t3,m8vl3,m8t4,m8vl4,m8t5,m8vl5,m8t6,m8vl6,m8t7,m8vl7,m8t8,m8vl8,m8t9,m8vl9,m8t10,m8vl10,
          m8t11,m8vl11,m8t12,m8vl12,m8t13,m8vl13,m8t14,m8vl14,m8t15,m8vl15,m8t16,m8vl16,m8t17,m8vl17,m8t18,m8vl18,m8t19,m8vl19,m8t20,m8vl20,
          m9name,
          m9t1,m9vl1,m9t2,m9vl2,m9t3,m9vl3,m9t4,m9vl4,m9t5,m9vl5,m9t6,m9vl6,m9t7,m9vl7,m9t8,m9vl8,m9t9,m9vl9,m9t10,m9vl10,
          m9t11,m9vl11,m9t12,m9vl12,m9t13,m9vl13,m9t14,m9vl14,m9t15,m9vl15,m9t16,m9vl16,m9t17,m9vl17,m9t18,m9vl18,m9t19,m9vl19,m9t20,m9vl20,
          m10name,
          m10t1,m10vl1,m10t2,m10vl2,m10t3,m10vl3,m10t4,m10vl4,m10t5,m10vl5,m10t6,m10vl6,m10t7,m10vl7,m10t8,m10vl8,m10t9,m10vl9,m10t10,m10vl10,
          m10t11,m10vl11,m10t12,m10vl12,m10t13,m10vl13,m10t14,m10vl14,m10t15,m10vl15,m10t16,m10vl16,m10t17,m10vl17,m10t18,m10vl18,m10t19,m10vl19,m10t20,m10vl20,

          exdescq1,exdesca1,exdescq2,exdesca2,exdescq3,exdesca3,exdescq4,exdesca4,
          exdescq5,exdesca5,exdescq6,exdesca6,exdescq7,exdesca7,exdescq8,exdesca8,
          exdescq9,exdesca9,exdescq10,exdesca10, exdescq11,exdesca11,exdescq12,exdesca12,
          exdescq13,exdesca13,exdescq14,exdesca14,exdescq15,exdesca15,exdescq16,exdesca16,
          exdescq17,exdesca17,exdescq18,exdesca18,exdescq19,exdesca19,exdescq20,exdesca20,
          ycq1,yca1,ycq2,yca2,ycq3,yca3,ycq4,yca4,
          faq1,faqa1,faq2,faqa2,faq3,faqa3,faq4,faqa4,faq5,faqa5,
          faq6,faqa6,faq7,faqa7,faq8,faqa8,faq9,faqa9,faq10,faqa10,
          faq11,faqa11,faq12,faqa12,faq13,faqa13,faq14,faqa14,faq15,faqa15,
          faq16,faqa16,faq17,faqa17,faq18,faqa18,faq19,faqa19,faq20,faqa20,
          key_title,key_point1,key_point2,key_point3,key_point4,key_point5,key_point6,
          csinfo1,disclaimer,checkbox1,formboxtitle}=req.body;
         
          
         
         
        try{
          var studymaterial =req.files.studymaterial; ///get the file
          var studymaterialfilename=studymaterial.name;///name oi the file
          const studymaterialextension= path.extname(studymaterialfilename);//extension of the file
          const studymaterialsize=studymaterial.data.length;//size of the file
          const studymaterialallowedext= /zip|tar|tgz/;///reg expression for limiting the extension of the file
         if(!studymaterialallowedext.test(studymaterialextension)) throw "UnSupported Extension! Only zip,tar,tgz allowed";
         if(studymaterialsize>10485760) throw "File must be less than 10 MB";
         const studymaterialmd5=studymaterial.md5; ///using md5 so that same file is not updated again
         var studymaterialname= studymaterialmd5 + studymaterialextension;

         var courseagenda =req.files.courseagenda;
          var courseagendafilename=courseagenda.name;
          const courseagendaextension= path.extname(courseagendafilename);
          const courseagendasize=courseagenda.data.length;
          const courseagendaallowedext= /pdf/;
         if(!courseagendaallowedext.test(courseagendaextension)) throw "UnSupported Extension! Only pdf allowed";
         const courseagendamd5=courseagenda.md5; 
         var courseagendaname= courseagendamd5 + courseagendaextension;

         var courseimage =req.files.courseimage;
          var courseimagefilename=courseimage.name;
          const courseimageextension= path.extname(courseimagefilename);
          const courseimagesize=courseimage.data.length;
          const courseimageallowedext= /jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF|webp|WEBP/;
         if(!courseimageallowedext.test(courseimageextension)) throw "UnSupported Extension! Only pdf allowed";
         const courseimagemd5=courseimage.md5; 
         var courseimagename= courseimagemd5 + courseimageextension;

         var bannerimage =req.files.bannerimage;
         var bannerimagefilename=bannerimage.name;
         const bannerimageextension= path.extname(bannerimagefilename);
         const bannerimagesize=bannerimage.data.length;
         const bannerimageallowedext= /jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF|webp|WEBP/;
        if(!bannerimageallowedext.test(bannerimageextension)) throw "UnSupported Extension! Only pdf allowed";
        const bannerimagemd5=bannerimage.md5; 
        var bannerimagename= bannerimagemd5 + bannerimageextension;

        var companyimage =req.files.companyimage;
         var companyimagefilename=companyimage.name;
         const companyimageextension= path.extname(companyimagefilename);
         const companyimagesize=companyimage.data.length;
         const companyimageallowedext= /jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF|webp|WEBP/;
        if(!companyimageallowedext.test(companyimageextension)) throw "UnSupported Extension! Only pdf allowed";
        const companyimagemd5=companyimage.md5; 
        var companyimagename= companyimagemd5 + companyimageextension;

        var certificateimage =req.files.certificateimage;
         var certificateimagefilename=certificateimage.name;
         const certificateimageextension= path.extname(certificateimagefilename);
         const certificateimagesize=certificateimage.data.length;
         const certificateimageallowedext= /jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF|webp|WEBP/;
        if(!certificateimageallowedext.test(certificateimageextension)) throw "UnSupported Extension! Only pdf allowed";
        const certificateimagemd5=certificateimage.md5; 
        var certificateimagename= certificateimagemd5 + certificateimageextension;

         const storedir=`./public/uploads/${category}`;
         fs.access(storedir,async(error)=>{
            if(error)throw "category Doesn't exist or Folder of this directory doesn't exist"
            else{
             const newdir=`./public/uploads/${category}/${coursename}`
              fs.mkdir(newdir,async(error)=>{
                if(error)
                {
                  res.json(error+"Course folder already exists")             
                }else{
                  const dir1=`./public/uploads/${category}/${coursename}/studymaterial`
                  fs.mkdir(dir1,async(err)=>{
                    if(err){
                      res.json(err+"Course folder already exists")    
                    }else{
                      const url=`./public/uploads/${category}/${coursename}/studymaterial/`+studymaterialmd5+studymaterialextension;
                      await util.promisify(studymaterial.mv)(url);
                      const dir2=`./public/uploads/${category}/${coursename}/courseagenda`
                      fs.mkdir(dir2,async(error)=>{
                        if(error){
                          res.json(error+"Course folder already exists") 
                        }
                        else{
                          const url=`./public/uploads/${category}/${coursename}/courseagenda/`+courseagendamd5+courseagendaextension;
                           await util.promisify(courseagenda.mv)(url);
                           const dir3=`./public/uploads/${category}/${coursename}/courseimage`
                           fs.mkdir(dir3,async(error)=>{
                             if(error){
                              res.json(error+"Course folder already exists") 
                             }
                             else{
                              const url=`./public/uploads/${category}/${coursename}/courseimage/`+courseimagemd5+courseimageextension;
                              await util.promisify(courseimage.mv)(url);
                              const dir4=`./public/uploads/${category}/${coursename}/bannerimage`
                              fs.mkdir(dir4,async(error)=>{
                                if(error){
                                  res.json(error+"Course folder already exists") 
                                }
                                else{
                                  const url=`./public/uploads/${category}/${coursename}/bannerimage/`+bannerimagemd5+bannerimageextension;
                                  await util.promisify(bannerimage.mv)(url);
                                  const dir5=`./public/uploads/${category}/${coursename}/companyimage`
                                  fs.mkdir(dir5,async(error)=>{
                                    if(error){
                                      res.json(error+"Course folder already exists") 
                                    }
                                    else{
                                      const url=`./public/uploads/${category}/${coursename}/companyimage/`+companyimagemd5+companyimageextension;
                                       await util.promisify(companyimage.mv)(url);
                                       const dir6=`./public/uploads/${category}/${coursename}/certificateimage`
                                       fs.mkdir(dir6,async(error)=>{
                                         if(error){
                                          res.json(error+"Course folder already exists") 
                                         }
                                         else{
                                          const url=`./public/uploads/${category}/${coursename}/certificateimage/`+certificateimagemd5+certificateimageextension;
                                          await util.promisify(certificateimage.mv)(url);
                                         }
                                       })
                                    }
                                  })
                                }
                              })                   
                             }
                           })
                        }
                      })
                    }
                  })
                }
              })
            }
         })
        }catch(err){
          console.log(err);
          res.status(500).json({
            message:err,
          });
        }
         const course_slug=coursename.toLowerCase().replace(/ /g, '-')
         .replace(/[^\w-]+/g, '');
         
          const latestUser = new Courses({ coursename,coursecode,
            courseHtag:coursehtag,
            coursecategory:category,
            coursetype,courseregid,rating,coursereview,
            coursereviewurl:reviewurl,
            coursescheduletimezone:coursetimezone,
            status,countrymetatitle,countrymetadesc,citymetatitle,citymetadesc,
            studymaterial:studymaterialname,courseagenda:courseagendaname,courseimage:courseimagename,
            bannerimage:bannerimagename, bannerimageurl,companyimage:companyimagename,
            certificateimage:certificateimagename,
            onlinetraining:{key1:key1, key2:key4,key3:key7,key4:key10,key5:key13,key6:key16,key7:key19,key8:key22},
            lvctraining:{key1:key2,key2:key5,key3:key8,key4:key11,key5:key14,key6:key17,key7:key20,key8:key23},
            classroomtraining:{key1:key3,key2:key6,key3:key9,key4:key12,key5:key15,key6:key18,key7:key21,key8:key24},
            generalqs:gqs,generalans:{a1:gqsans1,a2:gqsans2,a3:gqsans3},
            course_desc:{q1:csdescq1,a1:csdsca1,q2:csdescq2,a2:csdsca2,q3:csdescq3,a3:csdsca3,q4:csdescq4,a4:csdsca4},
            course_content:{
              module1:{name:m1name,topic1:m1t1,videolink1:m1vl1,
                        topic2:m1t2,videolink2:m1vl2,topic3:m1t3,videolink3:m1vl3,
                        topic4:m1t4,videolink4:m1vl4,topic5:m1t5,videolink5:m1vl5,
                        topic6:m1t6,videolink6:m1vl6,topic7:m1t7,videolink7:m1vl7,
                        topic8:m1t8,videolink8:m1vl8,topic9:m1t9,videolink9:m1vl9,
                        topic10:m1t10,videolink10:m1vl10,topic11:m1t11,videolink11:m1vl11,
                        topic12:m1t12,videolink12:m1vl12,topic13:m1t13,videolink13:m1vl13,
                        topic14:m1t14,videolink14:m1vl14,topic15:m1t15,videolink15:m1vl15,
                        topic16:m1t16,videolink16:m1vl16,topic17:m1t17,videolink17:m1vl17,
                        topic18:m1t18,videolink18:m1vl18,topic19:m1t19,videolink19:m1vl19,
                        topic20:m1t20,videolink20:m1vl20
                      },
                      module2:{name:m2name,topic1:m2t1,videolink1:m2vl1,
                        topic2:m2t2,videolink2:m2vl2,topic3:m2t3,videolink3:m2vl3,
                        topic4:m2t4,videolink4:m2vl4,topic5:m2t5,videolink5:m2vl5,
                        topic6:m2t6,videolink6:m2vl6,topic7:m2t7,videolink7:m2vl7,
                        topic8:m2t8,videolink8:m2vl8,topic9:m2t9,videolink9:m2vl9,
                        topic10:m2t10,videolink10:m2vl10,topic11:m2t11,videolink11:m2vl11,
                        topic12:m2t12,videolink12:m2vl12,topic13:m2t13,videolink13:m2vl13,
                        topic14:m2t14,videolink14:m2vl14,topic15:m2t15,videolink15:m2vl15,
                        topic16:m2t16,videolink16:m2vl16,topic17:m2t17,videolink17:m2vl17,
                        topic18:m2t18,videolink18:m2vl18,topic19:m2t19,videolink19:m2vl19,
                        topic20:m2t20,videolink20:m2vl20
                      },
                      module3:{name:m3name,topic1:m3t1,videolink1:m3vl1,
                        topic2:m3t2,videolink2:m3vl2,topic3:m3t3,videolink3:m3vl3,
                        topic4:m3t4,videolink4:m3vl4,topic5:m3t5,videolink5:m3vl5,
                        topic6:m3t6,videolink6:m3vl6,topic7:m3t7,videolink7:m3vl7,
                        topic8:m3t8,videolink8:m3vl8,topic9:m3t9,videolink9:m3vl9,
                        topic10:m3t10,videolink10:m3vl10,topic11:m3t11,videolink11:m3vl11,
                        topic12:m3t12,videolink12:m3vl12,topic13:m3t13,videolink13:m3vl13,
                        topic14:m3t14,videolink14:m3vl14,topic15:m3t15,videolink15:m3vl15,
                        topic16:m3t16,videolink16:m3vl16,topic17:m3t17,videolink17:m3vl17,
                        topic18:m3t18,videolink18:m3vl18,topic19:m3t19,videolink19:m3vl19,
                        topic20:m3t20,videolink20:m3vl20
                      },
                      module4:{name:m4name,topic1:m4t1,videolink1:m4vl1,
                        topic2:m4t2,videolink2:m4vl2,topic3:m4t3,videolink3:m4vl3,
                        topic4:m4t4,videolink4:m4vl4,topic5:m4t5,videolink5:m4vl5,
                        topic6:m4t6,videolink6:m4vl6,topic7:m4t7,videolink7:m4vl7,
                        topic8:m4t8,videolink8:m4vl8,topic9:m4t9,videolink9:m4vl9,
                        topic10:m4t10,videolink10:m4vl10,topic11:m4t11,videolink11:m4vl11,
                        topic12:m4t12,videolink12:m4vl12,topic13:m4t13,videolink13:m4vl13,
                        topic14:m4t14,videolink14:m4vl14,topic15:m4t15,videolink15:m4vl15,
                        topic16:m4t16,videolink16:m4vl16,topic17:m4t17,videolink17:m4vl17,
                        topic18:m4t18,videolink18:m4vl18,topic19:m4t19,videolink19:m4vl19,
                        topic20:m4t20,videolink20:m4vl20
                      },
                      module5:{name:m5name,topic1:m5t1,videolink1:m5vl1,
                        topic2:m5t2,videolink2:m5vl2,topic3:m5t3,videolink3:m5vl3,
                        topic4:m5t4,videolink4:m5vl4,topic5:m5t5,videolink5:m5vl5,
                        topic6:m5t6,videolink6:m5vl6,topic7:m5t7,videolink7:m5vl7,
                        topic8:m5t8,videolink8:m5vl8,topic9:m5t9,videolink9:m5vl9,
                        topic10:m5t10,videolink10:m5vl10,topic11:m5t11,videolink11:m5vl11,
                        topic12:m5t12,videolink12:m5vl12,topic13:m5t13,videolink13:m5vl13,
                        topic14:m5t14,videolink14:m5vl14,topic15:m5t15,videolink15:m5vl15,
                        topic16:m5t16,videolink16:m5vl16,topic17:m5t17,videolink17:m5vl17,
                        topic18:m5t18,videolink18:m5vl18,topic19:m5t19,videolink19:m5vl19,
                        topic20:m5t20,videolink20:m5vl20
                      },
                      module6:{name:m6name,topic1:m6t1,videolink1:m6vl1,
                        topic2:m6t2,videolink2:m6vl2,topic3:m6t3,videolink3:m6vl3,
                        topic4:m6t4,videolink4:m6vl4,topic5:m6t5,videolink5:m6vl5,
                        topic6:m6t6,videolink6:m6vl6,topic7:m6t7,videolink7:m6vl7,
                        topic8:m6t8,videolink8:m6vl8,topic9:m6t9,videolink9:m6vl9,
                        topic10:m6t10,videolink10:m6vl10,topic11:m6t11,videolink11:m6vl11,
                        topic12:m6t12,videolink12:m6vl12,topic13:m6t13,videolink13:m6vl13,
                        topic14:m6t14,videolink14:m6vl14,topic15:m6t15,videolink15:m6vl15,
                        topic16:m6t16,videolink16:m6vl16,topic17:m6t17,videolink17:m6vl17,
                        topic18:m6t18,videolink18:m6vl18,topic19:m6t19,videolink19:m6vl19,
                        topic20:m6t20,videolink20:m6vl20
                      },
                      module7:{name:m7name,topic1:m7t1,videolink1:m7vl1,
                        topic2:m7t2,videolink2:m7vl2,topic3:m7t3,videolink3:m7vl3,
                        topic4:m7t4,videolink4:m7vl4,topic5:m7t5,videolink5:m7vl5,
                        topic6:m7t6,videolink6:m7vl6,topic7:m7t7,videolink7:m7vl7,
                        topic8:m7t8,videolink8:m7vl8,topic9:m7t9,videolink9:m7vl9,
                        topic10:m7t10,videolink10:m7vl10,topic11:m7t11,videolink11:m7vl11,
                        topic12:m7t12,videolink12:m7vl12,topic13:m7t13,videolink13:m7vl13,
                        topic14:m7t14,videolink14:m7vl14,topic15:m7t15,videolink15:m7vl15,
                        topic16:m7t16,videolink16:m7vl16,topic17:m7t17,videolink17:m7vl17,
                        topic18:m7t18,videolink18:m7vl18,topic19:m7t19,videolink19:m7vl19,
                        topic20:m7t20,videolink20:m7vl20
                      },
                      module8:{name:m8name,topic1:m8t1,videolink1:m8vl1,
                        topic2:m8t2,videolink2:m8vl2,topic3:m8t3,videolink3:m8vl3,
                        topic4:m8t4,videolink4:m8vl4,topic5:m8t5,videolink5:m8vl5,
                        topic6:m8t6,videolink6:m8vl6,topic7:m8t7,videolink7:m8vl7,
                        topic8:m8t8,videolink8:m8vl8,topic9:m8t9,videolink9:m8vl9,
                        topic10:m8t10,videolink10:m8vl10,topic11:m8t11,videolink11:m8vl11,
                        topic12:m8t12,videolink12:m8vl12,topic13:m8t13,videolink13:m8vl13,
                        topic14:m8t14,videolink14:m8vl14,topic15:m8t15,videolink15:m8vl15,
                        topic16:m8t16,videolink16:m8vl16,topic17:m8t17,videolink17:m8vl17,
                        topic18:m8t18,videolink18:m8vl18,topic19:m8t19,videolink19:m8vl19,
                        topic20:m8t20,videolink20:m8vl20
                      },
                      module9:{name:m9name,topic1:m9t1,videolink1:m9vl1,
                        topic2:m9t2,videolink2:m9vl2,topic3:m9t3,videolink3:m9vl3,
                        topic4:m9t4,videolink4:m9vl4,topic5:m9t5,videolink5:m9vl5,
                        topic6:m9t6,videolink6:m9vl6,topic7:m9t7,videolink7:m9vl7,
                        topic8:m9t8,videolink8:m9vl8,topic9:m9t9,videolink9:m9vl9,
                        topic10:m9t10,videolink10:m9vl10,topic11:m9t11,videolink11:m9vl11,
                        topic12:m9t12,videolink12:m9vl12,topic13:m9t13,videolink13:m9vl13,
                        topic14:m9t14,videolink14:m9vl14,topic15:m9t15,videolink15:m9vl15,
                        topic16:m9t16,videolink16:m9vl16,topic17:m9t17,videolink17:m9vl17,
                        topic18:m9t18,videolink18:m9vl18,topic19:m9t19,videolink19:m9vl19,
                        topic20:m9t20,videolink20:m9vl20
                      },
                      module10:{name:m10name,topic1:m10t1,videolink1:m10vl1,
                        topic2:m10t2,videolink2:m10vl2,topic3:m10t3,videolink3:m10vl3,
                        topic4:m10t4,videolink4:m10vl4,topic5:m10t5,videolink5:m10vl5,
                        topic6:m10t6,videolink6:m10vl6,topic7:m10t7,videolink7:m10vl7,
                        topic8:m10t8,videolink8:m10vl8,topic9:m10t9,videolink9:m10vl9,
                        topic10:m10t10,videolink10:m10vl10,topic11:m10t11,videolink11:m10vl11,
                        topic12:m10t12,videolink12:m10vl12,topic13:m10t13,videolink13:m10vl13,
                        topic14:m10t14,videolink14:m10vl14,topic15:m10t15,videolink15:m10vl15,
                        topic16:m10t16,videolink16:m10vl16,topic17:m10t17,videolink17:m10vl17,
                        topic18:m10t18,videolink18:m10vl18,topic19:m10t19,videolink19:m10vl19,
                        topic20:m10t20,videolink20:m10vl20
                      },
            },
            examdesc:{q1:exdescq1,a1:exdesca1,q2:exdescq2,a2:exdesca2,
                      q3:exdescq3,a3:exdesca3,q4:exdescq4,a4:exdesca4,
                      q5:exdescq5,a5:exdesca5,q6:exdescq6,a6:exdesca6,
                      q7:exdescq7,a7:exdesca7,q8:exdescq8,a8:exdesca8,
                      q9:exdescq9,a9:exdesca9,q10:exdescq10,a10:exdesca10,
                      q11:exdescq11,a11:exdesca11,q12:exdescq12,a12:exdesca12,
                      q13:exdescq13,a13:exdesca13,q14:exdescq14,a14:exdesca14,
                      q15:exdescq15,a15:exdesca15,q16:exdescq16,a16:exdesca16,
                      q17:exdescq17,a17:exdesca17,q18:exdescq18,a18:exdesca18,
                      q19:exdescq19,a19:exdesca19,q20:exdescq20,a20:exdesca20},
             whychoose:{
               ycq1,yca1,ycq2,yca2,ycq3,yca3,ycq4,yca4
             },
             course_key_points:{title:key_title,key1:key_point1,key2:key_point2,
                  key3:key_point3,key4:key_point4,key5:key_point5,key6:key_point6},
            faq:{q1:faq1,a1:faqa1,q2:faq2,a2:faqa2,q3:faq3,a3:faqa3,q4:faq4,a4:faqa4,q5:faq5,a5:faqa5,
                q6:faq6,a6:faqa6,q7:faq7,a7:faqa7,q8:faq8,a8:faqa8,q9:faq9,a9:faqa9,q10:faq10,a10:faqa10,
                q11:faq11,a11:faqa11,q12:faq12,a12:faqa12,q13:faq13,a13:faqa13,q14:faq14,a14:faqa14,q15:faq15,a15:faqa15,
                q16:faq16,a16:faqa16,q17:faq17,a17:faqa17,q18:faq18,a18:faqa18,q19:faq19,a19:faqa19,q20:faq20,a20:faqa20},
                course_info:csinfo1,course_slug,
                disclaimer,checkbox_status:checkbox1,formbox_title:formboxtitle});
          latestUser
            .save()
            .then(() => {
              console.log("course created");
              alert("course created")
            })
            .catch((err) => console.log(err));
            res.redirect('/courses');

    
    })
     ///////////////////update courses / edit courses/////////////////////////////////
  .post("/updatecoursesdata/:id",fileupload(), async (req, res) => {
    const id=req.params.id;
    const {coursename,oldcname,coursecode,coursehtag,category,
      coursetype,courseregid,rating,coursereview,
      reviewurl,coursetimezone,status,countrymetatitle,
      countrymetadesc,citymetatitle,citymetadesc,
      smatname,courseagendaname,courseimagename,
      bannerimagename,bannerimageurl,companyimagename,certificateimagename,
      key1,key2,key3,key4,key5,key6,key7,key8,key9,key10,key11,key12,
      key13,key14,key15,key16,key17,key18,key19,key20,key21,key22,key23,key24,
      gqs,gqsans1,gqsans2,gqsans3,
      csdescq1,csdsca1,csdescq2,csdsca2,csdescq3,csdsca3,csdescq4,csdsca4,

      exdescq1,exdesca1,exdescq2,exdesca2,exdescq3,exdesca3,exdescq4,exdesca4,
      exdescq5,exdesca5,exdescq6,exdesca6,exdescq7,exdesca7,exdescq8,exdesca8,
      exdescq9,exdesca9,exdescq10,exdesca10, exdescq11,exdesca11,exdescq12,exdesca12,
      exdescq13,exdesca13,exdescq14,exdesca14,exdescq15,exdesca15,exdescq16,exdesca16,
      exdescq17,exdesca17,exdescq18,exdesca18,exdescq19,exdesca19,exdescq20,exdesca20,
      ycq1,yca1,ycq2,yca2,ycq3,yca3,ycq4,yca4,
      faq1,faqa1,faq2,faqa2,faq3,faqa3,faq4,faqa4,faq5,faqa5,
      faq6,faqa6,faq7,faqa7,faq8,faqa8,faq9,faqa9,faq10,faqa10,
      faq11,faqa11,faq12,faqa12,faq13,faqa13,faq14,faqa14,faq15,faqa15,
      faq16,faqa16,faq17,faqa17,faq18,faqa18,faq19,faqa19,faq20,faqa20,
      key_title,key_point1,key_point2,key_point3,key_point4,key_point5,key_point6,
      csinfo1,disclaimer,checkbox1,formboxtitle}=req.body;
    
        
      try{
        var studymaterialnew =req.files.studymaterialnew; ///get the file
        var studymaterialnewfilename=studymaterialnew.name;///name oi the file
        const studymaterialnewextension= path.extname(studymaterialnewfilename);//extension of the file
        const studymaterialnewsize=studymaterialnew.data.length;//size of the file
        const studymaterialnewallowedext= /zip|tar|tgz/;///reg expression for limiting the extension of the file
       if(!studymaterialnewallowedext.test(studymaterialnewextension)) throw "UnSupported Extension! Only zip,tar,tgz allowed";
       if(studymaterialnewsize>10485760) throw "File must be less than 10 MB";
       const studymaterialnewmd5=studymaterialnew.md5; ///using md5 so that same file is not updated again
       var studymaterialnewname= studymaterialnewmd5 + studymaterialnewextension;

       var courseagendanew =req.files.courseagendanew;
       var courseagendanewfilename=courseagendanew.name;
       const courseagendanewextension= path.extname(courseagendanewfilename);
       const courseagendanewsize=courseagendanew.data.length;
       const courseagendanewallowedext= /pdf/;
      if(!courseagendanewallowedext.test(courseagendanewextension)) throw "UnSupported Extension! Only pdf allowed";
      const courseagendanewmd5=courseagendanew.md5; 
      var courseagendanewname= courseagendanewmd5 + courseagendanewextension;

      var courseimagenew =req.files.courseimagenew;
       var courseimagenewfilename=courseimagenew.name;
       const courseimagenewextension= path.extname(courseimagenewfilename);
       const courseimagenewsize=courseimagenew.data.length;
       const courseimagenewallowedext= /jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF|webp|WEBP/;
      if(!courseimagenewallowedext.test(courseimagenewextension)) throw "UnSupported Extension! Only pdf allowed";
      const courseimagenewmd5=courseimagenew.md5; 
      var courseimagenewname= courseimagenewmd5 + courseimagenewextension;

      var bannerimagenew =req.files.bannerimagenew;
      var bannerimagenewfilename=bannerimagenew.name;
      const bannerimagenewextension= path.extname(bannerimagenewfilename);
      const bannerimagenewsize=bannerimagenew.data.length;
      const bannerimagenewallowedext= /jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF|webp|WEBP/;
     if(!bannerimagenewallowedext.test(bannerimagenewextension)) throw "UnSupported Extension! Only pdf allowed";
     const bannerimagenewmd5=bannerimagenew.md5; 
     var bannerimagenewname= bannerimagenewmd5 + bannerimagenewextension;

     var companyimagenew =req.files.companyimagenew;
      var companyimagenewfilename=companyimagenew.name;
      const companyimagenewextension= path.extname(companyimagenewfilename);
      const companyimagenewsize=companyimagenew.data.length;
      const companyimagenewallowedext= /jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF|webp|WEBP/;
     if(!companyimagenewallowedext.test(companyimagenewextension)) throw "UnSupported Extension! Only pdf allowed";
     const companyimagenewmd5=companyimagenew.md5; 
     var companyimagenewname= companyimagenewmd5 + companyimagenewextension;

     var certificateimagenew =req.files.certificateimagenew;
      var certificateimagenewfilename=certificateimagenew.name;
      const certificateimagenewextension= path.extname(certificateimagenewfilename);
      const certificateimagenewsize=certificateimagenew.data.length;
      const certificateimagenewallowedext= /jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF|webp|WEBP/;
     if(!certificateimagenewallowedext.test(certificateimagenewextension)) throw "UnSupported Extension! Only pdf allowed";
     const certificateimagenewmd5=certificateimagenew.md5; 
     var certificateimagenewname= certificateimagenewmd5 + certificateimagenewextension;

       const storedir=`./public/uploads/${category}`;
        // if(coursename==oldcname){
        //   const newdir=`./public/uploads/${category}/${oldcname}`
        // }else{
        //   const newdir=`./public/uploads/${category}/${coursename}`
        // }
        fs.access(storedir,async(error)=>{
          if(error)throw "category Doesn't exist or Folder of this directory doesn't exist"
            else{
              if(coursename==oldcname){
                const newdir=`./public/uploads/${category}/${oldcname}`
                fs.access(newdir,async(error)=>{
                  if(error)throw error
                  else{
                    const dir1=`./public/uploads/${category}/${oldcname}/studymaterial`
                    fs.access(dir1,async(error)=>{
                      if(error) throw error
                      else{
                        fse.emptyDirSync(`./public/uploads/${category}/${oldcname}/studymaterial`)
                        const url=`./public/uploads/${category}/${oldcname}/studymaterial/`+studymaterialnewmd5+studymaterialnewextension;
                        await util.promisify(studymaterialnew.mv)(url);
                        const dir2=`./public/uploads/${category}/${oldcname}/courseagenda`
                        fs.access(dir2,async(error)=>{
                          if(error) throw error
                          else{
                            fse.emptyDirSync(`./public/uploads/${category}/${oldcname}/courseagenda`)
                            const url=`./public/uploads/${category}/${oldcname}/courseagenda/`+courseagendanewmd5+courseagendanewextension;
                           await util.promisify(courseagendanew.mv)(url);
                           const dir3=`./public/uploads/${category}/${oldcname}/courseimage`
                           fs.access(dir3,async(error)=>{
                             if(error) throw error
                             else{
                              fse.emptyDirSync(`./public/uploads/${category}/${oldcname}/courseimage`)
                              const url=`./public/uploads/${category}/${oldcname}/courseimage/`+courseimagenewmd5+courseimagenewextension;
                              await util.promisify(courseimagenew.mv)(url);
                              const dir4=`./public/uploads/${category}/${oldcname}/bannerimage`
                              fs.access(dir4,async(error)=>{
                                if(error) throw error
                                else{
                                  fse.emptyDirSync(`./public/uploads/${category}/${oldcname}/bannerimage`)
                                  const url=`./public/uploads/${category}/${oldcname}/bannerimage/`+bannerimagenewmd5+bannerimagenewextension;
                                  await util.promisify(bannerimagenew.mv)(url);
                                  const dir5=`./public/uploads/${category}/${oldcname}/companyimage`
                                  fs.access(dir5,async(error)=>{
                                    if(error) throw error
                                    else{
                                      fse.emptyDirSync(`./public/uploads/${category}/${oldcname}/companyimage`)
                                      const url=`./public/uploads/${category}/${oldcname}/companyimage/`+companyimagenewmd5+companyimagenewextension;
                                      await util.promisify(companyimagenew.mv)(url);
                                      const dir6=`./public/uploads/${category}/${oldcname}/certificateimage`
                                      fs.access(dir6,async(error)=>{
                                        if(error)throw error
                                        else{
                                          fse.emptyDirSync(`./public/uploads/${category}/${oldcname}/certificateimage`)
                                          const url=`./public/uploads/${category}/${oldcname}/certificateimage/`+certificateimagenewmd5+certificateimagenewextension;
                                          await util.promisify(certificateimagenew.mv)(url);
                                        }
                                      })
                                    }
                                  })
                                }
                              })
                             }
                           })
                          }
                        })
                      }
                    })
                  }

                })
              }else{
                const newdir=`./public/uploads/${category}/${coursename}`
                fs.mkdir(newdir,async(error)=>{
                  if(error)throw error
                  else{
                    const dir1=`./public/uploads/${category}/${coursename}/studymaterial`
                    fs.mkdir(dir1,async(error)=>{
                      if(error) throw error
                      else{
                        const url=`./public/uploads/${category}/${coursename}/studymaterial/`+studymaterialnewmd5+studymaterialnewextension;
                        await util.promisify(studymaterialnew.mv)(url);
                      const dir2=`./public/uploads/${category}/${coursename}/courseagenda`
                      fs.mkdir(dir2,async(err)=>{
                        if(err)throw err
                        else{
                          const url=`./public/uploads/${category}/${coursename}/courseagenda/`+courseagendanewmd5+courseagendanewextension;
                           await util.promisify(courseagendanew.mv)(url);
                           const dir3=`./public/uploads/${category}/${coursename}/courseimage`
                           fs.mkdir(dir3,async(err)=>{
                             if(err)throw err
                             else{
                              const url=`./public/uploads/${category}/${coursename}/courseimage/`+courseimagenewmd5+courseimagenewextension;
                              await util.promisify(courseimagenew.mv)(url);
                              const dir4=`./public/uploads/${category}/${coursename}/bannerimage`
                              fs.mkdir(dir4,async(err)=>{
                                if(err)throw err
                                else{
                                  const url=`./public/uploads/${category}/${coursename}/bannerimage/`+bannerimagenewmd5+bannerimagenewextension;
                                  await util.promisify(bannerimagenew.mv)(url);
                                  const dir5=`./public/uploads/${category}/${coursename}/companyimage`
                                  fs.mkdir(dir5,async(err)=>{
                                    if(err)throw err
                                    else{
                                      const url=`./public/uploads/${category}/${coursename}/companyimage/`+companyimagenewmd5+companyimagenewextension;
                                      await util.promisify(companyimagenew.mv)(url);
                                      const dir6=`./public/uploads/${category}/${coursename}/certificateimage`
                                      fs.mkdir(dir6,async(err)=>{
                                        if(err)throw err
                                        else{
                                          const url=`./public/uploads/${category}/${coursename}/certificateimage/`+certificateimagenewmd5+certificateimagenewextension;
                                          await util.promisify(certificateimagenew.mv)(url);
                                        }
                                      })
                                    }
                                  })
                                }
                              })
                             }
                           })
                        }
                      })
                      }
                    })
                  }
                })
              }

            }
        })

        }catch(err){
        console.log(err);
        res.status(500).json({
          message:err,
        });
      }
    const idexist=await Courses.findOne({_id:id});
    //console.log(idexist)
    if(idexist){
      Courses
     .updateMany ({ _id: idexist._id },{coursename,coursecode,
      courseHtag:coursehtag,
      coursecategory:category,
      coursetype,courseregid,rating,coursereview,
      coursereviewurl:reviewurl,
      coursescheduletimezone:coursetimezone,
      status,countrymetatitle,countrymetadesc,citymetatitle,citymetadesc,
      studymaterial:studymaterialnewname,courseagenda:courseagendanewname,courseimage:courseimagenewname,
      bannerimage:bannerimagenewname,bannerimageurl,companyimage:companyimagenewname,
      certificateimage:certificateimagenewname,
      onlinetraining:{key1:key1, key2:key4,key3:key7,key4:key10,key5:key13,key6:key16,key7:key19,key8:key22},
      lvctraining:{key1:key2,key2:key5,key3:key8,key4:key11,key5:key14,key6:key17,key7:key20,key8:key23},
      classroomtraining:{key1:key3,key2:key6,key3:key9,key4:key12,key5:key15,key6:key18,key7:key21,key8:key24},
      generalqs:gqs,generalans:{a1:gqsans1,a2:gqsans2,a3:gqsans3},
      course_desc:{q1:csdescq1,a1:csdsca1,q2:csdescq2,a2:csdsca2,q3:csdescq3,a3:csdsca3,q4:csdescq4,a4:csdsca4},
      examdesc:{q1:exdescq1,a1:exdesca1,q2:exdescq2,a2:exdesca2,
        q3:exdescq3,a3:exdesca3,q4:exdescq4,a4:exdesca4,
        q5:exdescq5,a5:exdesca5,q6:exdescq6,a6:exdesca6,
        q7:exdescq7,a7:exdesca7,q8:exdescq8,a8:exdesca8,
        q9:exdescq9,a9:exdesca9,q10:exdescq10,a10:exdesca10,
        q11:exdescq11,a11:exdesca11,q12:exdescq12,a12:exdesca12,
        q13:exdescq13,a13:exdesca13,q14:exdescq14,a14:exdesca14,
        q15:exdescq15,a15:exdesca15,q16:exdescq16,a16:exdesca16,
        q17:exdescq17,a17:exdesca17,q18:exdescq18,a18:exdesca18,
        q19:exdescq19,a19:exdesca19,q20:exdescq20,a20:exdesca20},
      whychoose:{
        ycq1,yca1,ycq2,yca2,ycq3,yca3,ycq4,yca4
      },
      course_key_points:{title:key_title,key1:key_point1,key2:key_point2,
        key3:key_point3,key4:key_point4,key5:key_point5,key6:key_point6},
      faq:{q1:faq1,a1:faqa1,q2:faq2,a2:faqa2,q3:faq3,a3:faqa3,q4:faq4,a4:faqa4,q5:faq5,a5:faqa5,
        q6:faq6,a6:faqa6,q7:faq7,a7:faqa7,q8:faq8,a8:faqa8,q9:faq9,a9:faqa9,q10:faq10,a10:faqa10,
        q11:faq11,a11:faqa11,q12:faq12,a12:faqa12,q13:faq13,a13:faqa13,q14:faq14,a14:faqa14,q15:faq15,a15:faqa15,
        q16:faq16,a16:faqa16,q17:faq17,a17:faqa17,q18:faq18,a18:faqa18,q19:faq19,a19:faqa19,q20:faq20,a20:faqa20},
          course_info:csinfo1,disclaimer,checkbox_status:checkbox1,formbox_title:formboxtitle})
     .then(()=>{
       //res.redirect('/Thanks')
       alert("You have succesfully Updated courses")
       return;
     })
    .catch((err) => console.log(err));
   }else{
     res.send("no data found to edit");
   }
   res.redirect('/courses');
   })
   .post("/scheduledata", async (req, res) => {
    
    const {category,coursename, countryname,cityname,baseprice,specialprice,tax,
      status,stage,type,classtype,myrosterdate,starttime,endtime} = req.body;
    

    const latestUser = new ScheduledCourses({ category_name:category,
      course_name:coursename,country:countryname,city: cityname, base_price: baseprice,special_price:specialprice,tax,course_stage: stage,
       course_type: type,class_type: classtype,date:myrosterdate,start_time:starttime,end_time:endtime,status });
    latestUser
      .save()
      .then(() => {
        console.log("schedule created");
        alert("Schedule  created")
      })
      .catch((err) => console.log(err));
      res.redirect('/schedulecourses');
      
  })
  .post("/updateschedulesdata/:id", async (req, res) => {
    const id=req.params.id;
    const {category,coursename, countryname,cityname,baseprice,specialprice,tax,
      status,stage,type,classtype,myrosterdate,starttime,endtime} = req.body;
   
    const idexist=await ScheduledCourses.findOne({_id:id});
    //console.log(idexist)
    if(idexist){
     ScheduledCourses
     .updateMany ({ _id: idexist._id },{ category_name:category,
      course_name:coursename,country:countryname,city: cityname, base_price: baseprice,special_price:specialprice,tax,course_stage: stage,
       course_type: type,class_type: classtype,date:myrosterdate,start_time:starttime,end_time:endtime,status})
     .then(()=>{
       //res.redirect('/Thanks')
       alert("You have succesfully Updated Schedules")
       return;
     })
    .catch((err) => console.log(err));
   }else{
     res.send("no data found to edit");
   }
   res.redirect('/schedulecourses');
   })
   //reviews data post calls
   //save review data
   .post("/reviewdata",fileupload(), async(req,res)=>{
    const {reviewername,rcomment,reviewerjobdesc,reviewdate,
      reviewerrating,reviewerlinkedinurl,reviewerimage,status}=req.body;
      try{
        const reviewimg = req.files.reviewimg;
        var reviewimgfileName = reviewimg.name;
        const reviewimgsize = reviewimg.data.length;
        const reviewimgextension = path.extname(reviewimgfileName);
        const reviewimgallowedExtensions = /jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF|webp|WEBP/;
        if(!reviewimgallowedExtensions.test(reviewimgextension)) throw "Unsupported extension!";
        if(reviewimgsize > 5000000) throw "File must be less than 5MB";
        const reviewimgmd5 = reviewimg.md5;
        var reviewfilename=reviewimgmd5 + reviewimgextension;
        console.log(reviewfilename)
        const reviewimgURL = "./public/uploads/reviews/" + reviewimgmd5 + reviewimgextension;
        await util.promisify(reviewimg.mv)(reviewimgURL);
      } catch(err){
        console.log(err)
        res.status(500).json({
          message: err,
        });
       }
       const name11 = new reviewer({reviewername,
        rcomment,
        reviewerjobdesc,
        reviewdate,
        reviewerrating,
        reviewerlinkedinurl,
        reviewerimage:reviewfilename,
        status
        })
    name11.save()
      .then(() => {
       console.log("review created");
      })
      res.redirect("/reviews")
   })
   //updating reviews
   .post('/revieweditreviews/:id',fileupload(),async(req,res)=>{
    const id =req.params.id;
    const {reviewername,rcomment,reviewerjobdesc,reviewdate,reviewerrating,reviewerimage,status}=req.body;
    try{
      const editedreviewimg = req.files.editedreviewimg;
        var editedreviewimgfileName = editedreviewimg.name;
        const editedreviewimgsize = editedreviewimg.data.length;
        const editedreviewimgextension = path.extname(editedreviewimgfileName);
        const editedreviewimgallowedExtensions = /jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF|webp|WEBP/;
        if(!editedreviewimgallowedExtensions.test(editedreviewimgextension)) throw "Unsupported extension!";
        if(editedreviewimgsize > 5000000) throw "File must be less than 5MB";
        const editedreviewimgmd5 = editedreviewimg.md5;
        var revieweditfilename=editedreviewimgmd5 + editedreviewimgextension;
        console.log(revieweditfilename)
        const editedreviewimgURL = "./public/uploads/reviews/" + editedreviewimgmd5 + editedreviewimgextension;
        await util.promisify(editedreviewimg.mv)(editedreviewimgURL);
    } catch(err){
      console.log(err)
      res.status(500).json({
        message: err,
      });
     }
     const namereviewediting = new reviewer({reviewername,
      rcomment,
      reviewerjobdesc,
      reviewdate,
      reviewerrating,
      // reviewerlinkedinurl,
      reviewerimage:revieweditfilename,
      status
      })
    const idexist=await reviewer.findOne({_id:id});
    if(idexist){
      reviewer
     .updateMany ({ _id: idexist._id },{ reviewername,rcomment,reviewerjobdesc,reviewdate,reviewerrating,reviewerimage:revieweditfilename,status})
     .then(()=>{
       alert("You have succesfully Updated category")
       return;
     })
    .catch((err) => console.log(err));
   }else{
     res.send("no data found to edit");
   }
   res.redirect("/reviews")
  })
   //////post trainer data/////////////////////
   .post("/trainerdata",fileupload(), async (req, res) => {
    const {trainername,course,learnercount,status,trainer_desc,trainer_course_desc,disclaimer,videototaltime}=req.body;
    try{
          var courseimage =req.files.courseimage;
           var courseimagefilename=courseimage.name;
           const courseimageextension= path.extname(courseimagefilename);
           const courseimagesize=courseimage.data.length;
           const courseimageallowedext= /jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF|webp|WEBP/;

           if(!courseimageallowedext.test(courseimageextension)) throw "UnSupported Extension! Only images allowed";
          const courseimagemd5=courseimage.md5; 
          const trainercourseURl = "./public/uploads/trainercourses/" + courseimagemd5 + courseimageextension;
          var trainercourseimagename=courseimagemd5 + courseimageextension;
          
          await util.promisify(courseimage.mv)(trainercourseURl);
 
         var trainerimage =req.files.trainerimage;
          var trainerimagefilename=trainerimage.name;
          const trainerimageextension= path.extname(trainerimagefilename);
          const trainerimagesize=trainerimage.data.length;
          const trainerimageallowedext= /jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF|webp|WEBP/;
          if(!trainerimageallowedext.test(trainerimageextension)) throw "UnSupported Extension! Only images allowed";
         const trainerimagemd5=trainerimage.md5; 
         const trainerimageURl = "./public/uploads/trainer/" + trainerimagemd5 + trainerimageextension;
         var trainerimagename= trainerimagemd5 + trainerimageextension;
        
         await util.promisify(trainerimage.mv)(trainerimageURl);

         }catch(err){
           console.log(err);
           res.status(500).json({
             message:err,
           });
         }
           const latestUser = new Trainers({ trainer_name:trainername,trainer_desc,trainer_course:course,trainer_course_desc,
            disclaimer,learner_count:learnercount,video_total_time:videototaltime,status,image:trainerimagename,
            course_image:trainercourseimagename});
           latestUser
             .save()
             .then(() => {
               console.log("Trainer created");
               alert("Trainer created")
             })
             .catch((err) => console.log(err));
             res.redirect('/trainers');
     })
     ///updating trainers
     .post('/trainerupdateddata/:id',fileupload(),async(req,res)=>{
      const id =req.params.id;
     
      const {trainername,course,learnercount,status,trainer_desc,trainer_course_desc,disclaimer,videototaltime}=req.body;
      try{
        var courseimage =req.files.courseimage;
           var courseimagefilename=courseimage.name;
           const courseimageextension= path.extname(courseimagefilename);
           const courseimagesize=courseimage.data.length;
           const courseimageallowedext= /jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF|webp|WEBP/;
          if(!courseimageallowedext.test(courseimageextension)) throw "UnSupported Extension! Only images allowed";
          const courseimagemd5=courseimage.md5; 
          const trainercourseURl = "./public/uploads/trainercourses/" + courseimagemd5 + courseimageextension;
          var trainercourseimagename=courseimagemd5 + courseimageextension;
          
          await util.promisify(courseimage.mv)(trainercourseURl);
 
         var trainerimage =req.files.trainerimage;
          var trainerimagefilename=trainerimage.name;
          const trainerimageextension= path.extname(trainerimagefilename);
          const trainerimagesize=trainerimage.data.length;
          const trainerimageallowedext= /jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF|webp|WEBP/;
         if(!trainerimageallowedext.test(trainerimageextension)) throw "UnSupported Extension! Only images allowed";
         const trainerimagemd5=trainerimage.md5; 
         const trainerimageURl = "./public/uploads/trainer/" + trainerimagemd5 + trainerimageextension;
         var trainerimagename= trainerimagemd5 + trainerimageextension;
        
         await util.promisify(trainerimage.mv)(trainerimageURl);
      } catch(err){
        console.log(err)
        res.status(500).json({
          message: err,
        });
       }
      const idexist=await Trainers.findOne({_id:id});
      if(idexist){
        Trainers
        .updateMany ({ _id: idexist._id },{ trainer_name:trainername,trainer_desc,trainer_course:course,trainer_course_desc,
          disclaimer,learner_count:learnercount,video_total_time:videototaltime,status,image:trainerimagename,
          course_image:trainercourseimagename})
        .then(()=>{
          //res.redirect('/Thanks')
          alert("You have succesfully Updated your Data!You can Go Back,Thanks")
          return;
        })
       .catch((err) => console.log(err));
      }else{
        res.send("no data found to edit");
      }
      res.redirect('/trainers');
    });
  

// -> Import CSV File to MongoDB database
function countryfileimport(filePath){
  csv()
      .fromFile(filePath)
      .then((jsonObj)=>{
          //console.log(jsonObj);
          // Insert Json-Object to MongoDB
          MongoClient.connect("mongodb://localhost/lmsadmin", { useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
              if (err) throw err;
              let dbo = db.db("lmsadmin");
              dbo.collection("countries").insertMany(jsonObj, (err, res) => {
                 if (err) throw err;
                // console.log("Number of documents inserted: " + res.insertedCount);
                 /**
                     Number of documents inserted: 5
                 */
                //  db.close();
              });
          });
          fs.unlinkSync(filePath);
      })
}
// -> Import CSV File to MongoDB database
function cityfileimport(filePath){
  csv()
      .fromFile(filePath)
      .then((jsonObj)=>{
          //console.log(jsonObj);
          // Insert Json-Object to MongoDB
          MongoClient.connect("mongodb://localhost/lmsadmin", { useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
              if (err) throw err;
              let dbo = db.db("lmsadmin");
              dbo.collection("cities").insertMany(jsonObj, (err, res) => {
                 if (err) throw err;
                 //console.log("Number of documents inserted: " + res.insertedCount);
                
                //  db.close();
              });
          });
          fs.unlinkSync(filePath);
      })
}
function schedulefileimport(filePath,coursename,category){
  csv()
      .fromFile(filePath)
      .then((jsonObj)=>{
        for(var i=0;i<jsonObj.length;i++){
          jsonObj[i].course_name=`${coursename}`
          jsonObj[i].category_name=`${category}`
          jsonObj[i].status="Enable"
          
        }
        // console.log(jsonObj);
          // Insert Json-Object to MongoDB
          MongoClient.connect("mongodb://localhost/lmsadmin", { useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
              if (err) throw err;
              let dbo = db.db("lmsadmin");
              dbo.collection("scheduledcourses").insertMany(jsonObj, (err, res) => {
                 if (err) throw err;
                 //console.log("Number of documents inserted: " + res.insertedCount);
                
                //  db.close();
              });
          });
          fs.unlinkSync(filePath);
      })
}
  //for posting data in affliates db
  // .post("/afdata", async (req, res) => {
  //   const { sid,affliate_name,email,commission,links_clicked,incomplete_reg,trial_reg,paid_reg } = req.body;
  //   const latestUser = new Affliates({ sid,affliate_name,email,commission,links_clicked,incomplete_reg,trial_reg,paid_reg });
  //   latestUser
  //     .save()
  //     .then(() => {
  //       res.send("registered data in affliates!");
  //       return;
  //     })
  //     .catch((err) => console.log(err));
  // });

  //for posting data in course orders db
  // .post("/courseorder", async (req, res) => {

  //     const { sid,order_id,invoice_id,transaction_id,course_code, learner_count,email} = req.body;

  //     var orderId='Order Id-'+order_id;
  //     var invoiceId='Invoice Id- '+invoice_id;
      
  //     let date_ob = new Date();
  //     let date = ("0" + date_ob.getDate()).slice(-2);

  //     // current month
  //     let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
      
  //     // current year
  //     let year = date_ob.getFullYear();
      
  //     // current hours
  //     let hours = date_ob.getHours();
      
  //     // current minutes
  //     let minutes = date_ob.getMinutes();
      
  //     // current seconds
  //     let seconds = date_ob.getSeconds();
      
  //    prints date & time in YYYY-MM-DD HH:MM:SS format
  //    var current_date=date + "-" + month + "-" + year + " " + hours + ":" + minutes + ":" + seconds;

  //     const latestUser = new courseorders({ sid,order_id:orderId ,invoice_id:invoiceId,transaction_id,course_code, learner_count,email,order_date:current_date});
  //     latestUser
  //       .save()
  //       .then(() => {
  //         res.send("registered data in orders!");
  //         return;
  //       })
  //       .catch((err) => console.log(err));
  //   });




//logout///////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/logout", authenticateUser, (req, res) => {
  req.session.user = null;
  res.redirect("/login");
});




// server config///////////////////////////////////////////////////////////////////////////////////////////////////////////
const PORT = 3200;
app.listen(PORT, () => {
  console.log(`Server started listening on port: ${PORT}`);
});
