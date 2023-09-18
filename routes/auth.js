const express = require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRECT = "Jwtisthekey";
const fetchuser = require('../middleware/fetchuser')
//Create a User using : POST "/api/auth/" . Doesn't require auth
router.post('/', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Enter a valid password').isLength({ min: 5 }),
], async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
    }
    console.log(request.body);

    const salt = await bcrypt.genSalt(10); // We dont store the salt in db . Bcrypt does it itself
    //genSalt returns a Promise that is the reason we have to give await
    secPass = await bcrypt.hash(request.body.password, salt);


    //const user = User(request.body);
    user = await User.create({
        name: request.body.name,
        email: request.body.email,
        password: secPass,
    });

    const data = {
        user: {
            id: user.id
        }
    }

    const authToken = jwt.sign(data, JWT_SECRECT) //Synchronous method
    console.log(authToken);
    //response.json(user);

    response.json({ authToken });
    console.log("Saved");
})

//Authenticate a user using pOST "/api/auth/login".

router.post('/login',
    [body('email', 'Enter a valid email').isEmail(),
    body('password', "password cannot be blank").exists()],
    async (request, response) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        const { email, password } = request.body;
        try {
            let user = await User.findOne({ email });

            if (user.email !== email) {
                return response.status(400).json({ error: "Inncorrect credentials" })
            }

            const passwordCompare = await bcrypt.compare(password, user.password);

            if (!passwordCompare) {
                return response.status(400).json({ error: "Inncorrect credentials" })
            }

            const payload = {
                user: {
                    id: user.id
                }
            }
            const authToken = jwt.sign(payload, JWT_SECRECT) //Synchronous method
            console.log(authToken);

            response.json({ authToken });
            console.log("Authenticated");

        }
        catch (error) {
            console.error(error.message);
            response.json("Internal Server Error");
        }


    })


// get logged in User details using POST : "/api/auth/getuser". Login required
//decode the Auth Token.. and get the user id
//once we get the user Id we can get the details 
router.post('/getuser', fetchuser,
    async (request, response) => {

        try {
            userId = request.user.id;
            const user = await User.findById(userId).select("-password"); //why -password
            response.send(user);
        } catch (error) {
            console.error(error.message);
            response.json("Internal Server Error");
        }

    })



module.exports = router