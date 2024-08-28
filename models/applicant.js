const mongoose= require("mongoose");
const Schema= mongoose.Schema;

const applicantSchema= new Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
    contact:Number,
    education: String,
    state: String,
    country: String,
    job:String,
    skill:String,
    resume:{
        url: String,
        filename:String,    
    },
});


const Applicant = mongoose.model("Applicant", applicantSchema);
module.exports = Applicant;