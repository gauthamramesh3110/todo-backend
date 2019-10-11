const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.token;
        console.log(token);
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        console.log(decoded);
        req.userData = decoded;
        next();
    } catch{
        return res.status(401).json({
            success: false,
            message: "Authentication failed"
        });
    }
}