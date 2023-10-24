const express = require("express");
const router = express.Router();
//importing controllers from 'products.js' file.
const loginController = require("../controller/loginController");
//middleware to validate tokenised user-id received as a header in the GET request
const userAuthentication = require("../../middleware/auth");


router.post("/user/login", loginController.postVerifyUser);

router.post("/user/forgotpassword", loginController.postForgotPassword);


module.exports = router;
