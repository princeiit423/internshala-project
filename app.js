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
const isLoggedIn= require("./middleware.js");
const isAdmin= require("./isAdmin.js");
const isApply = require("./isApply");
const path = require("path");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
require('dotenv').config()

const port = process.env.PORT || 4000;




const multer = require("multer");
const { storage } = require("./cloudConfig.js");

const upload = multer({ storage });


app.set("views", path.join(__dirname, "views"));
app.set("public", path.join(__dirname, "public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
//app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
//app.use(bodyParser.urlencoded({ extended: true }));

dbUrl=process.env.DBM;
//const dbUrl="mongodb://localhost:27017/internship";
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


app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", async(req, res) => {
    try {
        
    const list=await Job.find({});
    const admi= req.user||null;
    res.render("home/home1.ejs", {list, admi});
    } catch (error) {
        res.send(error);
    }
})
app.get("/dashboard",isLoggedIn,isApply,async(req,res)=>{
    try {
        //console.log(req.user.id);
        const user = await User.findById(req.user.id)
            .populate({
                path: "applicantId",
                populate: {
                    path: "jobId", // Nested populate for job details
                    model: "Job"
                }
            });
        res.render("dashboard/dashboard.ejs",{user});
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }

    // res.render("dashboard/dashboard.ejs");
})


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
            req.login(registerUser, async(err) => {
                if (err) {
                    return next(err);
                } else {
                    const list=await Job.find({});
                    const admi= req.user||null;
                    res.render("home/home1.ejs", {list, admi});

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
    //console.log(req.user);
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
        //const url = req.file.path;
        //const filename = req.file.filename;
        const { fullName,email,phone,jobTitle,jobType,location,expectedSalary,resume,url,coverLetter,submittedAt,jobId} = req.body;
        const newApplicant = new Applicant({
            fullName,email,phone,jobTitle,jobType,location,expectedSalary,resume,url,coverLetter,submittedAt,jobId
        });


       // newApplicant.resume = { url, filename };
        await newApplicant.save();
        //const id= await newApplicant._id;
        const user = await User.findById(req.user._id);
        user.applicantId = newApplicant._id; // Set applicantId for the user
        await user.save();
        
        res.redirect("/success");
    } catch (error) {
        res.send(error);
    }
  })

  app.get("/preview/:id",isLoggedIn, async(req,res)=>{
            try {
                const id= req.params.id;
                const applicant= await Job.findById(id);
                const admi= req.user||null;
                res.render("preview/preview.ejs",{applicant,admi,user:req.user});
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

  app.get("/job-posting",isLoggedIn,isAdmin, (req,res)=>{
    const admi= req.user||null;
    res.render("job-posting/job-posting.ejs",{admi});
  })

  app.get("/job-posting/:id",isLoggedIn, async(req,res)=>{
    try {
        const id = req.params.id;
    const job= await Job.findById(id);
    const admi= req.user||null;
    res.render("show-job/show-job.ejs",{job, user:req.user, admi});
    } catch (error) {
        res.send(error);
    }
})

app.delete("/job-posting/job-apply/:id", isLoggedIn,isAdmin, async(req,res)=>{
    try {
        const id = req.params.id;
    await Job.findByIdAndDelete(id); 
    res.redirect("/");
    } catch (error) {
        res.send(error);
    }
})

  app.post("/job-posting",isLoggedIn,isAdmin,async(req,res)=>{
    try {
        const {jobTitle,companyName,companyWebsite,jobCategory,jobType,jobLocation,salaryRange,experince,qualification,applicationDeadline,applicationLink,jobDescription,createdAt}=req.body;
    const listing= await new Job({jobTitle,companyName,companyWebsite,jobCategory,jobType,jobLocation,salaryRange,experince,qualification,applicationDeadline,applicationLink,jobDescription,createdAt});
    await listing.save();
    
    const list=await Job.find({});
    const admi= req.user||null;
    res.redirect("/");
    } catch (error) {
        res.send(error);
    }
  })

  app.get("/job-posting/job-apply/:id", isLoggedIn, async(req,res)=>{
    try {
        const id = req.params.id;
    const job= await Job.findById(id);
    const admi= req.user||null;
    res.render("job/job.ejs",{job,admi});
    } catch (error) {
        res.send(error);
    }
  })
  


app.listen(port, '0.0.0.0' , () => {
    console.log(`server running on port: ${port} `);
});
