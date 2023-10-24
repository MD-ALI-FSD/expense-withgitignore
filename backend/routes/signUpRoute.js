const express = require("express");
const router = express.Router();
//importing controllers from 'products.js' file.
const signupController = require("../controller/signupController");

//middleware to validate tokenised user-id received as a header in the GET request
const userAuthentication = require("../../middleware/auth");


router.post("/user/signup", signupController.postAddUser);

router.get("/user/get-user", signupController.getUsers);

router.delete("/user/delete-user", userAuthentication.authenticate, signupController.postDeleteUser);

// router.put("/user/edit-user/:userId", userController.postEditUser);

module.exports = router;
