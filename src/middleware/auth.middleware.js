import jwt from "jsonwebtoken";
import User from "../models/User.js";
import "dotenv";

const protectRoute = async (req, res, next) => {
  try {
    // get token
    const token = req.headers("Authoization").replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No authentication token, access denied",
      });
    }
    // decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // get the user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Token is not valid" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Token is not valid" });
  }
};

export default protectRoute;
