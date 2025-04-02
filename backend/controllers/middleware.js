import jwt from "jsonwebtoken";

const isLoggedIn = async (req, res, next) => {
    try {
        // Checking if authorization token is received
        if (req.headers.authorization) {
            // Split bearer token
            const token = req.headers.authorization.split(" ")[1];
            if (token) {
                // Verify JWT token
                // If passed, proceed to the API call
                const payload = await jwt.verify(token, process.env.SECRET_JWT_CODE || "qwertyuiojhgf");
                if (payload) {
                    req.user = payload;  // Attach user info to the request object
                    next();  // Proceed to the next middleware or route handler
                } else {
                    res.status(400).json({ error: "Token verification failed" });
                }
            } else {
                res.status(400).json({ error: "Malformed authorization header" });
            }
        } else {
            res.status(400).json({ error: "No authorization header" });
        }
    } catch (error) {
        res.status(400).json({ error: error.message || "An error occurred" });
    }
};

export default isLoggedIn;
