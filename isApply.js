const User = require("./models/user");

const isApply = async (req, res, next) => {
    try {
        
        const user = await User.findById(req.user._id);
        //console.log(user.applicantId);

        if (user && user.applicantId) {
            next(); // User has applied for a job, proceed to the dashboard
        } else {
            // User hasn't applied for any jobs, redirect with a message
            res.send("Apply for job first then check dashboard"); // Redirect to a page with a message
        }
    } catch (error) {
        console.error("Error checking applications:", error);
        res.status(500).send("Server error");
    }
};

module.exports = isApply;
