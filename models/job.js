const mongoose= require("mongoose");
const Schema= mongoose.Schema;

const jobSchema= new Schema({
    jobTitle: {
        type: String,
        required: true,
    },
    companyName: String,
    location:String,
    description: String,
    salary: String,
    country: String,
    jobType:String,
    skill:String,
});


const job = mongoose.model("job", jobSchema);
module.exports = job;