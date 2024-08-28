const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const Applicant = require("./models/applicant.js");
isLoggedIn= require("./middleware.js");
const path = require("path");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

port = 4000;

const multer = require("multer");
const { storage } = require("./cloudConfig.js");

const upload = multer({ storage });


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
//app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
//app.use(bodyParser.urlencoded({ extended: true }));

dbUrl = "mongodb+srv://princeiit423:<db_password>@apitest.ujeqft9.mongodb.net/?retryWrites=true&w=majority&appName=apiTest"
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

app.get("/", (req, res) => {
    res.render("home/home.ejs");
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

try {
    app.post("/signup", async (req, res) => {
        let { username, email, password } = req.body;
        console.log(req.body);
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
    });
} catch (error) {
    next(err);
}

app.get("/login", (req, res) => {
    res.render("login/login.ejs");
});

app.post(
    "/login",
    passport.authenticate("local", { failureRedirect: "/login" }),
    (req, res) => {
        res.redirect("/");
    }
);

app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        } else {
            return res.redirect("/login");
        }
    });
});

app.get("/applicant", isLoggedIn, (req, res) => {
    res.render("job/job.ejs");
})

app.post("/applicant",isLoggedIn,upload.single("resume"), async(req, res) => {
    try {
        const url = req.file.path;
        const filename = req.file.filename;
        const { name, description, resume, education, state, country, job, skill } = req.body;
        const newApplicant = new Applicant({
            name, description, resume, education, state, country, job, skill
        });

        newApplicant.resume = { url, filename };
        await newApplicant.save();
        const id= await newApplicant._id;
        res.redirect(`/preview/${id}`);
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
app.listen(port, (req, res) => {
    console.log(`server running on port: ${port} `);
});