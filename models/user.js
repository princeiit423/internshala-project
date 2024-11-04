const express= require("express");
const mongoose= require("mongoose");
const passportLocalMongoose= require("passport-local-mongoose");

const userSchema= new mongoose.Schema({
    email:{
        type:String,
        
    },
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Applicant" // Reference to Applicant model
    },
    createdAt: {
        type: Date,
        default: Date.now
      }
});
userSchema.plugin(passportLocalMongoose);

module.exports= mongoose.model("user", userSchema);