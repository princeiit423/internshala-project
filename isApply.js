const User = require("./models/user");

const isApply = async (req, res, next) => {
    try {
        // Find the user by ID (assuming user is authenticated and their ID is in req.user)
        const user = await User.findById(req.user._id);

        // Check if the user has any applications in applicantIds array
        if (user && user.applicantIds && user.applicantIds.length > 0) {
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
