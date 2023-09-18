const jwt = require('jsonwebtoken');
const JWT_SECRECT = "Jwtisthekey"; // Generally should be given as an environment variable
//next will take a middleware
const fetchuser = (request, response, next) => {
    //Get the user from the jwt token and add id to req object
    const token = request.header('auth-token');
    console.log(token);
    if (!token) {
        response.status(401).send({ error: "Please authenticate using valid token" });
    }
    try {
        const data = jwt.verify(token, JWT_SECRECT);
        request.user = data.user;
        next();
    } catch (error) {
        response.status(401).send({ error: "Please authenticate using valid token" });
    }
}

module.exports = fetchuser;