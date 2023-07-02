import jwt from "jsonwebtoken"

export const verifyToken = (req, res, next) => {

    
  const token = req.cookies.access_token;
  

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRETE);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
