const express = require("express");
const app = express();
const methodOverride = require('method-override')
const mongoose = require("mongoose");
const ejs = require("ejs");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const Applicant = require("./models/applicant.js");
const Job= require("./models/job.js");
isLoggedIn= require("./middleware.js");
isAdmin= require("./isAdmin.js");
const path = require("path");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
require('dotenv').config()

port = process.env.PORT || 4000;



const multer = require("multer");
const { storage } = require("./cloudConfig.js");

const upload = multer({ storage });


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
//app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
//app.use(bodyParser.urlencoded({ extended: true }));

dbUrl="mongodb://localhost:27017/internship";
try {
    mongoose.connect(dbUrl);
    console.log("connect to databse")

} catch (error) {
    console.log("Error:", error);

}

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: "mysecretcode"
    },
    touchAfter: 24 * 3600,
});

const sessionOptions = {
    store,
    secret: "mysecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.get("/", async(req, res) => {
    try {
        
    const list=await Job.find({});
    const admi= req.user||null;
    res.render("home/home1.ejs", {list, admi});
    } catch (error) {
        res.send(error);
    }
})

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/signup", (req, res) => {
    res.render("signup/signup.ejs");
});


 app.post("/signup", async (req, res) => {
        try {
            let { username, email, password } = req.body;
            const chutiyaUser = new User({ username, email });
            let registerUser = await User.register(chutiyaUser, password);
            await registerUser.save();
            //functionality to directly login after signup
            req.login(registerUser, (err) => {
                if (err) {
                    return next(err);
                } else {
                    return res.redirect("/");
                }
            });
    
        } catch (error) {
            res.send(error);
        }

});
 

app.get("/login", (req, res) => {
    res.render("login/login.ejs");
});

app.post(
    "/login",
    passport.authenticate("local", { failureRedirect: "/login" }),
    async (req, res) => {
        try {
            const list=await Job.find({});
    const admi= req.user||null;
    res.render("home/home1.ejs", {list, admi});

        } catch (error) {
            res.send(error);
        }
        //res.redirect("/");
    }
);

app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        } else {
            return res.redirect("/");
        }
    });
});


app.post("/applicant",isLoggedIn,upload.single("resume"), async(req, res) => {
    try {
       // const url = req.file.path;
        //const filename = req.file.filename;
        const { name, description, resume, education, state, country, job, skill } = req.body;
        const newApplicant = new Applicant({
            name, description, resume, education, state, country, job, skill
        });

        //newApplicant.resume = { url, filename };
        await newApplicant.save();
        //const id= await newApplicant._id;
        res.redirect("/success");
    } catch (error) {
        res.send(error);
    }
  })

  app.get("/preview/:id",isLoggedIn, async(req,res)=>{
            try {
                const id= req.params.id;
                const applicant= await Applicant.findById(id);
                res.render("preview/preview.ejs",{applicant});
            } catch (error) {
                res.send(error);
            }
  })

  app.get("/success",(req,res)=>{
    res.render("success/success.ejs");
  })

  app.get("/admin", isLoggedIn,isAdmin,(req,res)=>{
    res.render("admin/admin.ejs");
  })

  app.get("/job-posting",isLoggedIn, (req,res)=>{
    res.render("job-posting/job-posting.ejs");
  })

  app.get("/job-posting/:id",isLoggedIn, async(req,res)=>{
    try {
        const id = req.params.id;
    const job= await Job.findById(id);
    res.render("show-job/show-job.ejs",{job});
    } catch (error) {
        res.send(error);
    }
})

app.delete("/job-posting/job-apply/:id", isLoggedIn,isAdmin, async(req,res)=>{
    try {
        const id = req.params.id;
    await Job.findByIdAndDelete(id);
    res.redirect("/")
    } catch (error) {
        res.send(error);
    }
})

  app.post("/job-posting",isLoggedIn,isAdmin,async(req,res)=>{
    try {
        const {jobTitle,description,jobType,location,salary,skill,country,companyName}=req.body;
    const listing= await new Job({jobTitle,description,companyName,jobType,location,salary,skill,country});
    await listing.save();
    res.redirect("/admin");
    } catch (error) {
        res.send(error);
    }
  })

  app.get("/job-posting/job-apply/:id", isLoggedIn, async(req,res)=>{
    try {
        const id = req.params.id;
    const job= await Job.findById(id);
    res.render("job/job.ejs",{job});
    } catch (error) {
        res.send(error);
    }
  })
  


app.listen(port, '0.0.0.0' , () => {
    console.log(`server running on port: ${port} `);
});
